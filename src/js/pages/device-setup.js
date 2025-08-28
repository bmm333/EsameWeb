import RfidSetupManager from './rfid-setup.js';

class DeviceSetupManager {
  constructor() {
    this.currentStep = 1;
    this.deviceInfo = null;
    this.rfidSetup = new RfidSetupManager();
    this.init();
  }

  init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    this.bindEvents();
    this.checkExistingDevice();
    this.updateStepDisplay();
  }

  async checkExistingDevice() {
    try {
      const status = await this.rfidSetup.getDeviceStatus();
      if (status.devices && status.devices.length > 0) {
        const device = status.devices[0];
        if (device.status === 'active') {
          this.jumpToStep(4); // Already setup 
        } else {
          this.deviceInfo = device;
          this.updateDeviceInfo();
          // If device exists but not active, start from Wi-Fi step
          if (device.status === 'registered') {
            this.jumpToStep(2);
          }
        }
      }
    } catch (error) {
      console.log('No existing device found or backend not available:', error.message);
    }
  }

    bindEvents() {
      document.getElementById('pair-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      this.showLoading('Starting Bluetooth pairing...');
      try {
        await this.startBluetooth();
      } catch (err) {
        this.showError(err.message || 'Bluetooth pairing failed');
      }
    });
    document.getElementById('send-wifi-btn')?.addEventListener('click', () => this.sendWifiConfig());
    document.getElementById('test-connection-btn')?.addEventListener('click', () => this.testConnection());
  }

  async startBluetooth() {
    if (!navigator.bluetooth) {
      return this.showError('Web Bluetooth not supported in this browser');
    }
    try {
      this.showLoading('Scanning for your device...');
      
      // Discover and register device automatically
      const result = await this.rfidSetup.bluetoothPairAndSend(null); // No API key yet
      
      if (result.success && result.deviceData) {
        this.deviceInfo = result.deviceData;
        this.showSuccess(`Device ${result.deviceData.serialNumber} discovered and registered!`);
        this.updateDeviceInfo();
        setTimeout(() => this.nextStep(), 1500);
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  async sendWifiConfig() {
    const ssid = document.getElementById('wifi-ssid').value.trim();
    const password = document.getElementById('wifi-password').value;
    
    if (!ssid || !password) {
      return this.showError('Please enter both network name and password');
    }

    try {
      this.showLoading('Sending Wi-Fi configuration...');

      const wifiPayload = { ssid, password, security: 'WPA2' };

      // Use the appropriate method based on connection type
      if (this.rfidSetup.httpDiscoveryMode) {
        await this.rfidSetup.sendWifiViaHTTP(wifiPayload);
      } else {
        // Try Bluetooth first
        try {
          await this.rfidSetup.bluetoothPairAndSend(this.deviceInfo.apiKey, wifiPayload);
        } catch (bleError) {
          console.warn('Bluetooth send failed, using backend confirmation only');
        }
      }

      // Always confirm with backend
      await this.rfidSetup.confirmWiFi(this.deviceInfo.serialNumber, wifiPayload);

      this.showSuccess('Wi-Fi configuration sent!');
      setTimeout(() => this.nextStep(), 1500);
    } catch (error) {
      this.showError(error.message);
    }
  }

  async testConnection() {
    try {
      this.showLoading('Testing device connection...');
      
      // Poll for device status
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds total
      
      const checkStatus = async () => {
        try {
          const status = await this.rfidSetup.getDeviceStatus();
          const device = status.devices?.[0];
          
          if (device && device.isOnline && device.status === 'configuring') {
            // Device is online, activate it
            await this.rfidSetup.activateDevice(device.serialNumber, device.ipAddress);
            this.showSuccess('Device is online and activated!');
            setTimeout(() => this.nextStep(), 1500);
            return true;
          } else if (device && device.status === 'active') {
            this.showSuccess('Device is already active!');
            setTimeout(() => this.nextStep(), 1500);
            return true;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2000);
          } else {
            this.showError('Device connection timeout. Please check Wi-Fi settings.');
          }
        } catch (error) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 2000);
          } else {
            this.showError('Failed to connect to device. Please try again.');
          }
        }
      };
      
      checkStatus();
    } catch (error) {
      this.showError(error.message);
    }
  }

  nextStep() {
    if (this.currentStep < 4) { 
      this.currentStep++;
      this.updateStepDisplay();
    }
  }

  jumpToStep(step) {
    this.currentStep = step;
    this.updateStepDisplay();
  }

  updateStepDisplay() {
    // Update progress indicators
    document.querySelectorAll('.step').forEach((el, index) => {
      const stepNum = index + 1;
      el.classList.toggle('active', stepNum === this.currentStep);
      el.classList.toggle('completed', stepNum < this.currentStep);
    });

    // Update step content
    document.querySelectorAll('.setup-step').forEach((el, index) => {
      el.classList.toggle('active', index + 1 === this.currentStep);
    });

    // Clear status messages when changing steps
    this.clearStatus();
  }

  updateDeviceInfo() {
    if (this.deviceInfo) {
      // Update any displayed device information
      document.querySelectorAll('.device-serial').forEach(el => {
        el.textContent = this.deviceInfo.serialNumber;
      });
    }
  }

  showLoading(message) {
    const statusEl = document.getElementById('setup-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="alert alert-info d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          ${message}
        </div>
      `;
    }
  }

  showSuccess(message) {
    const statusEl = document.getElementById('setup-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="alert alert-success d-flex align-items-center">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
        </div>
      `;
    }
  }

  showError(message) {
    const statusEl = document.getElementById('setup-status');
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
        </div>
      `;
    }
  }

  clearStatus() {
    const statusEl = document.getElementById('setup-status');
    if (statusEl) {
      statusEl.innerHTML = '';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.deviceSetupManager = new DeviceSetupManager();
});