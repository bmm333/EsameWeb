const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3002' 
  : '';

class RfidSetupManager {
  constructor() {
    this.deviceInfo = null;
    this.bleDevice = null;
    this.serviceUUID = '12345678-1234-5678-9abc-123456789abc';
    this.deviceInfoCharUUID = '12345678-1234-5678-9abc-123456789abe';
    this.wifiCharUUID = '12345678-1234-5678-9abc-123456789abd';
    this.httpDiscoveryMode = false;
    this.setupPairButton();
  }

  setupPairButton() {
    const pairBtn = document.getElementById('pair-btn');
    if (pairBtn) {
      pairBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        try {
          // Try BLE first, then fallback to HTTP discovery
          await this.discoverAndPair();
        } catch (err) {
          console.error('[Device] Pairing error:', err);
          throw err; // Let device-setup.js handle the error display
        }
      });
    }
  }

  async discoverAndPair() {
    // Try Web Bluetooth first
    try {
      console.log('[Device] Attempting Web Bluetooth discovery...');
      await this.bluetoothPairAndSend(null);
      return;
    } catch (bleError) {
      console.warn('[Device] Web Bluetooth failed:', bleError.message);
      
      // Fallback to HTTP discovery
      console.log('[Device] Trying HTTP discovery fallback...');
      await this.httpDiscoveryFallback();
    }
  }

  async httpDiscoveryFallback() {
    const piIPInput = document.getElementById('pi-ip-input');
    
    if (!piIPInput) {
      // Create IP input modal
      this.showIPInputModal();
      return new Promise((resolve, reject) => {
        this.ipInputResolve = resolve;
        this.ipInputReject = reject;
      });
    }
    
    const piIP = piIPInput.value.trim();
    if (!piIP) {
      throw new Error('Please enter your Raspberry Pi IP address');
    }

    await this.connectViaHTTP(piIP);
  }

  showIPInputModal() {
    const modalHtml = `
      <div class="modal fade" id="piIpModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Connect via IP Address</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="text-muted mb-3">Web Bluetooth couldn't find your device. Let's connect directly via IP address.</p>
              <div class="mb-3">
                <label for="piIpInput" class="form-label">Raspberry Pi IP Address</label>
                <input type="text" class="form-control" id="piIpInput" placeholder="192.168.1.100">
                <div class="form-text">
                  Find your Pi's IP by running: <code>hostname -I</code>
                </div>
              </div>
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Make sure your Pi is on the same network and the device server is running.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="window.rfidSetup.connectFromModal()">Connect</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('piIpModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('piIpModal'));
    modal.show();

    // Handle modal close
    document.getElementById('piIpModal').addEventListener('hidden.bs.modal', () => {
      if (this.ipInputReject) {
        this.ipInputReject(new Error('IP input cancelled'));
      }
    });
  }

  async loadRfidModalHtml() {
    if (document.getElementById('rfidScanModal')) return;
    try {
      const res = await fetch('/rfid-scan-modal.html');
      const html = await res.text();
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (err) {
      console.warn('Could not load rfid-scan-modal.html:', err);
      this.createRfidModalFallback();
    }
  }

  createRfidModalFallback() {
    const modalHtml = `
      <div class="modal fade" id="rfidScanModal" tabindex="-1" aria-labelledby="rfidScanModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="rfidScanModalLabel">Scan RFID Tag</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <div class="rfid-scan-animation">
                <div class="rfid-scan-icon">
                  <i class="bi bi-broadcast"></i>
                </div>
              </div>
              <h4 class="mt-4">Waiting for RFID Tag</h4>
              <p class="text-muted">Please place an unused RFID tag on the reader to associate it with your item</p>
              <div class="rfid-scan-status mt-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Scanning...</p>
              </div>
              <div class="rfid-scan-success mt-4" style="display: none;">
                <i class="bi bi-check-circle-fill text-success fs-1"></i>
                <p class="mt-2">RFID tag successfully associated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

    async openScanModalAndAssociate(itemId, onSuccess = null) {
        await this.loadRfidModalHtml();
        const token = window.authManager?.token;
        if (!token) throw new Error('Authentication required');

        const modalEl = document.getElementById('rfidScanModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

        modalEl.querySelector('.rfid-scan-status').style.display = '';
        modalEl.querySelector('.rfid-scan-success').style.display = 'none';

        modal.show();

        let stopped = false;
        const stopPolling = () => { stopped = true; };

        modalEl.addEventListener('hidden.bs.modal', stopPolling, { once: true });

        const associateWithPossibleOverride = async (tag, forceOverride = false) => {
            const assocResponse = await fetch(`${API_BASE}/rfid/tags/${encodeURIComponent(tag.tagId)}/associate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ itemId, forceOverride })
            });

            const payload = await assocResponse.json().catch(() => ({}));
            if (assocResponse.ok && payload?.success) {
                modalEl.querySelector('.rfid-scan-status').style.display = 'none';
                modalEl.querySelector('.rfid-scan-success').style.display = '';
                if (onSuccess) onSuccess(tag, payload);
                setTimeout(() => modal.hide(), 1500);
                return true;
            }

            // Handle conflict flow from backend contract
            if (payload?.requiresConfirmation) {
                const msg = payload?.message || 'This tag is already assigned. Do you want to override it?';
                const confirmed = window.confirm(msg);
                if (confirmed) {
                    // Retry with forceOverride = true
                    return await associateWithPossibleOverride(tag, true);
                }
                // user cancelled: just keep scanning
                return false;
            }

            // Non-OK without requiresConfirmation ==> keep scanning
            console.warn('RFID associate failed:', payload);
            return false;
        };

        const pollForTags = async () => {
            if (stopped) return;

            try {
                const response = await fetch(`${API_BASE}/rfid/tags/unassociated`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const tags = await response.json();
                    if (Array.isArray(tags) && tags.length > 0) {
                        const tag = tags[0];
                        const done = await associateWithPossibleOverride(tag, false);
                        if (done) return; // stop polling if successfully associated (or after modal hides)
                    }
                }
            } catch (err) {
                console.warn('Polling for tags failed:', err);
            }

            setTimeout(pollForTags, 2000);
        };

        pollForTags();
        return modal;
    }


    async getDeviceStatus() {
    const token = window.authManager?.token;
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE}/rfid/devices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get device status');
    }

    return response.json();
  }

  async getUnassociatedTags() {
    const token = window.authManager?.token;
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE}/rfid/tags/unassociated`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get unassociated tags');
    }

    return response.json();
  }

  async getUserTags() {
    const token = window.authManager?.token;
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE}/rfid/tags`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user tags');
    }

    return response.json();
  }
}

// Export for global use
window.rfidSetup = new RfidSetupManager();
export default RfidSetupManager;