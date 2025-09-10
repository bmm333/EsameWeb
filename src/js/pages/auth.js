import { LoginForm } from '../components/forms/login-form.js';
import { SignupForm } from '../components/forms/signup-form.js';
export async function render() {
  const isSignup = window.location.pathname === '/signup';
  
  return `
    <nav class="navbar fixed-top" aria-label="Primary navigation">
      <div class="container">
        <a href="/" data-nav class="navbar-brand" aria-label="Smart Wardrobe home">Smart Wardrobe</a>
        <div class="d-flex align-items-center">
          <button id="themeSwitcherAuth" type="button" class="btn btn-link text-decoration-none" aria-label="Toggle theme" title="Toggle theme">
            <i class="bi bi-sun-fill theme-icon-light" aria-hidden="true"></i>
            <i class="bi bi-moon-fill theme-icon-dark d-none" aria-hidden="true"></i>
            <span class="visually-hidden">Toggle theme</span>
          </button>
          ${isSignup 
            ? '<a href="/login" data-nav class="btn btn-outline-primary btn-sm ms-2">Login</a>'
            : '<a href="/signup" data-nav class="btn btn-primary btn-sm ms-2">Sign Up</a>'
          }
        </div>
      </div>
    </nav>
    
    <div class="d-flex justify-content-center align-items-center min-vh-100" role="main">
      <div id="authContainer" class="w-100" ></div>
    </div>
  `;
}
export async function init() {
  const isSignup = window.location.pathname === '/signup';
  const container = document.getElementById('authContainer');
  if (!container) return;
  document.body.classList.remove('landing-active');
  const opts = {
    onSubmit: async (data) => {
      if (isSignup) {
        const response = await window.app.api.post('/auth/signup', {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          enableTrial: data.enableTrial || false 
        });
        if (window.toast) {
            const message = response.trial?.enabled 
            ? 'Trial account created! You have 3 days to explore our features.'
          : 'Account created. Check your email for verification.';
          window.toast.success(message);
        }
        setTimeout(() => window.app.router.navigate('/login'), 2500);
      } else {
        const result = await window.authManager.login({
          email: data.email,
          password: data.password
        });
        try { 
          await window.app.userContext.load(); 
        } catch {}
        const user = window.app.userContext.get();
        if (user && !user.profileSetupCompleted) {
          if (window.toast) window.toast.success('Welcome! Let\'s set up your profile.');
          window.app.router.navigate('/onboarding');
        } else {
          if (window.toast) window.toast.success('Logged in');
          window.app.router.navigate('/dashboard');
        }
      }
    }
  };
  if (isSignup) {
    new SignupForm(container, opts);
  } else {
    new LoginForm(container, opts);
  }
  setTimeout(() => {
    const authContainer = container.querySelector('.auth-container');
    if (authContainer) {
      authContainer.style.minHeight = 'auto';
      const innerContainer = authContainer.querySelector('.container');
      if (innerContainer) {
        innerContainer.classList.remove('container');
        innerContainer.style.maxWidth = 'none';
        innerContainer.style.padding = '0';
      }
    }
  }, 0);
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      window.app.router.navigate(el.getAttribute('href'));
    });
  });
}