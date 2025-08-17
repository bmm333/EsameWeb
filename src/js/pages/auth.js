document.addEventListener('DOMContentLoaded', () => {
  // Wait for AuthManager to be available
  setTimeout(() => {
    if (window.authManager && window.authManager.isAuthenticated()) {
      window.location.href = '/dashboard.html';
      return;
    }

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Handle signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignup);
    }
  }, 100);
});

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Signing in...';
  try {
    const result = await window.authManager.login({ email, password });
    
    if (result.success) {
      showAlert('Sign in successful!', 'success');
      window.authManager.isNavigating = true;

      if (result.needsProfileSetup) {
        setTimeout(() => {
          window.location.href = '/onboarding.html';
        }, 1000);
      } else {
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      }
    } else {
      showAlert(result.error, 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const termsAgree = document.getElementById('termsAgree')?.checked;
  const submitButton = e.target.querySelector('button[type="submit"]');
  
  // Validate terms agreement (if checkbox exists)
  if (document.getElementById('termsAgree') && !termsAgree) {
    showAlert('Please agree to the Terms of Service and Privacy Policy', 'warning');
    return;
  }

  // Validate password length
  if (password.length < 8) {
    showAlert('Password must be at least 8 characters long', 'warning');
    return;
  }

  // Split name into firstName and lastName
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  // Show loading state
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Creating account...';
  
  try {
    const result = await window.authManager.register({
      firstName,
      lastName,
      email,
      password
    });
    
    if (result.success) {
      showAlert('Account created successfully! Please sign in.', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      showAlert(result.error, 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

function showAlert(message, type = 'info') {
  // Remove existing alerts
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create new alert
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  // Insert alert at the top of the form
  const authCard = document.querySelector('.auth-card');
  const authHeader = document.querySelector('.auth-header');
  if (authHeader) {
    authHeader.insertAdjacentElement('afterend', alert);
  } else if (authCard) {
    authCard.insertBefore(alert, authCard.firstChild);
  }

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}