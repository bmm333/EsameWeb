document.addEventListener('DOMContentLoaded', () => {
  // Constants
    const API_BASE = `http://${window.location.hostname}:3001`;
    const POLL_INTERVAL = 5000;
  const MAX_POLLS = 30;

  // State management
  const state = {
    currentStep: 1,
    deviceApiKey: null,
    deviceDetails: null,
    pollingTimer: null
  };

  // DOM elements cache
  const elements = {
    stepCircles: {
      1: document.getElementById('step-circle-1'),
      2: document.getElementById('step-circle-2'),
      3: document.getElementById('step-circle-3'),
      4: document.getElementById('step-circle-4')
    },
    steps: {
      1: document.getElementById('step-1'),
      2: document.getElementById('step-2'),
      3: document.getElementById('step-3'),
      4: document.getElementById('step-4')
    },
    buttons: {
      step1Continue: document.getElementById('step1-continue'),
      generateApiKey: document.getElementById('generate-api-key'),
      copyApiKey: document.getElementById('copy-api-key'),
      step2Continue: document.getElementById('step2-continue'),
      step3Continue: document.getElementById('step3-continue'),
      restartSetup: document.getElementById('restart-setup')
    },
    apiKeyContainer: document.getElementById('api-key-container'),
    apiKeyDisplay: document.getElementById('api-key-display'),
    connectionStatus: document.getElementById('connection-status'),
    progressBar: document.getElementById('progress-bar'),
    setupCompleteActions: document.getElementById('setup-complete-actions')
  };

  // Utility functions
  function showStep(stepNumber) {
    state.currentStep = stepNumber;
    Object.keys(elements.stepCircles).forEach(step => {
      const circle = elements.stepCircles[step];
      circle.classList.remove('active', 'completed');
      if (Number(step) === stepNumber) {
        circle.classList.add('active');
      } else if (Number(step) < stepNumber) {
        circle.classList.add('completed');
        circle.innerHTML = '<i class="bi bi-check"></i>';
      } else {
        circle.innerHTML = step;
      }
    });
    Object.values(elements.steps).forEach(step => step.classList.remove('active'));
    elements.steps[stepNumber].classList.add('active');
  }

  function getAuthToken() {
    return window.authManager?.token || localStorage.getItem('authToken');
  }

  async function generateApiKey() {
    const button = elements.buttons.generateApiKey;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found. Please log in.');

      const response = await fetch(`${API_BASE}/rfid/device/generate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceName: 'Smart Wardrobe Pi' })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      state.deviceApiKey = data.apiKey;
      elements.apiKeyDisplay.textContent = data.apiKey;
      elements.apiKeyContainer.classList.remove('d-none');
      elements.buttons.step2Continue.classList.remove('d-none');
      button.innerHTML = 'Regenerate Key';
    } catch (error) {
      console.error('API Key Generation Error:', error);
      elements.apiKeyContainer.classList.remove('d-none');
      elements.apiKeyDisplay.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
      button.innerHTML = 'Try Again';
    } finally {
      button.disabled = false;
    }
  }

  async function pollDeviceStatus() {
    if (state.pollingTimer) clearTimeout(state.pollingTimer);

    let pollCount = 0;
    elements.connectionStatus.innerHTML = `
      <div class="alert alert-info">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Waiting for your device to connect... (0/${MAX_POLLS})
      </div>
    `;

    const checkStatus = async () => {
      pollCount++;
      try {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE}/rfid/devices`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        if (data.devices?.length > 0 && data.devices[0].isOnline) {
          state.deviceDetails = data.devices[0];
          elements.connectionStatus.innerHTML = `
            <div class="alert alert-success">
              <i class="bi bi-check-circle-fill me-2"></i>
              <strong>Success!</strong> Your Smart Wardrobe device is connected.
              <div class="mt-2">
                <strong>Device:</strong> ${state.deviceDetails.deviceName || 'Smart Wardrobe Pi'}<br>
                <strong>Status:</strong> Online<br>
                <strong>Last seen:</strong> ${new Date(state.deviceDetails.lastHeartbeat).toLocaleString()}
              </div>
            </div>
          `;
          elements.setupCompleteActions.classList.remove('d-none');
          return;
        }

        elements.connectionStatus.innerHTML = `
          <div class="alert alert-info">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Waiting for your device to connect... (${pollCount}/${MAX_POLLS})
          </div>
        `;

        if (pollCount < MAX_POLLS) {
          state.pollingTimer = setTimeout(checkStatus, POLL_INTERVAL);
        } else {
          elements.connectionStatus.innerHTML = `
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Setup taking longer than expected.</strong>
              <ul><li>Check device power and WiFi credentials.</li></ul>
              <button class="btn btn-sm btn-warning mt-2" id="retry-poll">Check Again</button>
            </div>
          `;
          document.getElementById('retry-poll').addEventListener('click', pollDeviceStatus);
        }
      } catch (error) {
        console.error('Polling Error:', error);
        elements.connectionStatus.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong> ${error.message}
            <button class="btn btn-sm btn-danger mt-2" id="retry-poll">Try Again</button>
          </div>
        `;
        document.getElementById('retry-poll').addEventListener('click', pollDeviceStatus);
      }
    };

    checkStatus();
  }

  // Event bindings
  function bindEvents() {
    elements.buttons.step1Continue.addEventListener('click', () => showStep(2));
    elements.buttons.generateApiKey.addEventListener('click', generateApiKey);
    elements.buttons.copyApiKey.addEventListener('click', () => {
      navigator.clipboard.writeText(state.deviceApiKey).then(() => {
        elements.buttons.copyApiKey.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(() => elements.buttons.copyApiKey.innerHTML = '<i class="bi bi-clipboard"></i> Copy', 2000);
      });
    });
    elements.buttons.step2Continue.addEventListener('click', () => showStep(3));
    elements.buttons.step3Continue.addEventListener('click', () => {
      showStep(4);
      pollDeviceStatus();
    });
    elements.buttons.restartSetup.addEventListener('click', () => {
      if (state.pollingTimer) clearTimeout(state.pollingTimer);
      state.currentStep = 1;
      state.deviceApiKey = null;
      state.deviceDetails = null;
      elements.apiKeyDisplay.textContent = '';
      elements.apiKeyContainer.classList.add('d-none');
      elements.buttons.step2Continue.classList.add('d-none');
      elements.buttons.generateApiKey.innerHTML = 'Generate Device Key';
      elements.setupCompleteActions.classList.add('d-none');
      showStep(1);
    });
  }

  // Authentication check
  if (!getAuthToken()) {
    window.location.href = '/login.html?redirect=device-setup.html';
    return;
  }

  bindEvents();
});