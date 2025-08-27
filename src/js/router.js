class Router {
    constructor() {
        this.currentPage = 'landing';
        this.templates = {};
        this.pageData = {};
        this.init();
    }

    init() {
        this.loadTemplates();
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigate(e.state.page, false);
            }
        });
        const initialPage = this.getInitialPage();
        this.navigate(initialPage, false);
    }

    getInitialPage() {
        const token = localStorage.getItem('authToken');
        if (token && this.isValidToken(token)) {
            return 'dashboard';
        }
        return 'landing';
    }
    isValidToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }
    async loadTemplates() {
        const templateFiles = [
            'layouts/main',
            'pages/landing', 'pages/login', 'pages/signup',
            'pages/dashboard', 'pages/wardrobe', 'pages/onboarding',
            'partials/navbar', 'partials/footer', 'partials/modals'
        ];
        for (const file of templateFiles) {
            try {
                const response = await fetch(`src/templates/${file}.hbs`);
                const templateText = await response.text();
                this.templates[file] = Handlebars.compile(templateText);
            } catch (error) {
                console.error(`Failed to load template ${file}:`, error);
            }
        }
    }

    async navigate(page, updateHistory = true) {
        try {
            const pageData = await this.loadPageData(page);
            const templateData = {
                ...pageData,
                page: page,
                title: this.getPageTitle(page),
                theme: localStorage.getItem('theme') || 'light',
                isAuthenticated: !!localStorage.getItem('authToken'),
                showMenuButton: page !== 'landing',
                showThemeSwitcher: true,
                showUserMenu: !!localStorage.getItem('authToken'),
                user: this.getUserData()
            };
            const mainTemplate = this.templates['layouts/main'];
            const pageTemplate = this.templates[`pages/${page}`];
            if (mainTemplate && pageTemplate) {
                const pageContent = pageTemplate(templateData);
                const fullHtml = mainTemplate({
                    ...templateData,
                    body: pageContent
                });
                
                document.documentElement.innerHTML = fullHtml;
                this.initPageComponents(page);

                if (updateHistory) {
                    history.pushState({ page }, '', window.location.pathname);
                }
            }
        } catch (error) {
            console.error(`Navigation error:`, error);
            this.showError('Failed to load page');
        }
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                return await this.loadDashboardData();
            case 'wardrobe':
                return await this.loadWardrobeData();
            case 'recommendations':
                return await this.loadRecommendationsData();
            default:
                return {};
        }
    }
    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            return await response.json();
        } catch {
            return { itemsCount: 0, outfitsCount: 0, recommendationsCount: 0 };
        }
    }

    async loadWardrobeData() {
        try {
            const response = await fetch('/api/items', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            const items = await response.json();
            return { items };
        } catch {
            return { items: [] };
        }
    }

    async loadRecommendationsData() {
        try {
            const response = await fetch('/api/recommendations/today', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            const recommendations = await response.json();
            return { recommendations };
        } catch {
            return { recommendations: [] };
        }
    }

    getPageTitle(page) {
        const titles = {
            landing: 'Home',
            login: 'Login',
            signup: 'Sign Up',
            dashboard: 'Dashboard',
            wardrobe: 'My Wardrobe',
            onboarding: 'Setup'
        };
        return titles[page] || 'Smart Wardrobe';
    }

    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : { avatar: 'https://placehold.co/32x32/f9fafb/6366f1?text=U' };
    }

    initPageComponents(page) {
        switch (page) {
            case 'landing':
                if (window.LandingPage) new LandingPage();
                break;
            case 'login':
                if (window.AuthPage) new AuthPage('login');
                break;
            case 'signup':
                if (window.AuthPage) new AuthPage('signup');
                break;
            case 'dashboard':
                if (window.DashboardPage) new DashboardPage();
                break;
            case 'wardrobe':
                if (window.WardrobePage) new WardrobePage();
                break;
        }
        
        this.initThemeSwitcher();
        this.initTooltips();
    }
    initThemeSwitcher() {
        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-bs-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.body.setAttribute('data-bs-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                const lightIcon = themeSwitcher.querySelector('.theme-icon-light');
                const darkIcon = themeSwitcher.querySelector('.theme-icon-dark');
                if (newTheme === 'dark') {
                    lightIcon.classList.add('d-none');
                    darkIcon.classList.remove('d-none');
                } else {
                    lightIcon.classList.remove('d-none');
                    darkIcon.classList.add('d-none');
                }
            });
        }
    }
    initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger position-fixed';
        errorDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});