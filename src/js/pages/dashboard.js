class DashboardManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3002' 
      : '';
    this.dashboardData = null;
    this.init();
  }

  async init() {
    // Wait for auth manager to be available
    if (!window.authManager) {
      setTimeout(() => this.init(), 100);
      return;
    }

    // Check authentication
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

    // Initialize push notifications
    if (window.PushService) {
      const pushService = new window.PushService();
      await pushService.initialize();
    }

    // Load dashboard data
    await this.loadDashboardData();
    
    // Setup event listeners
    this.bindEvents();
    
    // Show dashboard
    this.showDashboard();
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

    // Populate dashboard with data
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
    const user = this.dashboardData.user;
    if (!user) return;

    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
      greetingEl.textContent = `${user.greeting}, ${user.firstName}!`;
    }

    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && user.profilePicture) {
      userAvatar.src = user.profilePicture;
      userAvatar.alt = `${user.firstName}'s profile picture`;
    } else if (userAvatar) {
      // Fallback to initials
      const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase();
      userAvatar.src = `https://placehold.co/32x32/f9fafb/6366f1?text=${encodeURIComponent(initials)}`;
    }
  }
  setupGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12) greeting = 'Good afternoon';
    if (hour >= 18) greeting = 'Good evening';

    const user = window.authManager?.user;
    const userName = user?.firstName || user?.name || 'User';
    
    document.getElementById('welcomeMessage').innerHTML = 
      `${greeting}, <span id="userGreeting">${userName}</span>`;
  }
  populateStats() {
    if (!this.dashboardData?.stats) return;

    const stats = this.dashboardData.stats;
    document.getElementById('totalItems').textContent = stats.totalItems || '--';
    document.getElementById('totalOutfits').textContent = stats.totalOutfits || '--';
    document.getElementById('favoriteItems').textContent = stats.favoriteItems || '--';
    document.getElementById('itemsWithRfid').textContent = stats.itemsWithRfid || '--';
  }

  updateStatCard(statId, value) {
    const element = document.getElementById(statId);
    if (element) {
      element.textContent = value;
    }
  }

  populateTodaysOutfit() {
    const todaysOutfit = this.dashboardData.todaysOutfit;
    if (!todaysOutfit) return;

    const outfitContainer = document.getElementById('todaysOutfit');
    if (!outfitContainer) return;

    if (!todaysOutfit.hasOutfit) {
      outfitContainer.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-plus-circle fs-1 text-muted mb-3"></i>
          <h5>No outfits yet</h5>
          <p class="text-muted">${todaysOutfit.message}</p>
          <a href="outfit.html" class="btn btn-primary">Create Your First Outfit</a>
        </div>
      `;
      return;
    }

    const outfit = todaysOutfit.outfit;
    const availabilityClass = outfit.isAvailable ? 'text-success' : 'text-warning';
    const availabilityIcon = outfit.isAvailable ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    const availabilityText = outfit.isAvailable ? 'Available' : 'Some items unavailable';

    outfitContainer.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 class="mb-1">${outfit.name}</h5>
          <p class="text-muted mb-0">${outfit.occasion || 'Casual'}</p>
        </div>
        <span class="badge ${availabilityClass}">
          <i class="bi ${availabilityIcon} me-1"></i>${availabilityText}
        </span>
      </div>
      
      <div class="outfit-items mb-3">
        ${outfit.items?.map(item => `
          <span class="badge bg-light text-dark me-1 mb-1">${item.name}</span>
        `).join('') || ''}
      </div>
      
      ${!outfit.isAvailable ? `
        <div class="alert alert-warning py-2">
          <small><i class="bi bi-info-circle me-1"></i>Some items are currently unavailable</small>
        </div>
      ` : ''}
      
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='outfit.html?id=${outfit.id}'">
          <i class="bi bi-eye me-1"></i>View
        </button>
        <button class="btn btn-primary btn-sm" onclick="this.markOutfitWorn('${outfit.id}')">
          <i class="bi bi-check me-1"></i>Wear Today
        </button>
      </div>
    `;
  }

  populateRecentActivity() {
    const activities = this.dashboardData?.recentActivity || [];
    const container = document.getElementById('recentActivity');
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML = `
        <li class="activity-item text-center py-4">
          <p class="text-muted mb-0">No recent activity</p>
        </li>
      `;
      return;
    }

    container.innerHTML = activities.map(activity => `
      <li class="activity-item">
        <div class="activity-icon">
          <i class="bi ${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p>${activity.description}</p>
          <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
        </div>
      </li>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      'item_added': 'bi-plus-circle',
      'outfit_created': 'bi-palette',
      'item_worn': 'bi-check-circle',
      'rfid_scanned': 'bi-broadcast'
    };
    return icons[type] || 'bi-circle';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  populateQuickActions() {
    const quickActions = this.dashboardData.quickActions;
    if (!quickActions) return;

    const actionsContainer = document.getElementById('quickActions');
    if (!actionsContainer) return;

    let actionsHtml = '';

    if (quickActions.itemsInLaundry > 0) {
      actionsHtml += `
        <a href="wardrobe.html?filter=laundry" class="list-group-item list-group-item-action">
          <i class="bi bi-washing-machine me-2"></i>
          ${quickActions.itemsInLaundry} items in laundry
        </a>
      `;
    }

    if (quickActions.profileIncomplete) {
      actionsHtml += `
        <a href="settings.html" class="list-group-item list-group-item-action">
          <i class="bi bi-person-gear me-2"></i>
          Complete your profile
        </a>
      `;
    }

    // Add default actions
    actionsHtml += `
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

    actionsContainer.innerHTML = actionsHtml;
  }

  populateWeather() {
    const weather = this.dashboardData.todaysOutfit?.weather;
    if (!weather) return;

    const weatherContainer = document.getElementById('weatherWidget');
    if (!weatherContainer) return;

    weatherContainer.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi ${weather.icon} me-2"></i>
        <div>
          <div class="fw-bold">${weather.temp}°C</div>
          <div class="small text-muted">${weather.condition}</div>
        </div>
      </div>
    `;
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
        await this.loadDashboardData();
        this.populateTodaysOutfit();
      } else {
        throw new Error('Failed to mark outfit as worn');
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

    // Refresh dashboard button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        await this.loadDashboardData();
        this.showDashboard();
      });
    }
  }

  showError(message) {
    // Implementation for showing error messages
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