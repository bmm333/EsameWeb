import { APP_CONFIG } from '../config/app-config.js';

export async function render() {
  const user = window.app.userContext.get();
  return `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Settings</h1>
      </div>

      <div id="settingsGlobalAlert"></div>

      <!-- Settings Navigation -->
      <ul class="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab">
            <i class="bi bi-person me-2"></i>Profile
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="preferences-tab" data-bs-toggle="tab" data-bs-target="#preferences" type="button" role="tab">
            <i class="bi bi-gear me-2"></i>Preferences
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="security-tab" data-bs-toggle="tab" data-bs-target="#security" type="button" role="tab">
            <i class="bi bi-shield-lock me-2"></i>Security
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button" role="tab">
            <i class="bi bi-exclamation-triangle me-2"></i>Account
          </button>
        </li>
      </ul>

      <div class="tab-content" id="settingsTabContent">
        <!-- Profile Tab -->
        <div class="tab-pane fade show active" id="profile" role="tabpanel">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Profile Information</h5>
              <form id="profileForm" autocomplete="off">
                <div class="row mb-4">
                  <div class="col-md-3 text-center">
                    <div class="profile-image-container mb-3 position-relative">
                      <img id="profileAvatar" src="${user?.profilePicture || 'https://placehold.co/150x150/f9fafb/6366f1?text=U'}" alt="Profile" class="img-fluid rounded-circle settings-avatar">
                      <button type="button" class="btn btn-sm btn-primary profile-image-edit" id="changeAvatarBtn" aria-label="Change profile photo">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                      </button>
                    </div>
                    <input type="file" id="avatarFile" class="d-none" accept="image/*">
                    <button type="button" class="btn btn-sm btn-outline-danger" id="removeAvatarBtn" aria-label="Remove profile photo">Remove Photo</button>
                  </div>
                  <div class="col-md-9">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label" for="firstName">First Name</label>
                        <input type="text" id="firstName" class="form-control" value="${user?.firstName || ''}" autocomplete="given-name">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label" for="lastName">Last Name</label>
                        <input type="text" id="lastName" class="form-control" value="${user?.lastName || ''}" autocomplete="family-name">
                      </div>
                      <div class="col-md-12">
                        <label class="form-label" for="email">Email</label>
                        <div class="input-group">
                          <input type="email" id="email" class="form-control" value="${user?.email || ''}" readonly autocomplete="email">
                        </div>
                        <div class="form-text">Click "Change" to update your email address</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label" for="phone">Phone Number</label>
                        <input type="tel" id="phone" class="form-control" value="${user?.phoneNumber || ''}" autocomplete="tel">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label" for="defaultLocation">Weather Location</label>
                        <input type="text" id="defaultLocation" class="form-control" value="${user?.defaultWeatherLocation || ''}" placeholder="City, Country" autocomplete="address-level2">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="reset" class="btn btn-outline-secondary me-2">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Preferences Tab -->
        <div class="tab-pane fade" id="preferences" role="tabpanel">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">App Preferences</h5>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="resetPreferencesBtn">Reset to Defaults</button>
              </div>
              
              <div class="mb-4">
                <label class="form-label">Theme</label>
                <div class="d-flex flex-wrap gap-2" role="group">
                  <div class="flex-fill">
                    <input type="radio" class="btn-check" name="theme" id="themeLight" value="light" autocomplete="off">
                    <label class="btn btn-outline-primary w-100" for="themeLight">
                      <i class="bi bi-sun me-2"></i>Light
                    </label>
                  </div>
                  
                  <div class="flex-fill">
                    <input type="radio" class="btn-check" name="theme" id="themeDark" value="dark" autocomplete="off">
                    <label class="btn btn-outline-primary w-100" for="themeDark">
                      <i class="bi bi-moon me-2"></i>Dark
                    </label>
                  </div>
                  
                  <div class="flex-fill">
                    <input type="radio" class="btn-check" name="theme" id="themeSystem" value="system" autocomplete="off">
                    <label class="btn btn-outline-primary w-100" for="themeSystem">
                      <i class="bi bi-circle-half me-2"></i>System
                    </label>
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label for="weatherLocation" class="form-label">Weather Location</label>
                  <input type="text" class="form-control" id="weatherLocation" placeholder="City, Country" autocomplete="address-level2">
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="temperatureUnit">Temperature Unit</label>
                  <select id="temperatureUnit" class="form-select" autocomplete="off">
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-primary" id="savePreferencesBtn">Save Preferences</button>
              </div>
            </div>
          </div>
        </div>
        <!-- Security Tab -->
        <div class="tab-pane fade" id="security" role="tabpanel">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Change Password</h5>
              <form id="passwordForm" autocomplete="off">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label" for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" class="form-control" autocomplete="current-password" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label" for="newPassword">New Password</label>
                    <input type="password" id="newPassword" class="form-control" autocomplete="new-password" required>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label" for="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" class="form-control" autocomplete="new-password" required>
                  </div>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button type="submit" class="btn btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Account Tab -->
        <div class="tab-pane fade" id="account" role="tabpanel">
          <div class="card border-warning">
            <div class="card-body">
              <h5 class="card-title text-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>Danger Zone
              </h5>
              
              <div class="mb-4">
                <h6>Change Email Address</h6>
                <p class="text-muted mb-3">Update your email address. You'll need to verify the new address.</p>
                <button type="button" class="btn btn-outline-primary" id="changeEmailModalBtn">Change Email</button>
              </div>

              <hr>

              <div>
                <h6 class="text-danger">Delete Account</h6>
                <p class="text-muted mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button type="button" class="btn btn-danger" id="deleteAccountBtn">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Email Modal -->
    <div class="modal fade" id="changeEmailModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Email Address</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="changeEmailForm">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label" for="newEmail">New Email Address</label>
                <input type="email" id="newEmail" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label" for="emailPassword">Current Password</label>
                <input type="password" id="emailPassword" class="form-control" required>
                <div class="form-text">Enter your current password to confirm this change</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
              <button type="submit" class="btn btn-primary">Change Email</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div class="modal fade" id="deleteAccountModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header border-danger">
            <h5 class="modal-title text-danger">Delete Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This action is permanent and cannot be undone.
            </div>
            <p>Deleting your account will:</p>
            <ul>
              <li>Remove all your profile information</li>
              <li>Delete all wardrobe items and outfits</li>
              <li>Cancel any active subscriptions</li>
              <li>Remove all personal data from our servers</li>
            </ul>
            <p class="mb-3">Type <strong>DELETE</strong> to confirm:</p>
            <input type="text" id="deleteConfirmation" class="form-control" placeholder="Type DELETE">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn" disabled>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  const api = window.app.api;
  const user = window.app.userContext.get();

  await loadUserSettings();
  initializeTheme();
  bindProfileForm(api);
  bindPasswordForm(api);
  bindPreferences();
  bindAvatarUpload(api);
  bindEmailChange(api);
  bindAccountDeletion(api);

  async function loadUserSettings() {
    try {
      const settings = await api.get('/settings');
      if (settings.preferences) {
        document.getElementById('temperatureUnit').value = settings.preferences.temperatureUnit || 'celsius';
        document.getElementById('weatherLocation').value = settings.preferences.weatherLocation || user?.defaultWeatherLocation || '';
        
        const themeInput = document.querySelector(`[name="theme"][value="${settings.preferences.theme || 'system'}"]`);
        if (themeInput) themeInput.checked = true;
      }
      
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'system';
    const themeInput = document.querySelector(`[name="theme"][value="${currentTheme}"]`);
    if (themeInput) {
      themeInput.checked = true;
    }
  }

  function bindProfileForm(apiRef) {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        const payload = {
          profile: {
            firstName: getValue('firstName'),
            lastName: getValue('lastName'),
            phoneNumber: getValue('phone'),
            defaultWeatherLocation: getValue('defaultLocation')
          }
        };

        await apiRef.put('/settings', payload);
        await window.app.userContext.load();
        
        showAlert('settingsGlobalAlert', 'Profile updated successfully!', 'success');
        
      } catch (error) {
        console.error('Failed to update profile:', error);
        showAlert('settingsGlobalAlert', 'Failed to update profile: ' + (error.message || 'Unknown error'), 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }


  function bindPasswordForm(apiRef) {
    const form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = getValue('currentPassword');
      const newPassword = getValue('newPassword');
      const confirmPassword = getValue('confirmPassword');

      if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('settingsGlobalAlert', 'Please fill in all password fields', 'warning');
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert('settingsGlobalAlert', 'New passwords do not match', 'warning');
        return;
      }

      if (newPassword.length < 6) {
        showAlert('settingsGlobalAlert', 'New password must be at least 6 characters long', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

        await apiRef.put('/settings/password', {
          currentPassword,
          newPassword
        });

        showAlert('settingsGlobalAlert', 'Password updated successfully!', 'success');
        form.reset();
        
      } catch (error) {
        console.error('Failed to change password:', error);
        showAlert('settingsGlobalAlert', 'Failed to change password: ' + (error.message || 'Invalid current password'), 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function bindPreferences() {
    const saveBtn = document.getElementById('savePreferencesBtn');
    const resetBtn = document.getElementById('resetPreferencesBtn');
    document.querySelectorAll('[name="theme"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          applyTheme(radio.value);
          localStorage.setItem('theme', radio.value);
        }
      });
    });

    saveBtn?.addEventListener('click', async () => {
      try {
        const preferences = {
          theme: document.querySelector('[name="theme"]:checked')?.value || 'system',
          temperatureUnit: getValue('temperatureUnit'),
          weatherLocation: getValue('weatherLocation')
        };

        await api.put('/settings', { preferences });
        localStorage.setItem('theme', preferences.theme);
        applyTheme(preferences.theme);

        showAlert('settingsGlobalAlert', 'Preferences saved successfully!', 'success');
        
      } catch (error) {
        console.error('Failed to save preferences:', error);
        showAlert('settingsGlobalAlert', 'Failed to save preferences', 'danger');
      }
    });

    resetBtn?.addEventListener('click', async () => {
      try {
        await api.put('/settings/reset-defaults/preferences');
        document.querySelector('[name="theme"][value="system"]').checked = true;
        document.getElementById('temperatureUnit').value = 'celsius';
        document.getElementById('weatherLocation').value = '';
        
        localStorage.setItem('theme', 'system');
        applyTheme('system');
        
        showAlert('settingsGlobalAlert', 'Preferences reset to defaults!', 'success');
        
      } catch (error) {
        console.error('Failed to reset preferences:', error);
        showAlert('settingsGlobalAlert', 'Failed to reset preferences', 'danger');
      }
    });
  }
  
  function bindEmailChange(apiRef) {
      const changeEmailBtn = document.getElementById('changeEmailModalBtn');
      const changeEmailForm = document.getElementById('changeEmailForm');
      const modal = new bootstrap.Modal(document.getElementById('changeEmailModal'));
      let isSubmitting = false;
  
      changeEmailBtn?.addEventListener('click', () => {
          modal.show();
      });
      changeEmailForm?.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (isSubmitting) {
              return;
          }
          const newEmail = getValue('newEmail');
          const password = getValue('emailPassword');
          if (!newEmail || !password) {
              showAlert('settingsGlobalAlert', 'Please fill in all fields', 'warning');
              return;
          }
          const submitBtn = changeEmailForm.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          isSubmitting = true;
          try {
              submitBtn.disabled = true;
              submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Changing...';
              const response = await apiRef.put('/settings/email', {
                  newEmail,
                  password
              });
  
              modal.hide();
              changeEmailForm.reset();
              showAlert('settingsGlobalAlert', 'Email change initiated! Please check your new email for verification.', 'success');
              setTimeout(() => {
                  window.app.userContext.load();
              }, 1000);
              
          } catch (error) {
              console.error('Failed to change email:', error);
              showAlert('settingsGlobalAlert', 'Failed to change email: ' + (error.message || 'Unknown error'), 'danger');
          } finally {
              isSubmitting = false;
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
          }
      });
  }

  function bindAccountDeletion(apiRef) {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
    const confirmInput = document.getElementById('deleteConfirmation');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    deleteBtn?.addEventListener('click', () => {
      modal.show();
    });

    confirmInput?.addEventListener('input', () => {
      confirmBtn.disabled = confirmInput.value !== 'DELETE';
    });

    confirmBtn?.addEventListener('click', async () => {
      if (confirmInput.value !== 'DELETE') {
        return;
      }

      const originalText = confirmBtn.textContent;
      
      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

        await apiRef.delete('/settings/account');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
        
      } catch (error) {
        console.error('Failed to delete account:', error);
        showAlert('settingsGlobalAlert', 'Failed to delete account: ' + (error.message || 'Unknown error'), 'danger');
        modal.hide();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
      }
    });
  }

  function bindAvatarUpload(apiRef) {
    const trigger = document.getElementById('changeAvatarBtn');
    const fileInput = document.getElementById('avatarFile');
    const removeBtn = document.getElementById('removeAvatarBtn');
    const img = document.getElementById('profileAvatar');

    trigger?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showAlert('settingsGlobalAlert', 'Please select a valid image file', 'warning');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('settingsGlobalAlert', 'Image file too large. Please select a file under 5MB', 'warning');
        return;
      }

      try {
        trigger.disabled = true;
        trigger.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        const formData = new FormData();
        formData.append('file', file);

        const token = apiRef.getToken();
        const baseURL = apiRef.baseURL || 'http://192.168.1.4:3001';
        
        const response = await fetch(`${baseURL}/media/upload/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        const imageUrl = result.url || result.media?.url || result.data?.url;
        
        if (imageUrl) {
          await apiRef.put('/settings', { 
            profile: { profilePicture: imageUrl }
          });
          
          if (img) img.src = imageUrl;
          await window.app.userContext.load();
          
          showAlert('settingsGlobalAlert', 'Profile picture updated successfully!', 'success');
        } else {
          throw new Error('No URL returned from upload');
        }

      } catch (error) {
        console.error('Failed to update profile picture:', error);
        showAlert('settingsGlobalAlert', 'Failed to update profile picture: ' + (error.message || 'Unknown error'), 'danger');
      } finally {
        trigger.disabled = false;
        trigger.innerHTML = '<i class="bi bi-pencil"></i>';
        fileInput.value = '';
      }
    });

    removeBtn?.addEventListener('click', async () => {
      try {
        removeBtn.disabled = true;
        removeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Removing...';

        await apiRef.put('/settings', {
          profile: { profilePicture: null }
        });

        if (img) img.src = 'https://placehold.co/150x150/f9fafb/6366f1?text=U';
        await window.app.userContext.load();
        
        showAlert('settingsGlobalAlert', 'Profile picture removed successfully!', 'success');
        
      } catch (error) {
        console.error('Failed to remove avatar:', error);
        showAlert('settingsGlobalAlert', 'Failed to remove profile picture: ' + (error.message || 'Unknown error'), 'danger');
      } finally {
        removeBtn.disabled = false;
        removeBtn.textContent = 'Remove Photo';
      }
    });
  }

  function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    } else {
      body.setAttribute('data-bs-theme', theme);
    }

    if (window.app?.theme) {
      window.app.theme.setTheme(theme);
    }
  }

  function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  }

  function showAlert(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    if (type === 'success') {
      setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
          const bsAlert = new bootstrap.Alert(alert);
          bsAlert.close();
        }
      }, 5000);
    }
  }
}
