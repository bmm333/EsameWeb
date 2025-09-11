export class SignupForm {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            requireTerms: true,
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
                            <h1 class="auth-title">Create your account</h1>
                            <p class="auth-subtitle">Start your journey to a smarter wardrobe</p>
                        </div>
                        
                        <div id="signupAlerts"></div>
                        
                        <form class="auth-form" id="signupForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="firstName" name="firstName" placeholder="John" required>
                                        <label for="firstName">First Name</label>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="lastName" name="lastName" placeholder="Doe" required>
                                        <label for="lastName">Last Name</label>
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                            </div>
                            
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
                            
                            <!-- Password Strength Indicator -->
                            <div class="password-strength mb-3" id="passwordStrength" style="display: none;">
                                <div class="password-strength-label">Password strength:</div>
                                <div class="password-strength-bar">
                                    <div class="password-strength-fill"></div>
                                </div>
                                <div class="password-requirements">
                                    <div class="requirement" data-requirement="length">
                                        <i class="bi bi-circle"></i>
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div class="requirement" data-requirement="lowercase">
                                        <i class="bi bi-circle"></i>
                                        <span>One lowercase letter</span>
                                    </div>
                                    <div class="requirement" data-requirement="uppercase">
                                        <i class="bi bi-circle"></i>
                                        <span>One uppercase letter</span>
                                    </div>
                                    <div class="requirement" data-requirement="number">
                                        <i class="bi bi-circle"></i>
                                        <span>One number</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-floating mb-3">
                                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
                                <label for="confirmPassword">Confirm Password</label>
                                <div class="invalid-feedback"></div>
                            </div>
                            
                            <!-- Trial Option -->
                            <div class="trial-option-card mb-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="enableTrial" name="enableTrial">
                                    <label class="form-check-label" for="enableTrial">
                                        <div class="trial-option-content">
                                            <div class="trial-header">
                                                <span class="trial-badge">FREE TRIAL</span>
                                                <strong>Try Smart Wardrobe for 3 days</strong>
                                            </div>
                                            <div class="trial-features">
                                                <small class="text-muted">
                                                    • Add up to 3 wardrobe items<br>
                                                    • Create 1 outfit<br>
                                                    • Basic recommendations
                                                </small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div class="trial-info mt-2" id="trialInfo" style="display: none;">
                                    <div class="alert alert-info mb-0">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <strong>Trial features:</strong> Perfect for exploring our basic features. 
                                        RFID device setup and advanced features require a full account.
                                    </div>
                                </div>
                            </div>
                            
                            ${this.options.requireTerms ? `
                            <div class="form-check mb-4">
                                <input class="form-check-input" type="checkbox" id="agreeTerms" name="agreeTerms" required>
                                <label class="form-check-label" for="agreeTerms">
                                    I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
                                </label>
                                <div class="invalid-feedback"></div>
                            </div>
                            ` : ''}
                            
                            <button type="submit" class="btn btn-primary w-100 mb-3" id="signupButton">
                                <span class="button-text">Create Account</span>
                                <span class="button-loader d-none">
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Creating account...
                                </span>
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p class="mb-0">Already have an account? <a href="/login" data-nav class="text-decoration-none fw-medium">Sign in</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const form = this.container.querySelector('#signupForm');
        const passwordInput = this.container.querySelector('#password');
        const confirmPasswordInput = this.container.querySelector('#confirmPassword');
        const passwordToggle = this.container.querySelector('#passwordToggle');
        const trialCheckbox = this.container.querySelector('#enableTrial');
        const trialInfo = this.container.querySelector('#trialInfo');

        // Password toggle
        passwordToggle?.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = passwordToggle.querySelector('i');
            icon.className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });

        // Trial checkbox toggle
        trialCheckbox?.addEventListener('change', () => {
            if (trialCheckbox.checked) {
                trialInfo.style.display = 'block';
            } else {
                trialInfo.style.display = 'none';
            }
        });

        // Password strength checking
        passwordInput?.addEventListener('input', () => {
            this.checkPasswordStrength(passwordInput.value);
        });

        passwordInput?.addEventListener('focus', () => {
            const strengthIndicator = this.container.querySelector('#passwordStrength');
            strengthIndicator.style.display = 'block';
        });

        // Confirm password validation
        confirmPasswordInput?.addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });
    }

    checkPasswordStrength(password) {
        const strengthIndicator = this.container.querySelector('#passwordStrength');
        const strengthFill = strengthIndicator.querySelector('.password-strength-fill');
        const requirements = strengthIndicator.querySelectorAll('.requirement');

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password)
        };

        let score = 0;
        requirements.forEach(req => {
            const type = req.dataset.requirement;
            const icon = req.querySelector('i');
            
            if (checks[type]) {
                req.classList.add('met');
                icon.className = 'bi bi-check-circle-fill text-success';
                score++;
            } else {
                req.classList.remove('met');
                icon.className = 'bi bi-circle';
            }
        });

        const percentage = (score / 4) * 100;
        strengthFill.style.width = `${percentage}%`;
        
        strengthFill.className = 'password-strength-fill';
        if (score <= 1) {
            strengthFill.classList.add('weak');
        } else if (score <= 2) {
            strengthFill.classList.add('fair');
        } else if (score <= 3) {
            strengthFill.classList.add('good');
        } else {
            strengthFill.classList.add('strong');
        }

        return score === 4;
    }

    validatePasswordMatch() {
        const password = this.container.querySelector('#password').value;
        const confirmPassword = this.container.querySelector('#confirmPassword').value;
        const confirmPasswordInput = this.container.querySelector('#confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordInput.nextElementSibling.textContent = 'Passwords do not match';
            return false;
        } else {
            confirmPasswordInput.classList.remove('is-invalid');
            confirmPasswordInput.nextElementSibling.textContent = '';
            return true;
        }
    }

    async handleSubmit(event) {
        const button = this.container.querySelector('#signupButton');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');
        
        try {
            // Validate form
            if (!this.validateForm()) {
                return;
            }

            // Show loading state
            button.disabled = true;
            buttonText.classList.add('d-none');
            buttonLoader.classList.remove('d-none');

            // Collect form data properly
            const form = event.target;
            const data = {
                firstName: form.firstName.value.trim(),
                lastName: form.lastName.value.trim(),
                email: form.email.value.trim(),
                password: form.password.value,
                enableTrial: form.enableTrial?.checked || false,
                agreeTerms: form.agreeTerms?.checked || false
            };

          /*  console.log('Signup form data:', data); // Debug log*/

            if (this.options.onSubmit) {
                const result = await this.options.onSubmit(data);
                
                if (data.enableTrial && result.trial?.enabled) {
                    this.showTrialSuccessMessage(result.trial);
                } else {
                    this.showAlert('Account created successfully! Please check your email for verification.', 'success');
                }
            }

        } catch (error) {
            this.showAlert(error.message || 'Signup failed', 'danger');
        } finally {
            // Reset button state
            button.disabled = false;
            buttonText.classList.remove('d-none');
            buttonLoader.classList.add('d-none');
        }
    }

    validateForm() {
        const password = this.container.querySelector('#password').value;
        const isPasswordStrong = this.checkPasswordStrength(password);
        const isPasswordMatch = this.validatePasswordMatch();

        if (!isPasswordStrong) {
            this.showAlert('Please ensure your password meets all requirements', 'warning');
            return false;
        }

        if (!isPasswordMatch) {
            this.showAlert('Passwords do not match', 'warning');
            return false;
        }

        return true;
    }

    showTrialSuccessMessage(trialInfo) {
        const expiryDate = new Date(trialInfo.expiresAt).toLocaleDateString();
        this.showAlert(`
            <strong>🎉 Trial account created!</strong><br>
            You have 3 days to explore Smart Wardrobe features.<br>
            <small class="text-muted">Trial expires: ${expiryDate}</small>
        `, 'success');
    }

    showAlert(message, type = 'info') {
        const alertContainer = this.container.querySelector('#signupAlerts');
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    clearAlerts() {
        const alertContainer = this.container.querySelector('#signupAlerts');
        alertContainer.innerHTML = '';
    }
}