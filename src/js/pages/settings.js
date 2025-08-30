class SettingsManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3001' 
      : '';
    this.settings = {};
    this.init();
  }

  async init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    await this.loadSettings();
    this.bindEvents();
    this.populateSettings();
  }

  async loadSettings() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/settings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        this.settings = await response.json();
        console.log('Settings loaded:', this.settings);
      } else {
        console.error('Failed to load settings:', response.status);
      }
    } catch (error) {
      console.error('Settings load error:', error);
      this.showError('Failed to load settings');
    }
  }

  async updateSettings(settingsData) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settingsData)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        this.settings = { ...this.settings, ...updatedSettings };
        this.showSuccess('Settings updated successfully!');
        return updatedSettings;
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Update settings error:', error);
      this.showError('Failed to update settings');
    }
  }

  populateSettings() {
    // Profile settings
    if (this.settings.profile) {
      const profile = this.settings.profile;
      document.getElementById('firstName').value = profile.firstName || '';
      document.getElementById('lastName').value = profile.lastName || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';
      document.getElementById('bio').value = profile.bio || '';
      
      if (profile.profilePicture) {
        document.getElementById('profilePicturePreview').src = profile.profilePicture;
      }
    }

    // Notification preferences
    if (this.settings.notifications) {
      const notifs = this.settings.notifications;
      document.getElementById('emailNotifications').checked = notifs.email !== false;
      document.getElementById('pushNotifications').checked = notifs.push !== false;
      document.getElementById('outfitReminders').checked = notifs.outfitReminders !== false;
      document.getElementById('laundryReminders').checked = notifs.laundryReminders !== false;
      document.getElementById('weatherAlerts').checked = notifs.weatherAlerts !== false;
    }

    // Privacy settings
    if (this.settings.privacy) {
      const privacy = this.settings.privacy;
      document.getElementById('profileVisibility').value = privacy.profileVisibility || 'private';
      document.getElementById('dataSharing').checked = privacy.dataSharing !== false;
      document.getElementById('analyticsTracking').checked = privacy.analyticsTracking !== false;
    }

    // Preferences
    if (this.settings.preferences) {
      const prefs = this.settings.preferences;
      document.getElementById('defaultWeatherLocation').value = prefs.defaultWeatherLocation || '';
      document.getElementById('temperatureUnit').value = prefs.temperatureUnit || 'celsius';
      document.getElementById('dateFormat').value = prefs.dateFormat || 'MM/DD/YYYY';
      document.getElementById('theme').value = prefs.theme || 'auto';
      document.getElementById('language').value = prefs.language || 'en';
    }
  }

  bindEvents() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Profile picture upload
    const profilePictureInput = document.getElementById('profilePicture');
    if (profilePictureInput) {
      profilePictureInput.addEventListener('change', (e) => {
        this.handleProfilePictureUpload(e.target.files[0]);
      });
    }

    // Notification settings
    const notificationCheckboxes = document.querySelectorAll('[data-setting="notifications"]');
    notificationCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveNotificationSettings());
    });

    // Privacy settings
    const privacyInputs = document.querySelectorAll('[data-setting="privacy"]');
    privacyInputs.forEach(input => {
      input.addEventListener('change', () => this.savePrivacySettings());
    });

    // Preference settings
    const preferenceInputs = document.querySelectorAll('[data-setting="preferences"]');
    preferenceInputs.forEach(input => {
      input.addEventListener('change', () => this.savePreferences());
    });

    // Password change
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword();
      });
    }

    // Account deletion
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => this.confirmAccountDeletion());
    }

    // Data export
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportUserData());
    }

    // Theme change
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.applyTheme(e.target.value);
      });
    }
  }

  async saveProfile() {
    const profileData = {
      profile: {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value
      }
    };

    await this.updateSettings(profileData);
  }

  async handleProfilePictureUpload(file) {
    if (!file) return;

    try {
      const token = window.authManager?.token;
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${this.API_BASE}/settings/profile-picture`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        document.getElementById('profilePicturePreview').src = result.url;
        this.showSuccess('Profile picture updated!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      this.showError('Failed to upload profile picture');
    }
  }

  async saveNotificationSettings() {
    const notificationData = {
      notifications: {
        email: document.getElementById('emailNotifications').checked,
        push: document.getElementById('pushNotifications').checked,
        outfitReminders: document.getElementById('outfitReminders').checked,
        laundryReminders: document.getElementById('laundryReminders').checked,
        weatherAlerts: document.getElementById('weatherAlerts').checked
      }
    };

    await this.updateSettings(notificationData);
  }

  async savePrivacySettings() {
    const privacyData = {
      privacy: {
        profileVisibility: document.getElementById('profileVisibility').value,
        dataSharing: document.getElementById('dataSharing').checked,
        analyticsTracking: document.getElementById('analyticsTracking').checked
      }
    };

    await this.updateSettings(privacyData);
  }

  async savePreferences() {
    const preferencesData = {
      preferences: {
        defaultWeatherLocation: document.getElementById('defaultWeatherLocation').value,
        temperatureUnit: document.getElementById('temperatureUnit').value,
        dateFormat: document.getElementById('dateFormat').value,
        theme: document.getElementById('theme').value,
        language: document.getElementById('language').value
      }
    };

    await this.updateSettings(preferencesData);
  }

  async changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      this.showError('New passwords do not match');
      return;
    }

    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        this.showSuccess('Password changed successfully!');
        document.getElementById('passwordForm').reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      this.showError(error.message || 'Failed to change password');
    }
  }

  confirmAccountDeletion() {
    const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
    modal.show();
  }

  async deleteAccount() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/auth/delete-account`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        window.authManager.logout();
        window.location.href = '/login.html?message=Account deleted successfully';
      } else {
        throw new Error('Account deletion failed');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      this.showError('Failed to delete account');
    }
  }

  async exportUserData() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/settings/export-data`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-wardrobe-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess('Data exported successfully!');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Data export error:', error);
      this.showError('Failed to export data');
    }
  }

  applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
      body.setAttribute('data-bs-theme', 'dark');
    } else if (theme === 'light') {
      body.setAttribute('data-bs-theme', 'light');
    } else {
      // Auto theme - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    }
    
    localStorage.setItem('theme', theme);
  }

  showError(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }

  showSuccess(message) {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});