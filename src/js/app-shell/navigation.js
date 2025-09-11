export function setupNavigation() {
    document.addEventListener('click', (e) => {
        const navButton = e.target.closest('[data-landing-nav]');
        if (!navButton) return;
        const href = navButton.getAttribute('href') || navButton.dataset.landingNav;
        e.preventDefault();
        forceLandingHide();
        window.app.router.navigate(href);
    });
}

export function forceLandingHide() {
    const landingEl = document.getElementById('landing-page');
    if (landingEl) {
        /*console.log('Landing element found - hiding');    */
        landingEl.style.display = 'none';
        landingEl.classList.add('d-none');
        landingEl.setAttribute('aria-hidden', 'true');
    }
    
    const landingElements = document.querySelectorAll('[data-landing]');
    landingElements.forEach(el => {
        /*console.log('Additional landing element found - hiding');*/
        el.style.display = 'none';
        el.classList.add('d-none');
    });
    
    const appShell = document.getElementById('app-shell');
    if (appShell) {
        appShell.style.display = '';
        appShell.classList.remove('d-none');
    } else {
        window.mount_app_shell?.();
    }
    
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
        const appShellEl = appRoot.querySelector('#app-shell');
        if (appShellEl) {
            const toRemove = [];
            for (let i = 0; i < appRoot.children.length; i++) {
                const child = appRoot.children[i];
                if (child.id !== 'app-shell') {
                    toRemove.push(child);
                }
            }
            toRemove.forEach(el => el.remove());
        }
    }
    
    document.body.classList.remove('landing-page');
    document.body.classList.add('app-page');
}

export function initNavigation() {
    setupNavigation();
}