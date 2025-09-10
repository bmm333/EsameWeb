export class Router {
    constructor({ routes, outlet_id = 'app-view', guard } = {}) {
        this.routes = routes || [];
        this.outlet_id = outlet_id;
        this.outlet = null;
        this.guard = guard;
        this.isStarted = false;
        this.currentPath = null;
        console.log('Router initialized with', this.routes.length, 'routes');
    }

    start() {
        if (this.isStarted) return;
        this.isStarted = true;

        window.addEventListener('popstate', () => {
            this.resolve(window.location.pathname);
        });
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
            if (a.target === '_blank') return;
            if (href.startsWith('/')) {
                e.preventDefault();
                this.navigate(href);
            }
        });

        this.resolve(window.location.pathname);
    }

    async resolve(path) {
        if (!path) path = '/';
        if (this.currentPath === path) {
            return;
        }
        console.log('Resolving route:', path);

        const route = this.routes.find(r => r.path === path) ||
                      this.routes.find(r => r.path === '*');

        if (!route) {
            console.warn('No route match for', path);
            return;
        }

        if (this.guard) {
            const ok = await this.guard(path);
            if (!ok) return;
        }
        const isPublicLanding = path === '/';
        const isPublicAuth = ['/login','/signup','/verify-email','/forgot-password','/reset-password'].includes(path);
        if (!isPublicLanding) {
            if (!document.getElementById('app-shell')) {
                if (window.showAppShell) window.showAppShell();
                else if (window.mount_app_shell) window.mount_app_shell();
            }
        }
        let mod;
        try {
            mod = await route.load();
        } catch (e) {
            console.error('Route load failed:', e);
            return this.renderError('Failed to load route');
        }

        if (isPublicLanding) {
            this.currentPath = path;
            if (typeof mod.init === 'function') {
                try { await mod.init(); } catch(err){ console.error('Landing init error', err); }
            }
            console.log('Route resolved (landing):', path);
            return;
        }

        this.outlet = document.getElementById(this.outlet_id);
        if (!this.outlet) {
            if (!document.getElementById('app-shell') && window.mount_app_shell) {
                window.mount_app_shell();
                this.outlet = document.getElementById(this.outlet_id);
            }
        }
        if (!this.outlet) {
            console.error('Outlet not found:', this.outlet_id);
            return;
        }

        if (typeof mod.render === 'function') {
            const html = await mod.render();
            this.outlet.innerHTML = html;
        } else {
            console.warn('Module has no render() for', path);
            this.outlet.innerHTML = '';
        }

        if (typeof mod.init === 'function') {
            try { await mod.init(); } catch(e){ console.error('Page init error:', e); }
        }

        this.currentPath = path;
        console.log('Route resolved:', path);
    }

    navigate(path) {
        if (!path || path === this.currentPath) return;
        window.history.pushState({}, '', path);
        this.resolve(path);
    }

    renderError(message) {
        if (!this.outlet) {
            this.outlet = document.getElementById(this.outlet_id);
        }
        if (this.outlet) {
            this.outlet.innerHTML = `
                <div class="container py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>${message}
                    </div>
                </div>`;
        }
    }
}