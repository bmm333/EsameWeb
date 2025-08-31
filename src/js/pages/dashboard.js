class DashboardManager {
    constructor() {
        this.API_BASE = `http://${window.location.hostname}:3001`;
        this.dashboardData = null;
        this.init();
    }


    async init() {
    if (!window.authManager) {
      setTimeout(() => this.init(), 100);
      return;
    }
    if (!window.authManager.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    // Validate token
    try {
      const isValid = await window.authManager.validateToken();
      if (!isValid) {
        window.location.href = '/login.html';
        return;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      window.location.href = '/login.html';
      return;
    }
    await this.loadUserProfile();
    await this.loadDashboardData();
    this.bindEvents();
    this.showDashboard();
  }
    async loadUserProfile() {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/auth/profile`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const payload = await response.json();
                // backend returns { statusCode, user: { ... } }
                const user = payload?.user || payload;
                const userAvatar = document.getElementById('userAvatar');
                if (userAvatar) {
                    userAvatar.src = user.profilePicture || 'https://placehold.co/32x32/f9fafb/6366f1?text=No+Photo';
                }
                const greetingEl = document.getElementById('userGreeting');
                if (greetingEl) {
                    greetingEl.textContent = user.firstName || 'User';
                }
            } else {
                console.error('Failed to load profile:', response.status);
            }
        } catch (error) {
            console.error('Profile load error:', error);
        }
    }


    async loadDashboardData() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        this.dashboardData = await response.json();
        console.log('Dashboard data loaded:', this.dashboardData);
      } else {
        console.error('Failed to load dashboard data:', response.status);
        this.showError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data load error:', error);
      this.showError('Unable to connect to server');
    }
  }

  showDashboard() {
    // Hide loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }

    // Show main content
    const contentWrapper = document.getElementById('contentWrapper');
    if (contentWrapper) {
      contentWrapper.style.display = 'block';
    }

    // Populating dashboard with data
    if (this.dashboardData) {
      this.populateUserGreeting();
      this.populateStats();
      this.populateTodaysOutfit();
      this.populateRecentActivity();
      this.populateQuickActions();
      this.populateWeather();
    }
  }

  populateUserGreeting() {
    const greeting = this.setupGreeting();
    document.getElementById('welcomeMessage').innerHTML = `${greeting}, <span id="userGreeting">${this.dashboardData.user?.firstName || 'User'}</span>`;
  }

  setupGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  populateStats() {
    const stats = this.dashboardData.stats;
    if (!stats) return;

    const statsContainer = document.getElementById('wardrobeStats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value" id="totalItems">${stats.totalItems || 0}</div>
        <div class="stat-label">Total Items</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="totalOutfits">${stats.totalOutfits || 0}</div>
        <div class="stat-label">Outfits</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" id="favoriteItems">${stats.favoriteItems || 0}</div>
        <div class="stat-label">Favorites</div>
      </div>
    `;
  }

  populateTodaysOutfit() {
    const outfit = this.dashboardData.todaysOutfit;
    if (!outfit) return;

    const outfitContainer = document.getElementById('todayOutfit');
    if (!outfitContainer) return;

    outfitContainer.innerHTML = `
      <div class="outfit-image">
        <img src="${outfit.image || 'https://placehold.co/400x400/f9fafb/6366f1?text=Outfit'}" alt="Todays outfit" class="img-fluid rounded" id="outfitImage">
      </div>
      <div class="outfit-details">
        <h3 id="outfitTitle">${outfit.name || 'Suggested Outfit'}</h3>
        <ul class="outfit-items" id="outfitItemsList">
          ${outfit.items?.map(item => `<li>${item.name}</li>`).join('') || '<li>No items</li>'}
        </ul>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='outfit.html?id=${outfit.id}'">
            <i class="bi bi-eye me-1"></i>View
          </button>
          <button class="btn btn-primary btn-sm" onclick="this.markOutfitWorn('${outfit.id}')">
            <i class="bi bi-check me-1"></i>Wear Today
          </button>
        </div>
      </div>
    `;
  }

  populateRecentActivity() {
    const activities = this.dashboardData.recentActivity;
    if (!activities || activities.length === 0) return;

    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;

    const activityHtml = activities.map(activity => `
      <li class="activity-item">
        <div class="activity-icon"><i class="bi ${this.getActivityIcon(activity.type)}"></i></div>
        <div class="activity-content">
          <p>${activity.description}</p>
          <span class="activity-time">${this.formatDate(activity.timestamp)}</span>
        </div>
      </li>
    `).join('');

    activityContainer.innerHTML = activityHtml;
  }

  getActivityIcon(type) {
    const icons = {
      'item_added': 'bi-plus-circle',
      'outfit_created': 'bi-palette',
      'item_worn': 'bi-check-circle',
      'default': 'bi-circle'
    };
    return icons[type] || icons.default;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  populateQuickActions() {
    const actionsContainer = document.getElementById('quickActions');
    if (!actionsContainer) return;

    // Simplified: Static actions, no complex logic
    actionsContainer.innerHTML = `
      <a href="wardrobe.html" class="list-group-item list-group-item-action">
        <i class="bi bi-plus-circle me-2"></i>
        Add new item
      </a>
      <a href="outfit.html" class="list-group-item list-group-item-action">
        <i class="bi bi-palette me-2"></i>
        Create outfit
      </a>
      <a href="recommendations.html" class="list-group-item list-group-item-action">
        <i class="bi bi-lightbulb me-2"></i>
        Get recommendations
      </a>
    `;
  }

    populateWeather() {
        const weather = this.dashboardData.todaysOutfit?.weather;
        const weatherContainer = document.getElementById('weatherInfo');
        if (!weatherContainer) return;

        if (weather && typeof weather.temp !== 'undefined') {
            weatherContainer.innerHTML = `
        <i class="bi ${weather.icon || 'bi-cloud-sun'} me-1"></i>
        <span id="weatherTemp">${weather.temp}°C</span>
      `;
            return;
        }
        this.fetchAndRenderWeather();
    }

    async fetchAndRenderWeather() {
        const weatherContainer = document.getElementById('weatherInfo');
        if (!weatherContainer) return;

        try {
            const token = window.authManager?.token;
            const preferred =
                this.dashboardData?.user?.defaultWeatherLocation ||
                localStorage.getItem('defaultWeatherLocation') ||
                'London';
            const res = await fetch(
                `${this.API_BASE}/weather/current?location=${encodeURIComponent(preferred)}`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const icon = data.icon || 'bi-cloud-sun';
            const temp = typeof data.temperature !== 'undefined'
                ? data.temperature
                : (typeof data.temp !== 'undefined' ? data.temp : '--');

            weatherContainer.innerHTML = `
        <i class="bi ${icon} me-1"></i>
        <span id="weatherTemp">${temp}°C</span>
      `;
        } catch (err) {
            console.warn('Weather fetch failed:', err);
            weatherContainer.innerHTML = `
        <i class="bi bi-cloud-slash me-1"></i>
        <span id="weatherTemp">--</span>
      `;
        }
    }




    async markOutfitWorn(outfitId) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/outfit/${outfitId}/wear`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        this.showSuccess('Outfit marked as worn!');
        await this.loadDashboardData(); // Refresh data
        this.showDashboard();
      } else {
        throw new Error('Failed to mark outfit');
      }
    } catch (error) {
      console.error('Mark outfit worn error:', error);
      this.showError('Failed to mark outfit as worn');
    }
  }

  bindEvents() {
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.authManager.logout();
      });
    }

    // Theme switcher
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.addEventListener('click', () => {
        const body = document.body;
        const currentTheme = body.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      });
    }
  }

  showError(message) {
    console.error(message);
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }

  showSuccess(message) {
    console.log(message);
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboardManager = new DashboardManager();
});