export async function render() {
    return `
        <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <i class="bi bi-key text-primary fs-1"></i>
                        </div>
                        <h1 class="auth-title">Reset Password</h1>
                        <p class="auth-subtitle">Enter your email to receive a password reset link</p>
                    </div>
                    
                    <div id="forgotPasswordAlerts"></div>
                    
                    <form id="forgotPasswordForm" class="auth-form">
                        <div class="form-floating mb-3">
                            <input type="email" class="form-control" id="email" name="email" placeholder="name@example.com" required>
                            <label for="email">Email address</label>
                            <div class="invalid-feedback"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 mb-3" id="resetButton">
                            <span class="button-text">Send Reset Link</span>
                            <span class="button-loader d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Sending...
                            </span>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <div class="text-center">
                            <a href="/login" data-nav class="text-decoration-none">Back to Login</a> |
                            <a href="/signup" data-nav class="text-decoration-none">Create Account</a>
                        </div>
                    </div>
                </div>
        </div>
    `;
}

export async function init() {
    const form = document.getElementById('forgotPasswordForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = document.getElementById('resetButton');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        const emailInput = document.getElementById('email');
        try {
            button.disabled = true;
            buttonText.classList.add('d-none');
            buttonLoader.classList.remove('d-none');
            const email = emailInput.value.trim();
            if (!email) {
                throw new Error('Email is required');
            }
            const response = await window.app.api.post('/auth/forgot-password', { email });
            showAlert('If an account with this email exists, you will receive a password reset link shortly.', 'success');
            emailInput.value = '';
            
        } catch (error) {
            console.error('Forgot password error:', error);
            showAlert(error.message || 'Failed to send reset link', 'danger');
        } finally {
            button.disabled = false;
            buttonText.classList.remove('d-none');
            buttonLoader.classList.add('d-none');
        }
    });
    
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.app.router.navigate(href);
        });
    });
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('forgotPasswordAlerts');
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}