const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '';

// Pi will advertises BLE service/characteristic UUIDs
const SERVICE_UUID = '12345678-1234-5678-9abc-123456789abc';
const WIFI_CONFIG_CHAR_UUID = '12345678-1234-5678-9abc-123456789abd';

class DeviceSetupManager {
  constructor() {
    this.currentStep = 1;
    this.deviceInfo = null;
    this.bleDevice = null;
    this.setupSteps();
    this.bindEvents();
  }

  setupSteps() {
    this.steps = {
      1: { title: 'Register Device', template: 'step-register' },
      2: { title: 'Bluetooth Pairing', template: 'step-bluetooth' },
      3: { title: 'Wi-Fi Configuration', template: 'step-wifi' },
      4: { title: 'Activation', template: 'step-activation' },
      5: { title: 'Complete', template: 'step-complete' }
    };
  }

  bindEvents() {
    document.getElementById('register-form')?.addEventListener('submit', (e) => this.registerDevice(e));
    document.getElementById('pair-btn')?.addEventListener('click', () => this.startBluetooth());
    document.getElementById('send-wifi-btn')?.addEventListener('click', () => this.sendWifiConfig());
    document.getElementById('test-connection-btn')?.addEventListener('click', () => this.testConnection());
  }

  async registerDevice(e) {
    e.preventDefault();
    const serial = document.getElementById('device-serial').value;
    if (!serial) return this.showError('Enter device serial');

    try {
      this.showLoading('Registering device...');
      const response = await fetch(`${API_BASE}/rfid/device/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.authManager.token}`
        },
        body: JSON.stringify({ serialNumber: serial, deviceName: 'Smart Wardrobe Pi' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      this.deviceInfo = data.device;
      this.showSuccess('Device registered successfully!');
      this.nextStep();
    } catch (error) {
      this.showError(error.message);
    }
  }

  async startBluetooth() {
    if (!navigator.bluetooth) return this.showError('Web Bluetooth not supported');

    try {
      this.showLoading('Scanning for Pi device...');
      
      this.bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'SmartWardrobe' }],
        optionalServices: [SERVICE_UUID]
      });

      const server = await this.bleDevice.gatt.connect();
      this.bleService = await server.getPrimaryService(SERVICE_UUID);
      this.wifiCharacteristic = await this.bleService.getCharacteristic(WIFI_CONFIG_CHAR_UUID);

      this.showSuccess('Connected to Pi via Bluetooth!');
      this.nextStep();
    } catch (error) {
      this.showError(`Bluetooth error: ${error.message}`);
    }
  }

  async sendWifiConfig() {
    const ssid = document.getElementById('wifi-ssid').value;
    const password = document.getElementById('wifi-password').value;
    
    if (!ssid || !password) return this.showError('Enter Wi-Fi credentials');

    try {
      this.showLoading('Sending Wi-Fi configuration...');

      const config = {
        ssid,
        password,
        apiKey: this.deviceInfo.apiKey,
        deviceSerial: this.deviceInfo.serialNumber,
        backendUrl: API_BASE
      };

      const data = new TextEncoder().encode(JSON.stringify(config));
      await this.wifiCharacteristic.writeValue(data);

      // Confirming with backend
      await fetch(`${API_BASE}/rfid/device/${this.deviceInfo.serialNumber}/wifi-confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, security: 'WPA2' })
      });

      this.showSuccess('Wi-Fi configuration sent!');
      this.nextStep();
    } catch (error) {
      this.showError(`Configuration error: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      this.showLoading('Testing Pi connection...');
      
      const response = await fetch(`${API_BASE}/rfid/status`, {
        headers: { 'Authorization': `Bearer ${window.authManager.token}` }
      });

      const status = await response.json();
      if (status.hasDevice && status.device.status === 'active') {
        this.showSuccess('Pi is online and active!');
        this.nextStep();
      } else {
        this.showError('Pi not yet active. Check Wi-Fi connection.');
      }
    } catch (error) {
      this.showError(`Connection test failed: ${error.message}`);
    }
  }

  nextStep() {
    if (this.currentStep < 5) {
      this.currentStep++;
      this.renderStep();
    }
  }

  renderStep() {
    const container = document.getElementById('setup-container');
    const step = this.steps[this.currentStep];
    document.getElementById('step-title').textContent = step.title;
  }

  showLoading(message) {
    document.getElementById('status').innerHTML = `<div class="text-info">${message}</div>`;
  }

  showSuccess(message) {
    document.getElementById('status').innerHTML = `<div class="text-success">${message}</div>`;
  }

  showError(message) {
    document.getElementById('status').innerHTML = `<div class="text-danger">${message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.deviceSetup = new DeviceSetupManager();
});