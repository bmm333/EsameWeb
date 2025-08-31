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
  async connectFromModal() {
    const piIP = document.getElementById('piIpInput').value.trim();
    if (!piIP) {
      alert('Please enter an IP address');
      return;
    }

    try {
      await this.connectViaHTTP(piIP);
      const modal = bootstrap.Modal.getInstance(document.getElementById('piIpModal'));
      modal.hide();
      
      if (this.ipInputResolve) {
        this.ipInputResolve();
      }
    } catch (error) {
      alert('Connection failed: ' + error.message);
      if (this.ipInputReject) {
        this.ipInputReject(error);
      }
    }
  }
  async connectViaHTTP(piIP) {
    console.log('[Device] Connecting via HTTP to:', piIP);
    
    try {
      // Test connection and get device info
      const response = await fetch(`http://${piIP}:8080/api/device-info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const deviceData = await response.json();
      this.deviceInfo = deviceData;
      this.httpDiscoveryMode = true;
      this.piIP = piIP;

      console.log('[Device] HTTP connection successful:', deviceData);
      return { success: true, deviceData };

    } catch (error) {
      console.error('[Device] HTTP connection failed:', error);
      throw new Error(`Cannot connect to Pi at ${piIP}:8080 - ${error.message}`);
    }
  }

  async sendWifiViaHTTP(wifiConfig) {
    if (!this.httpDiscoveryMode || !this.piIP) {
      throw new Error('Not connected via HTTP');
    }

    try {
      const response = await fetch(`http://${this.piIP}:8080/api/wifi-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wifiConfig,
          backendUrl: API_BASE
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[Device] WiFi sent via HTTP:', result);
      return result;

    } catch (error) {
      console.error('[Device] HTTP WiFi send failed:', error);
      throw new Error(`Failed to send WiFi config: ${error.message}`);
    }
  }
  async sendWifiConfiguration(apiKey, wifiPayload) {
    if (this.httpDiscoveryMode) {
      return await this.sendWifiViaHTTP(wifiPayload);
    } else {
      return await this.bluetoothPairAndSend(apiKey, wifiPayload);
    }
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

    const wait = ms => new Promise(res => setTimeout(res, ms));
    const log = (...args) => console.debug('[RFID-BLE]', ...args);

    try {
      let device = this.bleDevice;

      // Request device with improved filters
      if (!device) {
        try {
          log('Requesting device with namePrefix filter...');
          device = await navigator.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'SmartWardrobe' },
              { namePrefix: 'SmartWardrobe-Pi' },
              { services: [this.serviceUUID] }
            ],
            optionalServices: [this.serviceUUID]
          });
          this.bleDevice = device;
        } catch (err) {
          console.warn('[RFID-BLE] Specific filters failed, trying acceptAllDevices:', err);
          device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [this.serviceUUID]
          });
          this.bleDevice = device;
        }
      }

      // Connection with retry logic
      log('Connecting to device:', device.name);
      
      if (device.gatt.connected) {
        device.gatt.disconnect();
        await wait(1000);
      }

      const server = await device.gatt.connect();
      await wait(2000); // Stabilization time

      if (!server.connected) {
        throw new Error('Connection lost immediately after connect');
      }

      // Service discovery
      log('Discovering service:', this.serviceUUID);
      const service = await server.getPrimaryService(this.serviceUUID);
      
      // Read device info
      log('Reading device information...');
      const deviceInfoChar = await service.getCharacteristic(this.deviceInfoCharUUID);
      const data = await deviceInfoChar.readValue();
      const decoder = new TextDecoder();
      const deviceData = JSON.parse(decoder.decode(data));
      
      this.deviceInfo = deviceData;
      log('Device info received:', deviceData);

      // Send WiFi config if provided
      if (wifiPayload) {
        log('Sending WiFi configuration...');
        const wifiChar = await service.getCharacteristic(this.wifiCharUUID);
        const payload = JSON.stringify({ 
          apiKey: apiKey || deviceData?.apiKey, 
          wifi: wifiPayload, 
          backendUrl: API_BASE 
        });
        
        const encoder = new TextEncoder();
        await wifiChar.writeValue(encoder.encode(payload));
        log('WiFi configuration sent successfully');
        await wait(2000);
      }

      // Clean disconnect
      if (server.connected) {
        device.gatt.disconnect();
      }

      return { success: true, deviceData };
      
    } catch (err) {
      console.error('Bluetooth operation failed:', err);
      
      // Enhanced error messages
      let errorMessage = err.message;
      if (err.message.includes('User cancelled')) {
        errorMessage = 'Device selection was cancelled. Please try again and select your SmartWardrobe device.';
      } else if (err.message.includes('GATT Server is disconnected')) {
        errorMessage = 'Device disconnected. Please check if your Pi is powered on and Bluetooth is working.';
      } else if (err.message.includes('Service discovery failed')) {
        errorMessage = 'Cannot find the required service on the device. Please restart your Pi device server.';
      }
      
      throw new Error(errorMessage);
    }
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