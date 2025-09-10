import { renderHeader, initHeader } from './header.js';

export function mount_app_shell() {
    const existing = document.getElementById('app-shell');
    if (existing) existing.remove();
    
    const shell = document.createElement('div');
    shell.id = 'app-shell';
    shell.innerHTML = `
        <div id="trial-status-container"></div>
        <div id="app-header"></div>
        <main id="app-view" class="main-content container py-4"></main>
    `;
    document.body.appendChild(shell); 
    const headerContainer = document.getElementById('app-header');
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader();
    }
    setTimeout(initTrialStatus, 100);
    
    document.body.classList.add('app-page');
    setTimeout(() => {
        initHeader();
        if (window.app?.theme) {
            window.app.theme.updateThemeIcon();
            window.app.theme.updateNavbarTheme(window.app.theme.getCurrentTheme());
        }
    }, 0);
}

async function initTrialStatus() {
    if (!window.app || !window.app.trial) {
        setTimeout(initTrialStatus, 100);
        return;
    }

    const container = document.getElementById('trial-status-container');
    if (!container) return;
    
    try {
        if (window.authManager?.isAuthenticated()) {
            const trialInfo = window.app.trial.getTrialInfo();
            
            if (trialInfo.isTrialUser && !trialInfo.isExpired) {
                const trialStatus = new window.app.trial.TrialStatus(container);
                await trialStatus.render();
            }
        }
    } catch (error) {
        console.error('Error initializing trial status:', error);
    }
}