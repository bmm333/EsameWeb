export class OnboardingManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.profileData = {
      firstName: '',
      lastName: '',
      defaultWeatherLocation: '',
      gender: '',
      stylePreferences: [],
      colorPreferences: []
    };
    
    this.initializeFromStorage();
    this.loadUserData();
  }

  initializeFromStorage() {
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.profileData = { ...this.profileData, ...parsed };
        this.currentStep = parsed.currentStep || 1;
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
        this.profileData = {
          firstName: '',
          lastName: '',
          defaultWeatherLocation: '',
          gender: '',
          stylePreferences: [],
          colorPreferences: []
        };
      }
    }
  }

  loadUserData() {
    const user = window.app?.userContext?.get();
    if (user) {
      this.profileData.firstName = user.firstName || '';
      this.profileData.lastName = user.lastName || '';
      this.profileData.email = user.email || '';
      this.profileData.defaultWeatherLocation = user.location || '';
      this.profileData.gender = user.gender || '';
    }
  }

  saveToStorage() {
    const dataToSave = {
      ...this.profileData,
      currentStep: this.currentStep
    };
    localStorage.setItem('onboardingData', JSON.stringify(dataToSave));
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.saveStepData(this.currentStep);
      
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepDisplay();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.validateProfileStep();
      case 2:
        return this.validateStyleStep();
      case 3:
        return this.validateColorStep();
      default:
        return true;
    }
  }

  validateProfileStep() {
    const firstName = document.getElementById('firstName')?.value?.trim();
    if (!firstName) {
      this.showAlert('Please enter your first name', 'warning');
      return false;
    }
    return true;
  }

  validateStyleStep() {
    if (this.profileData.stylePreferences.length === 0) {
      this.showAlert('Please select at least one style preference', 'warning');
      return false;
    }
    return true;
  }

  validateColorStep() {
    if (this.profileData.colorPreferences.length === 0) {
      this.showAlert('Please select at least one color preference', 'warning');
      return false;
    }
    return true;
  }

  saveStepData(step) {
    switch (step) {
      case 1:
        this.saveProfileData();
        break;
      case 2:
        this.saveStylePreferences();
        break;
      case 3:
        this.saveColorPreferences();
        break;
    }
    this.saveToStorage();
  }

  saveProfileData() {
    this.profileData.firstName = document.getElementById('firstName')?.value?.trim() || '';
    this.profileData.lastName = document.getElementById('lastName')?.value?.trim() || '';
    this.profileData.defaultWeatherLocation = document.getElementById('weatherLoc')?.value?.trim() || '';
    this.profileData.gender = document.getElementById('gender')?.value || '';
    
    /*console.log('Profile data saved:', {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      location: this.profileData.defaultWeatherLocation,
      gender: this.profileData.gender
    });*/
  }

  saveStylePreferences() {
    const selectedStyles = [];
    document.querySelectorAll('.style-option.selected').forEach(option => {
      selectedStyles.push(option.dataset.style);
    });
    this.profileData.stylePreferences = selectedStyles;
    /*console.log('Style preferences saved:', this.profileData.stylePreferences);*/
  }

  saveColorPreferences() {
    const selectedColors = [];
    document.querySelectorAll('.color-option.selected').forEach(option => {
      selectedColors.push({
        color: option.dataset.color,
        hexCode: option.dataset.hex,
        preference: 'liked'
      });
    });
    this.profileData.colorPreferences = selectedColors;
    /*console.log('Color preferences saved:', this.profileData.colorPreferences);*/
  }

  updateStepDisplay() {
    for (let i = 1; i <= this.totalSteps; i++) {
      const step = document.getElementById(`step${i}`);
      if (step) {
        step.style.display = 'none';
      }
    }
    
    const currentStepElement = document.getElementById(`step${this.currentStep}`);
    if (currentStepElement) {
      currentStepElement.style.display = 'block';
    }
    this.updateProgressBar();
  }

  updateProgressBar() {
    const progress = (this.currentStep / this.totalSteps) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress.toString());
    }
  }

  async finishOnboarding() {
    try {
      if (!this.validateCurrentStep()) {
        return;
      }
      
      this.saveStepData(this.currentStep);
      const completeProfileData = {
        firstName: this.profileData.firstName,
        lastName: this.profileData.lastName,
        defaultWeatherLocation: this.profileData.defaultWeatherLocation,
        gender: this.profileData.gender || null,
        profileSetupCompleted: true,
        stylePreferences: this.profileData.stylePreferences,
        colorPreferences: this.profileData.colorPreferences
      };

      /*console.log('Submitting onboarding data:', completeProfileData);*/

      const response = await window.app.api.put('/user/profile', completeProfileData);
      
      await window.app.userContext.load().catch(err => {
        console.warn('Failed to reload user context:', err);
      });
      
      localStorage.removeItem('onboardingData');
      
      this.showAlert('Profile setup completed successfully!', 'success');
      
      setTimeout(() => {
        if (window.app?.router) {
          window.app.router.navigate('/dashboard');
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Onboarding completion error:', error);
      this.showAlert('Failed to save profile. Please try again.', 'danger');
    }
  }

  restoreSelections() {
    this.profileData.stylePreferences.forEach(style => {
      const option = document.querySelector(`.style-option[data-style="${style}"]`);
      if (option) {
        option.classList.add('selected');
      }
    });
    
    this.profileData.colorPreferences.forEach(colorPref => {
      const option = document.querySelector(`.color-option[data-color="${colorPref.color}"]`);
      if (option) {
        option.classList.add('selected');
      }
    });
  }

  showAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.alert-dynamic');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-dynamic`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const containers = [
      document.getElementById('onbAlert'),
      document.querySelector('.onboarding-card'),
      document.querySelector('.container')
    ];
    
    const container = containers.find(c => c !== null);
    if (container) {
      if (container.id === 'onbAlert') {
        container.innerHTML = '';
        container.appendChild(alertDiv);
      } else {
        container.insertBefore(alertDiv, container.firstChild);
      }
      
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    } else {
      console.warn('No alert container found');
    }
  }
}