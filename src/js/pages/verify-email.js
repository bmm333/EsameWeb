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
                                        <i class="bi bi-envelope-check text-primary fs-1"></i>
                                    </div>
                                    <h1 class="auth-title">Email Verification</h1>
                                    <p class="auth-subtitle">Verifying your email address...</p>
                                </div>
                                
                                <div id="verificationContent">
                                    <div class="text-center py-4" id="loadingState">
                                        <div class="spinner-border text-primary mb-3" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p>Please wait while we verify your email...</p>
                                    </div>
                                    
                                    <div id="resultState">
                                        <!-- Results will be populated here -->
                                    </div>
                                </div>
                                
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
    console.log('📧 Initializing email verification page');
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
        showError('Invalid verification link. No token provided.');
        return;
    }

    try {
        const response = await window.app.api.get(`/auth/verify/${encodeURIComponent(token)}`);        
        if (response.message) {
            showSuccess(response.message, response.user);
        } else {
            throw new Error('Verification failed');
        }
        
    } catch (error) {
        const errorMessage = error.message || 'Verification failed. The link may be invalid or expired.';
        showError(errorMessage);
    }
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.app.router.navigate(href);
        });
    });
}

function showSuccess(message, user) {
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    loadingState.style.display = 'none';
    resultState.innerHTML = `
        <div class="text-center py-4">
            <div class="text-center mb-3">
                <i class="bi bi-check-circle-fill text-success"></i>
            </div>
            <h4 class="mb-3">Email Verified Successfully!</h4>
            <p class="mb-3">${message}</p>
            ${user?.firstName ? `<p class="mb-4">Welcome, ${user.firstName}!</p>` : ''}
            <div class="d-grid">
                <a href="/login" data-nav class="btn btn-primary">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Continue to Login
                </a>
            </div>
        </div>
    `;
    
    resultState.style.display = 'block';
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    
    loadingState.style.display = 'none';
    
    resultState.innerHTML = `
        <div class="text-center py-4">
            <div class="text-center mb-3">
                <i class="bi bi-exclamation-triangle-fill text-danger"></i>
            </div>
            <h4 class="mb-3">Verification Failed</h4>
            <p class="mb-4">${message}</p>
            <div class="d-grid">
                <a href="/login" data-nav class="btn btn-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Login
                </a>
            </div>
        </div>
    `;
    
    resultState.style.display = 'block';
}