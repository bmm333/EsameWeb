export function renderHeader() {
    return `
        <nav class="navbar fixed-top">
            <div class="container-fluid">
                <!-- Burger menu - always visible on all screen sizes -->
                <button class="navbar-toggler me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#sideMenu" aria-controls="sideMenu" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <!-- Brand - centered -->
                <a class="navbar-brand fw-bold mx-auto" href="/" data-nav>
                    Smart Wardrobe
                </a>
                
                <!--  div to balance the layout empty on right -->
                <div style="width: 48px;"></div>
            </div>
        </nav>
        
        <!-- Offcanvas Sidebar -->
        <div class="offcanvas offcanvas-start" tabindex="-1" id="sideMenu" aria-labelledby="sideMenuLabel">
            <div class="offcanvas-header border-bottom">
                <h5 class="offcanvas-title fw-bold" id="sideMenuLabel">
                    Smart Wardrobe
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body p-0 d-flex flex-column">
                <!-- Navigation Links -->
                <nav class="nav flex-column">
                    <a href="/dashboard" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-speedometer2 me-3 fs-5"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/wardrobe" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-grid-3x3-gap me-3 fs-5"></i>
                        <span>My Wardrobe</span>
                    </a>
                    <a href="/outfit" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-layers me-3 fs-5"></i>
                        <span>Outfits</span>
                    </a>
                    <a href="/recommendations" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-lightbulb me-3 fs-5"></i>
                        <span>Recommendations</span>
                    </a>
                    <!-- ✅ ADD ANALYTICS -->
                    <a href="/analytics" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-bar-chart-line me-3 fs-5"></i>
                        <span>Analytics</span>
                    </a>
                    <!-- ✅ ADD DEVICE SETUP -->
                    <a href="/device-setup" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-wifi me-3 fs-5"></i>
                        <span>Device Setup</span>
                    </a>
                    <a href="/settings" class="nav-link d-flex align-items-center py-3 px-4 border-bottom" data-nav>
                        <i class="bi bi-gear me-3 fs-5"></i>
                        <span>Settings</span>
                    </a>
                </nav>
                
                <!-- Theme and Logout buttons at bottom of sidebar -->
                <div class="mt-auto p-4 border-top">
                    <!-- Theme switcher in sidebar -->
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <span class="fw-medium">Theme</span>
                        <button id="themeSwitcher" class="btn btn-outline-secondary btn-sm d-flex align-items-center" data-theme-toggle title="Toggle theme">
                            <i class="bi bi-sun-fill theme-icon-light me-2" data-theme-icon="light"></i>
                            <i class="bi bi-moon-fill theme-icon-dark me-2 d-none" data-theme-icon="dark"></i>
                            <span class="theme-label-light" data-theme-label="light">Light</span>
                            <span class="theme-label-dark d-none" data-theme-label="dark">Dark</span>
                        </button>
                    </div>
                    
                    <!-- Logout button -->
                    <button class="btn btn-outline-danger w-100" id="sidebarLogoutBtn">
                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    `;
}
export function initHeader() {
    const logoutBtns = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Logout clicked');
                try {
                    if (window.app?.logout) {
                        await window.app.logout();
                    } else {
                        await window.authManager?.logout();
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
    });
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && window.app?.router) {
                window.app.router.navigate(href);
                const offcanvas = document.getElementById('sideMenu');
                if (offcanvas && window.bootstrap?.Offcanvas) {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                }
            }
        });
    });
    loadUserProfileForHeader();
    setTimeout(() => {
        if (window.app?.theme) {
            window.app.theme.updateThemeIcon();
            window.app.theme.updateThemeLabels();
            window.app.theme.applyThemeToAllElements(window.app.theme.getCurrentTheme());
        }
    }, 100);

    console.log('Header: Initialization complete');
}

async function loadUserProfileForHeader() {
    try {
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
        
        if (authPages.some(page => currentPath.startsWith(page))) {
            return;
        }
        let user = window.app?.userContext?.profile;
        if (!user && window.app?.api) {
            console.log('Header: Loading user profile...');
            const profileResponse = await window.app.api.get('/user/profile');
            user = profileResponse?.user;
            if (window.app.userContext) {
                window.app.userContext.profile = user;
            }
        }
        if (user) {
            console.log('Header: User profile loaded:', user.firstName);
            updateUserInHeader(user);
        } else {
            showLoginState();
        }
    } catch (error) {
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
        
        if (!authPages.some(page => currentPath.startsWith(page))) {
            console.error('Header: Error loading user profile:', error);
        }
        showLoginState();
    }
}

function showLoginState() {
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuButton && userDropdown) {
        userMenuButton.innerHTML = `
            <span class="navbar-text">
                <a href="/login" data-nav class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-box-arrow-in-right me-1"></i>Login
                </a>
            </span>
        `;
        userDropdown.style.display = 'none';
    }
}

function updateUserInHeader(user) {
    const userMenuButton = document.getElementById('userMenuButton');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuButton && userDropdown) {
        userMenuButton.innerHTML = `
            <img src="${user.profilePicture || 'https://placehold.co/32x32/f9fafb/6366f1?text=' + encodeURIComponent(user.firstName?.[0] || 'U')}" 
                 class="rounded-circle me-2" style="width: 32px; height: 32px;" alt="Profile">
            ${user.firstName || 'User'}
        `;
        userDropdown.style.display = 'block';
    }
}
