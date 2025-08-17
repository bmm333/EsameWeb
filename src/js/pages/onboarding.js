import { OnboardingManager } from '../onboarding-manager.js';

class OnboardingPageManager extends OnboardingManager {
  constructor() {
    super();
    this.setupPageSpecificEventListeners();
  }

  setupPageSpecificEventListeners() {
    const nextStepBtns = document.querySelectorAll('.next-step');
    const prevStepBtns = document.querySelectorAll('.prev-step');

    nextStepBtns.forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });
    prevStepBtns.forEach(btn => {
      btn.addEventListener('click', () => this.previousStep());
    });

    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
      imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
    }
    const finishSetupBtn = document.querySelector('.finish-setup');
    if (finishSetupBtn) {
      finishSetupBtn.addEventListener('click', () => this.finishSetup());
    }
    this.setupAutoSave();
  }

  setupAutoSave() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      const inputs = profileForm.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.saveStepData(1);
        });
      });
    }
    const styleInputs = document.querySelectorAll('input[name="style"]');
    styleInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.saveStepData(2);
      });
    });

    const colorInputs = document.querySelectorAll('input[name="colors"]');
    colorInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.saveStepData(3);
      });
    });
  }

  saveProfileData() {
    const user = window.authManager.user;
    
    this.profileData.firstName = user.firstName;
    this.profileData.lastName = user.lastName;
    this.profileData.email = user.email;
    
    const fullName = document.getElementById('fullName').value;
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      this.profileData.firstName = nameParts[0];
      this.profileData.lastName = nameParts.slice(1).join(' ') || '';
    }

    const nickname = document.getElementById('nickname').value;
    if (nickname) {
      this.profileData.nickname = nickname;
    }

    const gender = document.querySelector('input[name="gender"]:checked');
    if (gender) {
      this.profileData.gender = gender.value;
    }

    console.log('Profile data saved:', this.profileData);
  }

  saveStylePreferences() {
    // Map UI labels to backend values
    const styleMap = {
      'Formal': 'formal',
      'Casual': 'casual',
      'Business Casual': 'business',
      'Sporty': 'sporty',
      'Evening': 'classic', // If you want "Evening" to map to "classic"
      'Trendy': 'trendy'
    };

    const selectedStyles = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter(input => input.id.startsWith('style'))
      .map(input => {
        const label = input.parentElement.querySelector('span');
        const uiLabel = label ? label.textContent.trim() : input.value;
        return styleMap[uiLabel] || input.value.toLowerCase();
      });

    this.profileData.stylePreferences = selectedStyles;
    console.log('Style preferences saved:', selectedStyles);
  }

  saveColorPreferences() {
    const selectedColors = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .filter(input => input.id.startsWith('color'))
      .map(input => {
        const label = input.parentElement.querySelector('.visually-hidden');
        return label ? label.textContent.trim().toLowerCase() : input.value;
      });
    
    this.profileData.colorPreferences = selectedColors;
    console.log('Color preferences saved:', selectedColors);
  }

  validateProfileStep() {
    const gender = document.querySelector('input[name="gender"]:checked');
    if (!gender) {
      this.showAlert('Please select your gender', 'warning');
      return false;
    }
    return true;
  }

  validateStyleStep() {
    const selectedStyles = document.querySelectorAll('input[type="checkbox"]:checked');
    const styleCount = Array.from(selectedStyles).filter(input => input.id.startsWith('style')).length;
    
    if (styleCount === 0) {
      this.showAlert('Please select at least one style preference', 'warning');
      return false;
    }
    return true;
  }

  validateColorStep() {
    const selectedColors = document.querySelectorAll('input[type="checkbox"]:checked');
    const colorCount = Array.from(selectedColors).filter(input => input.id.startsWith('color')).length;
    
    if (colorCount === 0) {
      this.showAlert('Please select at least one color preference', 'warning');
      return false;
    }
    return true;
  }

  updateStepDisplay() {
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.toggle('active', stepNumber === this.currentStep);
      step.classList.toggle('completed', stepNumber < this.currentStep);
    });

    document.querySelectorAll('.step-pane').forEach((pane, index) => {
      pane.classList.toggle('active', index + 1 === this.currentStep);
    });

    const progress = (this.currentStep / this.totalSteps) * 100;
    const progressBar = document.querySelector('.progress .progress-bar');
    if (!progressBar) {
      const progressContainer = document.querySelector('.progress');
      if (progressContainer) {
        progressContainer.innerHTML = `<div class="progress-bar" role="progressbar" style="width: ${progress}%"></div>`;
      }
    } else {
      progressBar.style.width = `${progress}%`;
    }

    const prevBtns = document.querySelectorAll('.prev-step');
    const nextBtns = document.querySelectorAll('.next-step');
    
    prevBtns.forEach(btn => {
      btn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
    });

    if (this.currentStep === this.totalSteps) {
      this.updateSummary();
      const lastStepNextBtn = document.querySelector('#step4 .next-step');
      if (lastStepNextBtn) {
        lastStepNextBtn.textContent = 'Complete Setup';
        lastStepNextBtn.classList.remove('next-step');
        lastStepNextBtn.classList.add('finish-setup');
        lastStepNextBtn.onclick = () => this.finishSetup();
      }
    }
  }

  updateSummary() {
    const summaryName = document.getElementById('summaryName');
    if (summaryName && this.profileData.firstName) {
      summaryName.textContent = `${this.profileData.firstName} ${this.profileData.lastName || ''}`.trim();
    }

    const summaryStyles = document.getElementById('summaryStyles');
    if (summaryStyles && this.profileData.stylePreferences) {
      summaryStyles.textContent = this.profileData.stylePreferences.join(', ');
    }

    const summaryColors = document.getElementById('summaryColors');
    if (summaryColors && this.profileData.colorPreferences) {
      const colorMapping = {
        'black': '#000000',
        'white': '#ffffff',
        'blue': '#6366f1',
        'green': '#10b981',
        'red': '#ef4444',
        'yellow': '#f59e0b',
        'purple': '#8b5cf6',
        'pink': '#ec4899',
        'gray': '#78716c',
        'grey': '#78716c',
        'brown': '#854d0e'
      };

      summaryColors.innerHTML = this.profileData.colorPreferences
        .map(color => {
          const colorCode = colorMapping[color.toLowerCase()] || '#6366f1';
          return `<span class="color-dot" style="background-color: ${colorCode};"></span>`;
        })
        .join(' ');
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
          imagePreview.style.backgroundImage = `url(${e.target.result})`;
        }
        this.profileData.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  
  async finishSetup() {
    try {
      this.saveStepData(this.currentStep);
      
      const finishBtn = document.querySelector('.finish-setup') || document.querySelector('.btn-primary[href="dashboard.html"]');
      if (finishBtn) {
        const originalText = finishBtn.textContent;
        finishBtn.disabled = true;
        finishBtn.textContent = 'Completing setup...';
        
        console.log('Final profile data:', this.profileData);
        
        const result = await window.authManager.setupProfile(this.profileData);
        
        if (result.success) {
          this.showAlert('Profile setup completed successfully!', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 2000);
        } else {
          this.showAlert(result.error || 'Failed to complete profile setup', 'danger');
          finishBtn.disabled = false;
          finishBtn.textContent = originalText;
        }
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      this.showAlert('An unexpected error occurred. Please try again.', 'danger');
      
      const finishBtn = document.querySelector('.finish-setup');
      if (finishBtn) {
        finishBtn.disabled = false;
        finishBtn.textContent = 'Complete Setup';
      }
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const initOnboarding = () => {
    if (window.authManager) {
      new OnboardingPageManager();
    } else {
      setTimeout(initOnboarding, 100);
    }
  };
  setTimeout(initOnboarding, 100);
});