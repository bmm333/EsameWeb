export class LoginForm {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            onSubmit: null,
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="auth-container">
                <div class="container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <div class="auth-logo">
                                <i class="bi bi-stars text-primary fs-1"></i>
                            </div>
                            <h1 class="auth-title">Welcome back</h1>
                            <p class="auth-subtitle">Sign in to your Smart Wardrobe account</p>
                        </div>
                        
                        <div id="loginAlerts"></div>
                        
                        <form class="auth-form" id="loginForm">
                            <div class="form-floating mb-3">
                                <input type="email" class="form-control" id="email" name="email" placeholder="name@example.com" required>
                                <label for="email">Email address</label>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <div class="form-floating mb-3">
                                <input type="password" class="form-control" id="password" name="password" placeholder="Password" required>
                                <label for="password">Password</label>
                                <button type="button" class="password-toggle" id="passwordToggle">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <div class="form-check mb-4">
                                <input class="form-check-input" type="checkbox" id="rememberMe" name="rememberMe">
                                <label class="form-check-label" for="rememberMe">
                                    Remember me
                                </label>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100 mb-3" id="loginButton">
                                <span class="button-text">Sign In</span>
                                <span class="button-loader d-none">
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Signing in...
                                </span>
                            </button>
                        </form>
                        
                        <div class="text-center mb-4">
                            <a href="/forgot-password" data-nav class="text-decoration-none">Forgot your password?</a>
                        </div>
                        
                        <div class="auth-footer">
                            <p class="mb-0">Don't have an account? <a href="/signup" data-nav class="text-decoration-none fw-medium">Sign up</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const form = this.container.querySelector('#loginForm');
        const passwordInput = this.container.querySelector('#password');
        const passwordToggle = this.container.querySelector('#passwordToggle');

        passwordToggle?.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = passwordToggle.querySelector('i');
            icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });
    }

    async handleSubmit(event) {
        const button = this.container.querySelector('#loginButton');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        
        try {
            button.disabled = true;
            buttonText.classList.add('d-none');
            buttonLoader.classList.remove('d-none');
            const form = event.target;
            const data = {
                email: form.email.value.trim(),
                password: form.password.value,
                rememberMe: form.rememberMe?.checked || false
            };

            console.log('Login form data:', data);

            if (this.options.onSubmit) {
                const result = await this.options.onSubmit(data);
                if (result.user?.subscriptionTier === 'trial') {
                    this.showTrialWelcomeMessage(result.user);
                } else {
                    this.showAlert('Login successful!', 'success');
                }
            }

        } catch (error) {
            this.showAlert(error.message || 'Login failed', 'danger');
        } finally {
            button.disabled = false;
            buttonText.classList.remove('d-none');
            buttonLoader.classList.add('d-none');
        }
    }

    showTrialWelcomeMessage(user) {
        const expiryDate = new Date(user.trialExpires).toLocaleDateString();
        const daysRemaining = Math.ceil((new Date(user.trialExpires) - new Date()) / (1000 * 60 * 60 * 24));
        
        this.showAlert(`
            <strong>🎯 Welcome back to your trial!</strong><br>
            ${daysRemaining} days remaining (expires ${expiryDate})<br>
            <small class="text-muted">Make the most of your trial features!</small>
        `, 'info');
    }

    showAlert(message, type = 'info') {
        const alertContainer = this.container.querySelector('#loginAlerts');
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    clearAlerts() {
        const alertContainer = this.container.querySelector('#loginAlerts');
        alertContainer.innerHTML = '';
    }
}