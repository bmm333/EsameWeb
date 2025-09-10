export async function render() {
    return `
    <div class="container py-4 onboarding-container">
      <div class="progress mb-4">
        <div class="progress-bar" role="progressbar" id="progressBar" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      
      <div id="onbAlert"></div>
      
      <!-- Step 1: Basic Profile -->
      <div id="step1" class="onboarding-step active">
        <h2 class="mb-3">Welcome! Let's set up your profile</h2>
        <form id="profileForm" class="card p-4">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">First name *</label>
                <input id="firstName" class="form-control" required>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Last name</label>
                <input id="lastName" class="form-control">
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Default weather location</label>
            <input id="weatherLoc" class="form-control" placeholder="e.g., New York, NY">
            <div class="form-text">This helps us provide weather-appropriate outfit suggestions.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Gender (optional)</label>
            <select id="gender" class="form-select">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-primary" id="step1NextBtn">Continue</button>
          </div>
        </form>
      </div>

      <!-- Step 2: Style Preferences -->
      <div id="step2" class="onboarding-step">
        <h2 class="mb-3">What's your style?</h2>
        <div class="card p-4">
          <p class="text-muted mb-4">Select the styles that best describe your fashion preferences (choose at least one):</p>
          <div class="row" id="styleOptions">
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="casual">
                <i class="bi bi-house-door-fill"></i>
                <span>Casual</span>
                <small class="text-muted d-block mt-1">Comfortable, everyday wear</small>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="business">
                <i class="bi bi-briefcase-fill"></i>
                <span>Business</span>
                <small class="text-muted d-block mt-1">Professional, work attire</small>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="formal">
                <i class="bi bi-suit-club-fill"></i>
                <span>Formal</span>
                <small class="text-muted d-block mt-1">Elegant, special occasions</small>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="sporty">
                <i class="bi bi-heart-pulse-fill"></i>
                <span>Sporty</span>
                <small class="text-muted d-block mt-1">Athletic, active wear</small>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="bohemian">
                <i class="bi bi-flower3"></i>
                <span>Bohemian</span>
                <small class="text-muted d-block mt-1">Free-spirited, artistic</small>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="style-option" data-style="minimalist">
                <i class="bi bi-dash-circle-fill"></i>
                <span>Minimalist</span>
                <small class="text-muted d-block mt-1">Simple, clean lines</small>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-outline-secondary" id="step2BackBtn">Back</button>
            <button type="button" class="btn btn-primary" id="step2NextBtn">Continue</button>
          </div>
        </div>
      </div>

      <!-- Step 3: Color Preferences -->
      <div id="step3" class="onboarding-step">
        <h2 class="mb-3">Your favorite colors</h2>
        <div class="card p-4">
          <p class="text-muted mb-4">Select colors you love wearing (choose at least one):</p>
          <div class="color-grid" id="colorOptions">
            <div class="color-option" data-color="black" data-hex="#000000" title="Black"></div>
            <div class="color-option" data-color="white" data-hex="#FFFFFF" title="White"></div>
            <div class="color-option" data-color="navy" data-hex="#001f3f" title="Navy"></div>
            <div class="color-option" data-color="blue" data-hex="#0074D9" title="Blue"></div>
            <div class="color-option" data-color="red" data-hex="#FF4136" title="Red"></div>
            <div class="color-option" data-color="green" data-hex="#2ECC40" title="Green"></div>
            <div class="color-option" data-color="yellow" data-hex="#FFDC00" title="Yellow"></div>
            <div class="color-option" data-color="purple" data-hex="#B10DC9" title="Purple"></div>
            <div class="color-option" data-color="pink" data-hex="#F012BE" title="Pink"></div>
            <div class="color-option" data-color="orange" data-hex="#FF851B" title="Orange"></div>
            <div class="color-option" data-color="brown" data-hex="#8B4513" title="Brown"></div>
            <div class="color-option" data-color="gray" data-hex="#808080" title="Gray"></div>
          </div>
          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-outline-secondary" id="step3BackBtn">Back</button>
            <button type="button" class="btn btn-success" id="finishBtn">
              <i class="bi bi-check-circle me-2"></i>Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
    const { OnboardingManager } = await import('../onboarding-manager.js');
    const manager = new OnboardingManager();
    const user = window.app.userContext.get();
    if (user) {
        setTimeout(() => {
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const weatherLocInput = document.getElementById('weatherLoc');
            const genderSelect = document.getElementById('gender');
            
            if (firstNameInput) firstNameInput.value = user.firstName || '';
            if (lastNameInput) lastNameInput.value = user.lastName || '';
            if (weatherLocInput) weatherLocInput.value = user.location || '';
            if (genderSelect) genderSelect.value = user.gender || '';
        }, 100);
    }
    setupEventListeners(manager);
    setTimeout(() => {
        manager.restoreSelections();
        manager.updateStepDisplay();
    }, 100);

    function setupEventListeners(manager) {
        document.getElementById('step1NextBtn')?.addEventListener('click', () => manager.nextStep());
        document.getElementById('step2BackBtn')?.addEventListener('click', () => manager.previousStep());
        document.getElementById('step2NextBtn')?.addEventListener('click', () => manager.nextStep());
        document.getElementById('step3BackBtn')?.addEventListener('click', () => manager.previousStep());
        document.getElementById('finishBtn')?.addEventListener('click', () => manager.finishOnboarding());
        document.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('selected');
                manager.saveStylePreferences();
            });
        });
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('selected');
                manager.saveColorPreferences();
            });
        });
        const profileInputs = ['firstName', 'lastName', 'weatherLoc', 'gender'];
        profileInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => {
                    manager.saveProfileData();
                });
            }
        });
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                manager.nexttep();
            });
        }
    }
}