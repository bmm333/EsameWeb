document.addEventListener('DOMContentLoaded', async () => {
    if (!window.authManager?.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    await loadSettings();
    setupEventListeners();
});


const baseURL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
async function loadSettings() {
    try {
        const response = await fetch(`${baseURL}/settings`, {
            headers: { 'Authorization': `Bearer ${window.authManager.token}` }
        });
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        const settings = await response.json();
        populateProfileForm(settings.profile);
        populatePreferencesForm(settings.preferences);
        populateNotificationsForm(settings.notifications);
        populateRFIDForm(settings.rfid);
        populateAccountForm(settings.account);
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        showAlert('Failed to load settings', 'danger');
    }
}


function populateProfileForm(profile) {
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    const img = document.querySelector('.profile-image-container img');
    if (img && profile.profilePicture) {
        img.src = profile.profilePicture;
    }
}

function populatePreferencesForm(preferences) {
    // Theme selection
    if (preferences.theme) {
        document.querySelector(`input[name="theme"][value="${preferences.theme}"]`).checked = true;
    }
    
    // Temperature unit
    if (preferences.temperatureUnit) {
        document.querySelector(`input[name="temperatureUnit"][value="${preferences.temperatureUnit}"]`).checked = true;
    }
    
    // Checkboxes
    document.getElementById('enableAnimations').checked = preferences.enableAnimations || false;
}

function populateNotificationsForm(notifications) {
    // Email notifications
    document.getElementById('emailOutfitSuggestions').checked = notifications.emailOutfitSuggestions || false;
    document.getElementById('emailWeeklyReport').checked = notifications.emailWeeklyReport || false;
    document.getElementById('emailPromotions').checked = notifications.emailPromotions || false;
    
    // Push notifications
    document.getElementById('pushRFIDAlerts').checked = notifications.pushRFIDAlerts || false;
    document.getElementById('pushOutfitReminders').checked = notifications.pushOutfitReminders || false;
    document.getElementById('pushWeatherAlerts').checked = notifications.pushWeatherAlerts || false;
    document.getElementById('pushSystemUpdates').checked = notifications.pushSystemUpdates || false;
    
    // Timing
    document.getElementById('notificationTime').value = notifications.notificationTime || '07:00';
    document.getElementById('weeklyReportDay').value = notifications.weeklyReportDay || 'sunday';
}

function populateRFIDForm(rfid) {
    if (rfid.deviceId) {
        document.querySelector('.card-text').textContent = rfid.deviceId;
    }
    
    // RFID settings
    document.getElementById('scanInterval').value = rfid.scanInterval || 30;
    document.getElementById('notificationDelay').value = rfid.notificationDelay || 15;
    document.getElementById('powerSavingMode').checked = rfid.powerSavingMode || false;
    document.getElementById('autoSync').checked = rfid.autoSync !== false;
}

function populateAccountForm(account) {
    // Show verification status
    if (!account.isVerified) {
        showEmailVerificationAlert();
    }
}

function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm')?.addEventListener('submit', saveProfile);
    
    // Individual save buttons for each section
    document.querySelectorAll('button[type="button"]').forEach(btn => {
        if (btn.textContent.includes('Save')) {
            btn.addEventListener('click', handleSaveSection);
        }
    });
    
    // Password change
    document.getElementById('passwordForm')?.addEventListener('submit', changePassword);
    
    // Photo management
    setupPhotoManagement();
    
    // Email verification resend
    document.getElementById('resendVerificationBtn')?.addEventListener('click', resendVerificationEmail);
    
    // Reset to defaults buttons
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Reset to Defaults')) {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.tab-pane').id;
                resetToDefaults(section);
            });
        }
    });
    
    // Export data
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    
    // Delete account
    setupDeleteAccount();
    
    // Scan interval display update
    document.getElementById('scanInterval')?.addEventListener('input', (e) => {
        document.getElementById('scanIntervalValue').textContent = `${e.target.value}s`;
    });
}

async function saveProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${window.authManager.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            showAlert('Profile updated successfully', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to update profile', 'danger');
        }
    } catch (error) {
        showAlert('Network error', 'danger');
    }
}

async function changePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/settings/password', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${window.authManager.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.ok) {
            showAlert('Password changed successfully', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to change password', 'danger');
        }
    } catch (error) {
        showAlert('Network error', 'danger');
    }
}

async function resendVerificationEmail() {
    try {
        const response = await fetch('/api/settings/resend-verification', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${window.authManager.token}` }
        });
        
        if (response.ok) {
            showAlert('Verification email sent', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to send verification email', 'danger');
        }
    } catch (error) {
        showAlert('Network error', 'danger');
    }
}

async function exportData() {
    try {
        const response = await fetch('/api/settings/export-data', {
            headers: { 'Authorization': `Bearer ${window.authManager.token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smart-wardrobe-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showAlert('Data exported successfully', 'success');
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to export data', 'danger');
        }
    } catch (error) {
        showAlert('Network error', 'danger');
    }
}

async function resetToDefaults(section) {
    if (!confirm(`Reset ${section} settings to defaults?`)) return;
    
    try {
        const response = await fetch(`/api/settings/reset-defaults/${section}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${window.authManager.token}` }
        });
        
        if (response.ok) {
            showAlert(`${section} settings reset to defaults`, 'success');
            await loadSettings(); // Reload to show updated values
        } else {
            const error = await response.json();
            showAlert(error.message || 'Failed to reset settings', 'danger');
        }
    } catch (error) {
        showAlert('Network error', 'danger');
    }
}

function setupDeleteAccount() {
    const deleteInput = document.getElementById('deleteConfirmation');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    deleteInput?.addEventListener('input', (e) => {
        confirmBtn.disabled = e.target.value !== 'delete my account';
    });
    
    confirmBtn?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/settings', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${window.authManager.token}` }
            });
            
            if (response.ok) {
                showAlert('Account deleted successfully', 'success');
                setTimeout(() => {
                    window.authManager.logout();
                }, 2000);
            } else {
                const error = await response.json();
                showAlert(error.message || 'Failed to delete account', 'danger');
            }
        } catch (error) {
            showAlert('Network error', 'danger');
        }
    });
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    if (type === 'success') {
        setTimeout(() => {
            document.querySelector('.alert')?.remove();
        }, 3000);
    }
}

function showEmailVerificationAlert() {
    const alertHtml = `
        <div class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
                Your email address is not verified. 
                <button class="btn btn-link p-0 ms-1" id="resendVerificationBtn">Resend verification email</button>
            </div>
        </div>
    `;
    document.querySelector('#account .card-body').insertAdjacentHTML('afterbegin', alertHtml);
}