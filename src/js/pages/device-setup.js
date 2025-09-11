export function render() {
    return `
    <div class="container py-4">
      <h2 class="mb-3">Device Setup</h2>
      <div id="setupAlert"></div>

      <!-- Progress Indicator -->
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="text-muted">Setup Progress</span>
          <span id="progressText" class="fw-medium">Step 1 of 4</span>
        </div>
        <div class="progress">
          <div id="progressBar" class="progress-bar"></div>
        </div>
      </div>

      <!-- Step Indicators -->
      <div class="d-flex justify-content-between mb-4">
        <div id="step-indicator-1" class="step-indicator active">
          <div class="step-circle">1</div>
          <div class="step-label">Power On</div>
        </div>
        <div id="step-indicator-2" class="step-indicator">
          <div class="step-circle">2</div>
          <div class="step-label">Generate Key</div>
        </div>
        <div id="step-indicator-3" class="step-indicator">
          <div class="step-circle">3</div>
          <div class="step-label">Configure</div>
        </div>
        <div id="step-indicator-4" class="step-indicator">
          <div class="step-circle">4</div>
          <div class="step-label">Complete</div>
        </div>
      </div>

      <!-- Step Content Container -->
      <div class="card">
        <div class="card-body">
          <!-- Step 1: Power On -->
          <div id="step-1" class="setup-step active">
            <div class="step-header">
              <h5 class="mb-1">Step 1: Power On Your Device</h5>
              <p class="text-muted mb-0">Get your Smart Wardrobe device ready</p>
            </div>
            <div class="step-content">
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Make sure your Smart Wardrobe device is powered on and ready:
              </div>
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Connect the device to power
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Wait for the blue LED to start flashing
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Ensure it's connected to your network
                </li>
              </ul>
              <div class="mt-4">
                <button id="step1-continue" class="btn btn-primary btn-md" type="button" aria-label="Device is ready, continue">
                  <i class="bi bi-arrow-right me-2"></i>Device is Ready - Continue
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Generate Key -->
          <div id="step-2" class="setup-step">
            <div class="step-header">
              <h5 class="mb-1">Step 2: Generate Device Key</h5>
              <p class="text-muted mb-0">Create a unique API key for your device</p>
            </div>
            <div class="step-content">
              <div class="alert alert-info">
                <i class="bi bi-key me-2"></i>
                Generate a unique API key for your device to securely connect to our servers.
              </div>
              
              <div id="api-key-container" class="d-none mb-4">
                <div class="alert alert-success">
                  <h6 class="alert-heading">
                    <i class="bi bi-check-circle me-2"></i>Key Generated Successfully!
                  </h6>
                  <p class="mb-2">Your Device Key:</p>
                  <div class="input-group">
                    <input id="api-key-display" class="form-control font-monospace" readonly>
                    <button id="select-key" class="btn btn-outline-secondary" type="button">
                      <i class="bi bi-clipboard me-1"></i>Copy
                    </button>
                  </div>
                  <small class="text-muted mt-2 d-block">
                    <i class="bi bi-shield-check me-1"></i>
                    Keep this key safe and copy it to your device in the next step.
                  </small>
                </div>
              </div>
              
              <div class="text-center">
                <button id="generate-api-key" class="btn btn-primary btn-md" type="button" aria-label="Generate device key">
                  <i class="bi bi-key-fill me-2"></i>Generate Device Key
                </button>
                
                <!-- Continue Button - Initially Hidden -->
                <div id="step2-continue-container" class="mt-3 d-none">
                  <button id="step2-continue" class="btn btn-success btn-md" type="button" aria-label="Continue to configuration">
                    <i class="bi bi-arrow-right me-2"></i>Continue to Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Configure Device -->
          <div id="step-3" class="setup-step">
            <div class="step-header">
              <h5 class="mb-1">Step 3: Configure Your Device</h5>
              <p class="text-muted mb-0">Enter the generated key on your device</p>
            </div>
            <div class="step-content">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Important:</strong> You need the API key from Step 2 to continue.
              </div>
              
              <div class="row">
                <div class="col-md-8">
                  <h6>Follow these steps on your device:</h6>
                  <ol>
                    <li class="mb-2">Access your device's configuration interface</li>
                    <li class="mb-2">Paste the API key from the previous step</li>
                    <li class="mb-2">Save the configuration</li>
                    <li class="mb-2">Restart the device service</li>
                  </ol>
                </div>
                <div class="col-md-4 text-center">
                  <div class="device-illustration">
                    <i class="bi bi-router text-primary"></i>
                    <p class="text-muted mt-2">Your Device</p>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 row d-flex justify-content-center align-content-center">
                <button id="step3-continue" class="btn btn-primary btn-md" type="button" aria-label="Configuration complete, continue">
                  <i class="bi bi-check-circle me-2"></i>Configuration Complete - Continue
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Complete -->
          <div id="step-4" class="setup-step">
            <div class="step-header">
              <h5 class="mb-1">Step 4: Finalizing Setup</h5>
              <p class="text-muted mb-0">Waiting for your device to connect</p>
            </div>
            <div class="step-content">
              <div id="connection-status" class="mb-4">
                <div class="alert alert-info">
                  <div class="d-flex align-items-center">
                    <span class="spinner-border spinner-border-sm me-3"></span>
                    <div>
                      <strong>Waiting for device connection...</strong>
                      <br>
                      <small class="text-muted">This may take up to 2 minutes</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div id="setup-complete-actions" class="d-none">
                <div class="alert alert-success">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle-fill text-success me-3" ></i>
                    <div>
                      <h6 class="mb-1">Setup completed successfully!</h6>
                      <p class="mb-0">Your Smart Wardrobe device is now connected and ready to use.</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex gap-2 justify-content-center mt-4">
                  <a href="/wardrobe" data-nav class="btn btn-success btn-md">
                    <i class="bi bi-house-door me-2"></i>Go to Wardrobe
                  </a>
                  <a href="/dashboard" data-nav class="btn btn-outline-secondary btn-md">
                    <i class="bi bi-speedometer2 me-2"></i>Go to Dashboard
                  </a>
                </div>
              </div>
              
              <hr class="my-4">
              <div class="text-center">
                <button id="restart-setup" class="btn btn-link" type="button" aria-label="Restart setup">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Start Setup Over
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
    const api = window.app.api;
    const rfidClient = new (await import('../services/rfid-client.js')).RfidClient(api);

    const els = {
        progressBar: document.getElementById('progressBar'),
        progressText: document.getElementById('progressText'),
        indicators: [
            document.getElementById('step-indicator-1'),
            document.getElementById('step-indicator-2'),
            document.getElementById('step-indicator-3'),
            document.getElementById('step-indicator-4')
        ],
        steps: [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4')
        ],
        step1_continue: document.getElementById('step1-continue'),
        gen_key: document.getElementById('generate-api-key'),
        key_wrap: document.getElementById('api-key-container'),
        key_input: document.getElementById('api-key-display'),
        select_btn: document.getElementById('select-key'),
        step2_continue_container: document.getElementById('step2-continue-container'),
        step2_continue: document.getElementById('step2-continue'),
        step3_continue: document.getElementById('step3-continue'),
        restart_btn: document.getElementById('restart-setup'),
        status: document.getElementById('connection-status'),
        done_actions: document.getElementById('setup-complete-actions'),
        alert: document.getElementById('setupAlert')
    };

    let polling_timer = null;
    let device_key = localStorage.getItem('rfidDeviceKey') || null;
    let current_step = 1;
    if (device_key) {
        els.key_input.value = device_key;
        els.key_wrap.classList.remove('d-none');
        els.gen_key.textContent = 'Regenerate Key';
        els.gen_key.classList.add('btn-outline-warning');
        els.gen_key.classList.remove('btn-primary');
        els.step2_continue_container.classList.remove('d-none');
    }

    const show_step = (step_number) => {
      /*console.log('Showing step:', step_number);*/
        current_step = step_number;
  
        const progress = (step_number / 4) * 100;
        els.progressBar.style.width = `${progress}%`;
        els.progressText.textContent = `Step ${step_number} of 4`;
        els.indicators.forEach((indicator, index) => {
            const step_num = index + 1;
            if (step_num < step_number) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (step_num === step_number) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
        els.steps.forEach((step, index) => {
            if (index === (step_number - 1)) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    };

    els.step1_continue?.addEventListener('click', () => {
      /*console.log('Step 1 continue clicked');*/
        show_step(2);
    });

    els.gen_key?.addEventListener('click', async () => {
        try {
            if (device_key) {
                const ok = confirm('This will invalidate the existing key on your device. Continue?');
                if (!ok) return;
            }
            
            els.gen_key.disabled = true;
            els.gen_key.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';

            const res = await api.post('/rfid/device/generate-key', { 
                deviceName: 'Smart Wardrobe Device',
                regenerate: !!device_key
            });

            device_key = res?.apiKey || '';
            if (!device_key) throw new Error('No API key returned');

            els.key_input.value = device_key;
            els.key_wrap.classList.remove('d-none');
            els.gen_key.textContent = 'Regenerate Key';
            els.gen_key.classList.add('btn-outline-warning');
            els.gen_key.classList.remove('btn-primary');
            localStorage.setItem('rfidDeviceKey', device_key);
            els.step2_continue_container.classList.remove('d-none');
            
        } catch (e) {
            show_err(e.message || 'Failed to generate key');
            els.gen_key.textContent = device_key ? 'Regenerate Key' : 'Try Again';
        } finally {
            els.gen_key.disabled = false;
        }
    });

    els.select_btn?.addEventListener('click', () => {
        els.key_input.select();
        els.key_input.setSelectionRange(0, 99999); 
        navigator.clipboard.writeText(els.key_input.value).then(() => {
            els.select_btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => {
                els.select_btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            }, 2000);
        }).catch(() => {
            els.select_btn.innerHTML = '<i class="bi bi-check"></i> Selected';
            setTimeout(() => {
                els.select_btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            }, 2000);
        });
    });

    els.step2_continue?.addEventListener('click', () => {
        if (!device_key) {
            show_err('Please generate a device key first');
            return;
        }
        show_step(3);
    });

    els.step3_continue?.addEventListener('click', () => {
        if (!device_key) {
            show_err('Please generate a device key first');
            return;
        }
        show_step(4);
        start_poll();
    });

    els.restart_btn?.addEventListener('click', () => {
        stop_poll();
        device_key = null;
        localStorage.removeItem('rfidDeviceKey');
        els.key_wrap.classList.add('d-none');
        els.gen_key.textContent = 'Generate Device Key';
        els.gen_key.classList.remove('btn-outline-warning');
        els.gen_key.classList.add('btn-primary');
        els.step2_continue_container.classList.add('d-none');
        show_step(1);
    });

    function start_poll() {
        stop_poll();
        let count = 0;
        const max = 40;
        
        const tick = async () => {
            count++;
            try {
                const response = await api.get('/rfid/devices');
                
                let device = null;
                if (Array.isArray(response) && response.length > 0) {
                    device = response[0];
                } else if (response && response.device) {
                    device = response.device;
                }
                
                if (device && device.isOnline) {
                    els.status.innerHTML = `
                        <div class="alert alert-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-3"></i>
                                <div>
                                    <strong>Device connected successfully!</strong>
                                    <br>
                                    <small class="text-muted">Last seen: ${new Date(device.lastHeartbeat).toLocaleTimeString()}</small>
                                </div>
                            </div>
                        </div>`;
                    els.done_actions.classList.remove('d-none');
                    return;
                }
                
                const remaining = max - count;
                const remainingTime = Math.ceil(remaining * 3 / 60);
                
                els.status.innerHTML = `
                    <div class="alert alert-info">
                        <div class="d-flex align-items-center">
                            <span class="spinner-border spinner-border-sm me-3"></span>
                            <div>
                                <strong>Waiting for device connection...</strong>
                                <br>
                                <small class="text-muted">Attempt ${count}/${max} • ~${remainingTime} minute${remainingTime !== 1 ? 's' : ''} remaining</small>
                            </div>
                        </div>
                    </div>`;
                    
            } catch (e) {
                console.error('Device status check failed:', e);
                const remaining = max - count;
                const remainingTime = Math.ceil(remaining * 3 / 60);
                
                els.status.innerHTML = `
                    <div class="alert alert-warning">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-exclamation-triangle me-3"></i>
                            <div>
                                <strong>Connection check failed</strong>
                                <br>
                                <small class="text-muted">Attempt ${count}/${max} • Will retry automatically • ~${remainingTime} minute${remainingTime !== 1 ? 's' : ''} remaining</small>
                            </div>
                        </div>
                    </div>`;
            }
            
            if (count < max) {
                polling_timer = setTimeout(tick, 3000);
            } else {
                els.status.innerHTML = `
                    <div class="alert alert-danger">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-x-circle me-3"></i>
                            <div>
                                <strong>Device connection timeout</strong>
                                <br>
                                <small>Please verify:</small>
                                <ul class="mb-0 mt-2">
                                    <li>The API key is correctly entered on your device</li>
                                    <li>Your device has internet connectivity</li>
                                    <li>The device service is running</li>
                                </ul>
                            </div>
                        </div>
                    </div>`;
            }
        };
        tick();
    }

    function stop_poll() {
        if (polling_timer) {
            clearTimeout(polling_timer);
            polling_timer = null;
        }
    }

    function show_err(msg) {
        els.alert.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i> ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
    }
}