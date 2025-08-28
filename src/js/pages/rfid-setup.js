const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:3001' 
  : '';

class RfidSetupManager {
  constructor() {
    this.deviceInfo = null;
    this.bleDevice = null;
    this.serviceUUID = '12345678-1234-5678-9abc-123456789abc';
    this.deviceInfoCharUUID = '12345678-1234-5678-9abc-123456789abe';
    this.wifiCharUUID = '12345678-1234-5678-9abc-123456789abd';
    const pairBtn = document.getElementById('pair-btn');
    if (pairBtn) {
      pairBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        try {
          // Immediately call requestDevice inside the click handler (user gesture)
          const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'SmartWardrobe' }],
            optionalServices: [this.serviceUUID]
          });
          // store device so bluetoothPairAndSend won't call requestDevice again
          this.bleDevice = device;

          // Continue the pairing/handshake flow (async, not part of the user gesture)
          // any errors will be handled inside bluetoothPairAndSend
          await this.bluetoothPairAndSend(null /* no apiKey yet */);
        } catch (err) {
          console.error('[RFID-BLE] Pair button handler error:', err);
          // avoid throwing which could be noisy; let UI show message via device-setup.js
        }
      });
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
    let device = this.bleDevice || null;
    let createdHere = false;

    // Always request a fresh device to avoid stale connections
    if (!device || !device.gatt) {
      try {
        log('Requesting new device...');
        device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: 'SmartWardrobe' }],
          optionalServices: [this.serviceUUID]
        });
        this.bleDevice = device;
        createdHere = true;
      } catch (err) {
        console.warn('[RFID-BLE] Specific filter failed, trying acceptAllDevices', err);
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [this.serviceUUID]
        });
        this.bleDevice = device;
        createdHere = true;
      }
    }

    // Enhanced connection management
    let connectionAttempts = 0;
    const maxConnectionAttempts = 3;
    
    const connectWithRetry = async () => {
      for (let attempt = 0; attempt < maxConnectionAttempts; attempt++) {
        connectionAttempts++;
        log(`Connection attempt ${attempt + 1}/${maxConnectionAttempts}`);
        
        try {
          // Ensure clean state
          if (device.gatt && device.gatt.connected) {
            log('Device already connected, disconnecting first');
            device.gatt.disconnect();
            await wait(1000); // Wait for clean disconnect
          }

          log('Attempting to connect...');
          const server = await device.gatt.connect();
          
          // Verify connection is stable
          await wait(2000); // Longer stabilization time
          
          if (!server.connected) {
            throw new Error('Connection lost immediately after connect');
          }
          
          log('Connection stable, proceeding...');
          return server;
          
        } catch (err) {
          log(`Attempt ${attempt + 1} failed:`, err.message);
          
          if (attempt === maxConnectionAttempts - 1) {
            throw new Error(`Failed to establish stable connection after ${maxConnectionAttempts} attempts: ${err.message}`);
          }
          
          // Progressive backoff delay
          const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
          log(`Waiting ${delay}ms before retry...`);
          await wait(delay);
        }
      }
    };

    const server = await connectWithRetry();
    
    // Service discovery with retry
    log('Discovering services...');
    let service;
    let serviceAttempts = 0;
    const maxServiceAttempts = 3;
    
    while (serviceAttempts < maxServiceAttempts) {
      try {
        service = await server.getPrimaryService(this.serviceUUID);
        log('Service discovered successfully');
        break;
      } catch (err) {
        serviceAttempts++;
        log(`Service discovery attempt ${serviceAttempts} failed:`, err.message);
        
        if (serviceAttempts === maxServiceAttempts) {
          throw new Error(`Service discovery failed after ${maxServiceAttempts} attempts. Check if BLE service is properly registered on Pi.`);
        }
        
        await wait(1000 * serviceAttempts); // Progressive delay
      }
    }

    // Read device info with better error handling
    const readDeviceInfo = async () => {
      try {
        log('Reading device info...');
        const deviceInfoChar = await service.getCharacteristic(this.deviceInfoCharUUID);
        const data = await deviceInfoChar.readValue();
        const decoder = new TextDecoder();
        const deviceData = JSON.parse(decoder.decode(data));
        log('Device info read successfully:', deviceData);
        return deviceData;
      } catch (err) {
        log('Failed to read device info:', err.message);
        throw new Error(`Cannot read device information: ${err.message}`);
      }
    };

    const deviceData = await readDeviceInfo();
    this.deviceInfo = deviceData;

    // Send WiFi config if provided
    if (wifiPayload) {
      try {
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
        
        // Give device time to process
        await wait(2000);
        
      } catch (err) {
        log('Failed to send WiFi config:', err.message);
        throw new Error(`Failed to send WiFi configuration: ${err.message}`);
      }
    }

    // Clean disconnect
    try {
      log('Disconnecting...');
      await wait(500); // Give time for any pending operations
      if (server.connected) {
        device.gatt.disconnect();
        log('Disconnected cleanly');
      }
    } catch (err) {
      console.warn('Non-fatal disconnect error:', err);
    }

    return { success: true, deviceData };
    
  } catch (err) {
    console.error('Bluetooth operation failed:', err);
    
    // Enhanced error messages for common issues
    let errorMessage = err.message;
    if (err.message.includes('GATT Server is disconnected')) {
      errorMessage = 'Device disconnected unexpectedly. Please check if the Raspberry Pi Bluetooth service is running properly.';
    } else if (err.message.includes('Service discovery failed')) {
      errorMessage = 'Cannot find BLE service on device. Please restart the Raspberry Pi BLE server and try again.';
    } else if (err.message.includes('User cancelled')) {
      errorMessage = 'Bluetooth pairing was cancelled.';
    }
    
    throw new Error(`Bluetooth error: ${errorMessage}`);
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
              
              modalEl.querySelector('.rfid-scan-status').style.display = 'none';
              modalEl.querySelector('.rfid-scan-success').style.display = '';
              
              if (onSuccess) onSuccess(tag, result);
              
              setTimeout(() => modal.hide(), 1500);
              return;
            }
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