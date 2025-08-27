class Router {
    constructor() {
        this.currentPage = 'landing';
        this.templates = {};
        this.pageData = {};
        this.templatesLoaded = false;
        console.log('Router constructor called');
        this.init();
    }

    async init() {
        console.log('Router init started');
        await this.loadTemplates();
        console.log('Templates loaded, navigating to landing');
        this.navigate('landing', false);
    }

    async loadTemplates() {
    console.log('Starting to load templates...');
    
    const templateFiles = [
        'layouts/main',
        'pages/landing', 'pages/login', 'pages/signup',
        'pages/dashboard', 'pages/wardrobe', 'pages/onboarding',
        'partials/navbar', 'partials/footer', 'partials/modals'
    ];

    let loadedCount = 0;
    let failedCount = 0;

    for (const file of templateFiles) {
        try {
            console.log(`Loading template: ${file}`);
            
            // Try multiple paths
            let response;
            const paths = [
                `src/templates/${file}.hbs`,
                `templates/${file}.hbs`,
                `${file}.hbs`,
                `/src/templates/${file}.hbs`
            ];
            
            for (const path of paths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`Found template at: ${path}`);
                        break;
                    } else {
                        console.log(`Path ${path} returned status: ${response.status}`);
                    }
                } catch (e) {
                    console.log(`Path ${path} failed:`, e.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Template not found: ${file} (status: ${response?.status})`);
            }
            
            let templateText = await response.text();
            console.log(`Template ${file} loaded, length: ${templateText.length} characters`);
            
            // Provide fallback content for empty templates
            if (templateText.trim().length === 0) {
                console.warn(`Template ${file} is empty, using fallback content`);
                templateText = this.getFallbackTemplate(file);
            }
            
            // Check if Handlebars is available
            if (typeof Handlebars === 'undefined') {
                throw new Error('Handlebars is not loaded');
            }
            
            const compiledTemplate = Handlebars.compile(templateText);
            this.templates[file] = compiledTemplate;
            
            // Register partials
            if (file.startsWith('partials/')) {
                const partialName = file.replace('partials/', '');
                Handlebars.registerPartial(partialName, compiledTemplate);
                console.log(`Registered partial: ${partialName}`);
            }
            
            loadedCount++;
            
        } catch (error) {
            console.error(`Failed to load template ${file}:`, error);
            failedCount++;
        }
    }
    
    console.log(`Templates loading complete: ${loadedCount} loaded, ${failedCount} failed`);
    console.log('Available templates:', Object.keys(this.templates));
    console.log('Registered partials:', Handlebars.partials);
    
    this.templatesLoaded = loadedCount > 0;
    
    // Register custom helpers
    this.registerHelpers();
    
    return this.templatesLoaded;
}

    registerHelpers() {
        if (typeof Handlebars === 'undefined') {
            console.error('Cannot register helpers: Handlebars not available');
            return;
        }

        Handlebars.registerHelper('gt', function(a, b) {
            return a > b;
        });
        
        Handlebars.registerHelper('formatDate', function(date) {
            return new Date(date).toLocaleDateString();
        });
        
        Handlebars.registerHelper('timeOfDay', function() {
            const hour = new Date().getHours();
            if (hour < 12) return 'morning';
            if (hour < 18) return 'afternoon';
            return 'evening';
        });
        
        console.log('Handlebars helpers registered');
    }

    async navigate(page, updateHistory = true, params = {}) {
        try {
            console.log(`Navigating to page: ${page}`);
            
            if (!this.templatesLoaded) {
                console.log('Templates not loaded yet, waiting...');
                await this.loadTemplates();
            }
            
            // Load page data if needed
            const pageData = await this.loadPageData(page, params);
            
            // Prepare template data
            const templateData = {
                ...pageData,
                page: page,
                title: this.getPageTitle(page),
                theme: localStorage.getItem('theme') || 'light',
                isAuthenticated: !!localStorage.getItem('authToken'),
                showMenuButton: page !== 'landing',
                showThemeSwitcher: true,
                showUserMenu: !!localStorage.getItem('authToken'),
                user: this.getUserData(),
                trial: params.trial || false
            };

            console.log('Template data prepared:', templateData);

            // Check if required templates exist
            const mainTemplate = this.templates['layouts/main'];
            const pageTemplate = this.templates[`pages/${page}`];
            
            if (!mainTemplate) {
                throw new Error('Main layout template not loaded');
            }
            
            if (!pageTemplate) {
                throw new Error(`Page template not loaded: ${page}`);
            }

            console.log('Rendering templates...');
            
            // Render page content first
            let pageContent;
            try {
                pageContent = pageTemplate(templateData);
                console.log(`Page template rendered, length: ${pageContent.length}`);
            } catch (error) {
                console.error(`Error rendering page template ${page}:`, error);
                throw new Error(`Page template error: ${error.message}`);
            }
            
            // Render main layout
            let fullHtml;
            try {
                fullHtml = mainTemplate({
                    ...templateData,
                    body: pageContent
                });
                console.log(`Main template rendered, length: ${fullHtml.length}`);
            } catch (error) {
                console.error('Error rendering main template:', error);
                throw new Error(`Main template error: ${error.message}`);
            }
            
            console.log('Templates rendered, updating DOM...');
            
            // Update DOM without page reload
            document.documentElement.innerHTML = fullHtml;
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            // Re-initialize components
            this.initPageComponents(page);
            
            // Update browser history without changing URL
            if (updateHistory) {
                history.pushState({ page, params }, '', window.location.pathname);
            }
            
            console.log(`Successfully navigated to ${page}`);
            
        } catch (error) {
            console.error(`Navigation error:`, error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                page: page
            });
            
            // Fallback: show basic content
            this.showFallbackContent(page, error.message);
        }
    }

    showFallbackContent(page, errorMessage) {
        const fallbackHtml = `
            <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
                <h1>Smart Wardrobe</h1>
                <p>Page: ${page}</p>
                <p style="color: red;">Error: ${errorMessage}</p>
                <p>Templates failed to render. Check console for details.</p>
                <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
                <br><br>
                <button onclick="router.navigate('landing', false)" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Landing Page</button>
            </div>
        `;
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = fallbackHtml;
        } else {
            // If app div doesn't exist, replace entire body
            document.body.innerHTML = fallbackHtml;
        }
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    async loadPageData(page, params) {
        // Load dynamic data for each page
        switch (page) {
            case 'dashboard':
                return await this.loadDashboardData();
            case 'signup':
                return { trial: params.trial };
            default:
                return {};
        }
    }

    async loadDashboardData() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return {};

            const response = await fetch('/api/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    stats: data.stats || {},
                    todaysOutfit: data.todaysOutfit,
                    weather: data.weather,
                    activities: data.activities || [],
                    trialRemaining: data.trialRemaining
                };
            }
        } catch (error) {
            console.warn('Failed to load dashboard data:', error);
        }
        
        return {
            stats: { totalItems: 0, totalOutfits: 0, favoriteItems: 0 },
            todaysOutfit: null,
            weather: null,
            activities: [],
            trialRemaining: null
        };
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
        return userData ? JSON.parse(userData) : { 
            firstName: 'User',
            avatar: 'https://placehold.co/32x32/f9fafb/6366f1?text=U' 
        };
    }

    initPageComponents(page) {
        // Re-initialize page-specific JavaScript
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
        }
        
        // Re-initialize common components
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
                
                // Update icons
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
        // Show error message
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

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});