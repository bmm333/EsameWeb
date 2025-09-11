const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
if (isProd) {
  console.log = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.error = () => {};
}
import { ApiClient } from './services/api-client.js';
import { AuthManager } from './services/auth-manager.js';
import { UserContext } from './services/user-context.js';
import { themeManager } from './services/theme-manager.js';
import { Router } from './app-shell/router.js';
import { mount_app_shell } from './app-shell/app-shell.js';
import { initNavigation, forceLandingHide } from './app-shell/navigation.js';
import { TrialStatus } from './components/trial-status.js';
import { TrialLimits } from './services/trial-limits.js';

const load_verify_email = () => import('./pages/verify-email.js');
const load_forgot_password = () => import('./pages/forgot-password.js');
const load_reset_password = () => import('./pages/reset-password.js');
const load_login = () => import('./pages/auth.js');
const load_dashboard = () => import('./pages/dashboard.js');
const load_wardrobe = () => import('./pages/wardrobe.js');
const load_outfit = () => import('./pages/outfit.js');
const load_settings = () => import('./pages/settings.js');
const load_device_setup = () => import('./pages/device-setup.js');
const load_analytics = () => import('./pages/analytics.js');
const load_recommendations = () => import('./pages/recommendations.js');
const load_onboarding = () => import('./pages/onboarding.js');

function get_token() {
    return window.authManager?.token;
}
function guard(path) {
    const authPaths = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
    if (authPaths.includes(path)) {
        return true;
    }

    const auth = window.authManager?.isAuthenticated();
    if (!auth && path !== '/') {
        window.location.href = '/login';
        return false;
    }
    
    return true;
}

function showLandingPage() {
    const appShell = document.getElementById('app-shell');
    if (appShell) appShell.classList.add('d-none');

    document.body.classList.add('landing-page');
    document.body.classList.remove('app-page');

    if (!document.getElementById('landing-page')) {
        const landingEl = document.createElement('div');
        landingEl.id = 'landing-page';
        landingEl.setAttribute('data-landing', 'true');
        document.body.appendChild(landingEl);
        import('./pages/landing.js').then(module => {
            landingEl.innerHTML = module.render();
            module.init();
        });
    } else {
        document.getElementById('landing-page').classList.remove('d-none');
    }
}

function showAppShell() {    
    forceLandingHide();
    
    document.body.classList.remove('landing-page');
    document.body.classList.add('app-page');

    const appShell = document.getElementById('app-shell');
    if (appShell) {
        appShell.classList.remove('d-none');
        appShell.style.display = '';
    } else {
        mount_app_shell();
    }
}

async function init() {
    window.authManager = new AuthManager();
    themeManager.init();
    const api = new ApiClient(get_token);
    const user_context = new UserContext(api);
    const trialLimits = new TrialLimits(api);
    if (window.authManager.isAuthenticated()) {
        try {
            await user_context.load();
        } catch (e) {
            console.warn('Profile load failed:', e.message);
        }
    }

    window.app = {
        api,
        userContext: user_context,
        theme: themeManager,
        router: null,
        trial: {
            TrialStatus,
            TrialLimits: TrialLimits,
            isTrialUser: () => {
                try {
                    const user = window.app?.userContext?.profile;
                    return user?.subscriptionTier === 'trial';
                } catch {
                    return false;
                }
            },
            getTrialInfo: () => {
                try {
                    const user = window.app?.userContext?.profile;
                    if (!user) return { isTrialUser: false };
                    
                    const isTrialUser = user.subscriptionTier === 'trial';
                    const isExpired = user.trialExpires && new Date() > new Date(user.trialExpires);
                    
                    return {
                        isTrialUser,
                        isExpired,
                        itemsUsed: user.trialItemsUsed || 0,
                        outfitsUsed: user.trialOutfitsUsed || 0,
                        maxItems: 3,
                        maxOutfits: 1,
                        trialExpires: user.trialExpires
                    };
                } catch {
                    return { isTrialUser: false };
                }
            }
        },
        isTrialUser: async () => {
            try {
                const user = window.app?.userContext?.profile;
                return user?.subscriptionTier === 'trial';
            } catch {
                return false;
            }
        },
        async logout() {
            await window.authManager.logout();
            user_context.clear();
            window.location.href = '/login';
        }
    };
    
    window.showAppShell = showAppShell;
    window.showLandingPage = showLandingPage;
    window.forceLandingHide = forceLandingHide;
    window.mount_app_shell = mount_app_shell;
    const router = new Router({
        outlet_id: 'app-view',
        guard,
        routes: [
            { 
                path: '/', 
                load: async () => {
                    const authed = window.authManager.isAuthenticated();
                    if (authed) {
                        showAppShell();
                        router.navigate('/dashboard');
                        return { render: () => '', init: () => {} };
                    } else {
                        showLandingPage();
                        return { render: () => '', init: () => {} };
                    }
                }
            },
            { 
                path: '/login', 
                load: async () => {
                    showAppShell();
                    return load_login();
                }
            },
            { 
                path: '/signup', 
                load: async () => {
                    showAppShell();
                    return load_login();
                }
            },
            { 
                path: '/dashboard', 
                load: async () => { 
                    showAppShell();
                    try {
                        const user = window.app.userContext.get();
                        if (user && !user.profileSetupCompleted) {
                            window.app.router.navigate('/onboarding');
                            return { render: () => '', init: () => {} };
                        }
                    } catch (e) {
                        console.warn('Could not check profile setup status');
                    }
                    
                    return load_dashboard(); 
                } 
            },
            { 
                path: '/wardrobe', 
                load: () => { 
                    showAppShell(); 
                    return load_wardrobe(); 
                } 
            },
            { 
                path: '/outfit', 
                load: () => { 
                    showAppShell(); 
                    return load_outfit(); 
                } 
            },
            { 
                path: '/settings', 
                load: () => { 
                    showAppShell(); 
                    return load_settings(); 
                } 
            },
            { 
                path: '/device-setup', 
                load: async () => { 
                    showAppShell();
                    
                    if (window.app.trial.isTrialUser()) {
                        const trialInfo = window.app.trial.getTrialInfo();
                        if (trialInfo.isTrialUser) {
                            window.app.trial.TrialLimits.showLimitModal(
                                'Device setup is not available during your trial period. Upgrade to access RFID device configuration.',
                                true
                            );
                            router.navigate('/dashboard');
                            return { render: () => '', init: () => {} };
                        }
                    }
                    return load_device_setup(); 
                } 
            },
            { path: '/analytics', load: () => { showAppShell(); return load_analytics(); } },
            { path: '/recommendations', load: () => { showAppShell(); return load_recommendations(); } },
            { path: '/onboarding', load: () => { showAppShell(); return load_onboarding(); } },
            { path: '/verify-email', load: () => { showAppShell(); return load_verify_email(); } },
            { path: '/forgot-password', load: () => { showAppShell(); return load_forgot_password(); } },
            { path: '/reset-password', load: () => { showAppShell(); return load_reset_password(); } },
        ],
        fallback: () => {
            showAppShell();
            return { 
                render: () => '<div class="container py-5 text-center"><h1>404 - Page Not Found</h1></div>', 
                init: () => {} 
            };
        }
    });

    window.app.router = router;
    mount_app_shell();
    initNavigation();
    router.start();
}

document.addEventListener('DOMContentLoaded', init);
