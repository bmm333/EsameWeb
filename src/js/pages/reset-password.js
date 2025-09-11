export async function render() {
    return `
        <div class="dashboard-main">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div class="auth-container">
                            <div class="auth-card">
                                <div class="auth-header">
                                    <div class="auth-logo">
                                        <i class="bi bi-shield-lock text-primary fs-1"></i>
                                    </div>
                                    <h1 class="auth-title">Set New Password</h1>
                                    <p class="auth-subtitle">Enter your new password below</p>
                                </div>
                                
                                <div id="resetPasswordAlerts"></div>
                                
                                <form id="resetPasswordForm" class="auth-form">
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="password" name="password" placeholder="New Password" required>
                                        <label for="password">New Password</label>
                                        <button type="button" class="password-toggle" id="passwordToggle">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
                                        <label for="confirmPassword">Confirm Password</label>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary w-100 mb-3" id="resetButton">
                                        <span class="button-text">Reset Password</span>
                                        <span class="button-loader d-none">
                                            <span class="spinner-border spinner-border-sm me-2"></span>
                                            Resetting...
                                        </span>
                                    </button>
                                </form>
                                
                                <div class="auth-footer">
                                    <div class="text-center">
                                        <a href="/login" data-nav class="text-decoration-none">Back to Login</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function init() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
        showAlert('Invalid reset link. No token provided.', 'danger');
        return;
    }
    
    const form = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        const icon = passwordToggle.querySelector('i');
        icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
    confirmPasswordInput.addEventListener('input', () => {
        validatePasswordMatch();
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validatePasswordMatch()) {
            return;
        }
        const button = document.getElementById('resetButton');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        try {
            button.disabled = true;
            buttonText.classList.add('d-none');
            buttonLoader.classList.remove('d-none');
            const password = passwordInput.value;
        /*    console.log('Sending reset password request...');*/
            const response = await window.app.api.post('/auth/reset-password', {
                token: token,
                newPassword: password
            });
            showAlert('Password reset successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.app.router.navigate('/login');
            }, 2000);
            
        } catch (error) {
            showAlert(error.message || 'Failed to reset password. Please try again.', 'danger');
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

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.classList.add('is-invalid');
        confirmPasswordInput.nextElementSibling.textContent = 'Passwords do not match';
        return false;
    } else {
        confirmPasswordInput.classList.remove('is-invalid');
        return true;
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('resetPasswordAlerts');
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}