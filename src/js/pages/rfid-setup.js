const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3001' 
  : '';
class RfidSetupManager {
  constructor() {
    this.deviceInfo = null;
    this.bleDevice = null;
    this.serviceUUID = '12345678-1234-5678-9abc-123456789abc';
    this.wifiCharUUID = '12345678-1234-5678-9abc-123456789abd';
  }

  async loadRfidModalHtml() {
    if (document.getElementById('rfidScanModal')) return;
    try {
      const res = await fetch('/rfid-scan-modal.html');
      const html = await res.text();
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (err) {
      console.warn('Could not load rfid-scan-modal.html:', err);
      // Fallback - create modal programmatically
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

  async registerDevice(serial, macAddress = null) {
    const token = window.authManager?.token;
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`${API_BASE}/rfid/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        serialNumber: serial, 
        macAddress,
        deviceName: 'Smart Wardrobe Pi' 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async confirmWiFi(serial, wifiConfig) {
    const response = await fetch(`${API_BASE}/rfid/device/${encodeURIComponent(serial)}/wifi-confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wifiConfig)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'WiFi confirmation failed');
    }

    return response.json();
  }

  async activateDevice(serial, ipAddress = null) {
    const response = await fetch(`${API_BASE}/rfid/device/${encodeURIComponent(serial)}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ipAddress })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Device activation failed');
    }

    return response.json();
  }

  async bluetoothPairAndSend(apiKey, wifiPayload = null) {
    if (!navigator.bluetooth) throw new Error('Web Bluetooth not available');

    try {
      // First, try to discover devices with our service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'SmartWardrobe' }],
        optionalServices: [this.serviceUUID]
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(this.serviceUUID);
      const deviceInfoChar = await service.getCharacteristic('12345678123456789abc123456789abe'); // Device info UUID
      const deviceInfoData = await deviceInfoChar.readValue();
      const decoder = new TextDecoder();
      const deviceData = JSON.parse(decoder.decode(deviceInfoData));
      console.log('Device info received:', deviceData);
      if (!this.deviceInfo) {
        try {
          const registerResult = await this.registerDevice(deviceData.serialNumber, deviceData.macAddress);
          this.deviceInfo = registerResult.device;
        } catch (regError) {
          console.warn('Auto-registration failed:', regError);
        }
      }
      const wifiChar = await service.getCharacteristic(this.wifiCharUUID);
      const payload = JSON.stringify({ 
        apiKey: apiKey || this.deviceInfo?.apiKey, 
        wifi: wifiPayload,
        backendUrl: API_BASE
      });
      
      const encoder = new TextEncoder();
      await wifiChar.writeValue(encoder.encode(payload));
      
      await server.disconnect();
      return { success: true, deviceData };
    } catch (err) {
      console.error('Bluetooth pairing failed:', err);
      throw new Error(`Bluetooth pairing failed: ${err.message}`);
    }
  }

  async openScanModalAndAssociate(itemId, onSuccess = null) {
    await this.loadRfidModalHtml();
    const token = window.authManager?.token;
    if (!token) throw new Error('Authentication required');

    const modalEl = document.getElementById('rfidScanModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    
    // Reset modal state
    modalEl.querySelector('.rfid-scan-status').style.display = '';
    modalEl.querySelector('.rfid-scan-success').style.display = 'none';
    
    modal.show();

    let stopped = false;
    const stopPolling = () => { stopped = true; };
    
    modalEl.addEventListener('hidden.bs.modal', stopPolling, { once: true });

    // Poll for unassociated tags
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
            
            // Associate tag with item
            const assocResponse = await fetch(`${API_BASE}/rfid/tags/${encodeURIComponent(tag.tagId)}/associate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ itemId })
            });

            if (assocResponse.ok) {
              const result = await assocResponse.json();
              
              // Show success state
              modalEl.querySelector('.rfid-scan-status').style.display = 'none';
              modalEl.querySelector('.rfid-scan-success').style.display = '';
              
              if (onSuccess) onSuccess(tag, result);
              
              // Auto-close after delay
              setTimeout(() => modal.hide(), 1500);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Polling for tags failed:', err);
      }

      // Continue polling
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