export class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }

    init() {
        console.log('ThemeManager: Initializing with theme:', this.currentTheme);
        this.applyTheme(this.currentTheme);
        this.setupThemeEventDelegation();
    }

    setupThemeEventDelegation() {
        document.addEventListener('click', (e) => {
            const themeSwitcher = e.target.closest('#themeSwitcher') || 
                                e.target.closest('#themeSwitcherLanding') || 
                                e.target.closest('#themeSwitcherAuth') || 
                                e.target.closest('[data-theme-toggle]');
            if (themeSwitcher) {
                e.preventDefault();
                console.log('Theme switcher clicked via delegation');
                this.toggleTheme();
            }
        });
        this.updateThemeIcon();
        this.updateThemeLabels();
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                this.updateThemeIcon();
                this.updateThemeLabels();
                this.applyThemeToNewElements();
            }, 50);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setTheme(theme) {
        console.log('ThemeManager: Setting theme to:', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
        this.updateThemeIcon();
        this.updateThemeLabels();
        this.dispatchThemeChange(theme);
    }

    applyTheme(theme) {
        //triggering css varabiles
        document.documentElement.setAttribute('data-bs-theme', theme);
        document.body.setAttribute('data-bs-theme', theme);
        
        // Force CSS variables
        document.documentElement.style.setProperty('--force-update', Math.random());
        this.applyThemeToAllElements(theme);
    }

    applyThemeToAllElements(theme) {
        const elementsToUpdate = [
            '.dashboard-card',
            '.card',
            '.navbar',
            '.offcanvas',
            '.list-group-item',
            '.btn',
            '.form-control',
            '.form-select',
            '.stat-tile',
            '.activity-item',
            '.outfit-preview',
            'h1, h2, h3, h4, h5, h6',
            'p, span, div',
            '.text-muted'
        ];

        elementsToUpdate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.offsetHeight;
                el.style.display = '';
            });
        });
        this.updateNavbarTheme(theme);
        this.updateDashboardCards(theme);
    }
    applyThemeToNewElements() {
        this.applyThemeToAllElements(this.currentTheme);
    }

    updateDashboardCards(theme) {
        const cards = document.querySelectorAll('.dashboard-card, .card');
        cards.forEach(card => {
            card.style.removeProperty('background-color');
            card.style.removeProperty('color');
            card.style.removeProperty('border-color');
            card.offsetHeight;
        });
        const statTiles = document.querySelectorAll('.stat-tile');
        statTiles.forEach(tile => {
            tile.style.removeProperty('background-color');
            tile.style.removeProperty('color');
            tile.offsetHeight;
        });
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.style.removeProperty('background-color');
            item.style.removeProperty('color');
            item.offsetHeight;
        });
    }

    updateThemeIcon() {
        const lightIcons = document.querySelectorAll('.theme-icon-light, [data-theme-icon="light"]');
        const darkIcons = document.querySelectorAll('.theme-icon-dark, [data-theme-icon="dark"]');
        
        lightIcons.forEach(icon => {
            if (this.currentTheme === 'dark') {
                icon.classList.add('d-none');
            } else {
                icon.classList.remove('d-none');
            }
        });
        
        darkIcons.forEach(icon => {
            if (this.currentTheme === 'dark') {
                icon.classList.remove('d-none');
            } else {
                icon.classList.add('d-none');
            }
        });
    }

    updateThemeLabels() {
        const lightLabels = document.querySelectorAll('.theme-label-light, [data-theme-label="light"]');
        const darkLabels = document.querySelectorAll('.theme-label-dark, [data-theme-label="dark"]');
        
        lightLabels.forEach(label => {
            if (this.currentTheme === 'dark') {
                label.classList.add('d-none');
            } else {
                label.classList.remove('d-none');
            }
        });
        
        darkLabels.forEach(label => {
            if (this.currentTheme === 'dark') {
                label.classList.remove('d-none');
            } else {
                label.classList.add('d-none');
            }
        });
    }

    updateNavbarTheme(theme) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.removeProperty('background-color');
            navbar.style.removeProperty('border-color');
            navbar.offsetHeight;
        }

        const navbarBrand = document.querySelector('.navbar-brand');
        if (navbarBrand) {
            navbarBrand.style.removeProperty('color');
            navbarBrand.offsetHeight;
        }

        const navLinks = document.querySelectorAll('.navbar .nav-link');
        navLinks.forEach(link => {
            link.style.removeProperty('color');
            link.offsetHeight;
        });

        this.updateNavbarTogglerIcon(theme);
    }

    updateNavbarTogglerIcon(theme) {
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.classList.remove('navbar-light', 'navbar-dark');
            if (theme === 'dark') {
                navbarToggler.classList.add('navbar-dark');
            } else {
                navbarToggler.classList.add('navbar-light');
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('ThemeManager: Toggling theme from', this.currentTheme, 'to', newTheme);
        this.setTheme(newTheme);
        return newTheme;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    dispatchThemeChange(theme) {
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
}

export const themeManager = new ThemeManager();