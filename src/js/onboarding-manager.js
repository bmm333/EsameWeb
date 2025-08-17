export class OnboardingManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.profileData = {};
    
    this.initializeFromStorage();
    this.loadUserData();
    this.updateStepDisplay();
  }

  initializeFromStorage() {
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      try {
        this.profileData = JSON.parse(savedData);
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
        this.profileData = {};
      }
    }
  }

  loadUserData() {
    if (window.authManager && window.authManager.user) {
      const user = window.authManager.user;
      this.profileData.firstName = user.firstName || '';
      this.profileData.lastName = user.lastName || '';
      this.profileData.email = user.email || '';
    }
  }

  saveToStorage() {
    localStorage.setItem('onboardingData', JSON.stringify(this.profileData));
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

  showAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.alert-dynamic');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-dynamic`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.onboarding-card');
    if (container) {
      container.insertBefore(alertDiv, container.firstChild);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 5000);
    }
  }

  validateProfileStep() { return true; }
  validateStyleStep() { return true; }
  validateColorStep() { return true; }
  saveProfileData() {}
  saveStylePreferences() {}
  saveColorPreferences() {}
  updateStepDisplay() {}
}