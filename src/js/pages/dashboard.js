import { DashboardClient } from '../services/dashboard-client.js';
import { WeatherClient } from '../services/weather-client.js';

export function render() {
  return `
    <div class="container py-4" id="dashboardPage">
      <header class="dashboard-header mb-5">
        <h1 id="welcomeMessage">Good day, <span id="userGreeting">User</span></h1>
        <p class="text-muted">Your Wardrobe Overview</p>
      </header>
      
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="dashboard-card h-100">
            <div class="dashboard-card-header d-flex align-items-center justify-content-between">
              <h2 class="mb-0">Today's Outfit</h2>
              <div class="weather-badge" id="weatherInfo" aria-live="polite" aria-busy="true">
                <div class="d-flex align-items-center">
                  <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading weather...</span>
                  </div>
                  <span>Loading...</span>
                </div>
              </div>
            </div>
            <div class="dashboard-card-body">
              <div class="outfit-display d-flex flex-column align-items-center justify-content-center" id="todayOutfit" aria-live="polite" aria-busy="true">
                <div class="text-center text-muted py-5">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-3">Loading outfit suggestions...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="row g-4 h-100">
            <div class="col-12">
              <div class="dashboard-card">
                <div class="dashboard-card-header">
                  <h2 class="mb-0">Wardrobe Stats</h2>
                </div>
                <div class="dashboard-card-body">
                  <div id="wardrobeStats" aria-live="polite" aria-busy="true">
                    <div class="text-center text-muted py-3">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <p class="mt-3">Loading stats...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-12">
              <div class="dashboard-card">
                <div class="dashboard-card-header">
                  <h2 class="mb-0">Quick Actions</h2>
                </div>
                <div class="dashboard-card-body">
                  <div class="list-group" id="quickActions">
                    <a href="/wardrobe" data-nav class="list-group-item list-group-item-action">
                      <i class="bi bi-plus-circle me-2"></i>Add new item
                    </a>
                    <a href="/outfit" data-nav class="list-group-item list-group-item-action">
                      <i class="bi bi-palette me-2"></i>Create outfit
                    </a>
                    <a href="/recommendations" data-nav class="list-group-item list-group-item-action">
                      <i class="bi bi-lightbulb me-2"></i>Get recommendations
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h2 class="mb-0">Recent Activity</h2>
            </div>
            <div class="dashboard-card-body">
              <ul class="activity-list" id="recentActivity" aria-live="polite" aria-busy="true">
                <li class="text-center text-muted py-3">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-3">Loading activity...</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export async function init() {
  /*console.log('Dashboard: Initializing...');*/
  document.querySelectorAll('#dashboardPage [data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.app.router.navigate(a.getAttribute('href'));
    });
  });

  const dashClient = new DashboardClient(window.app.api);
  const weatherClient = new WeatherClient(window.app.api);
  await loadUserProfile();
  await loadWeather(weatherClient);
  await loadDashboardData(dashClient);
}

async function loadDashboardData(dashClient) {
  /*console.log('Dashboard: Loading dashboard data...');*/
  loadStats(dashClient);
  loadTodaysOutfit(dashClient);
  loadRecentActivity(dashClient);
}

async function loadUserProfile() {
  try {
    let user = window.app?.userContext?.profile;
    if (!user) {
      /*console.log('Dashboard: Fetching user profile...');*/
      const profileResponse = await window.app.api.get('/user/profile');
      user = profileResponse?.user;
      if (window.app.userContext) {
        window.app.userContext.profile = user;
      }
    }
    if (user?.firstName) {
      const greetingEl = document.getElementById('userGreeting');
      if (greetingEl) greetingEl.textContent = user.firstName;
    }
    if (user) {
      updateHeaderProfile(user);
    }
  } catch (error) {
    console.error('Dashboard: Error loading user profile:', error);
  }
}

function updateHeaderProfile(user) {
  const profilePic = document.querySelector('.navbar .user-avatar');
  const profileName = document.querySelector('.navbar .user-name');
  
  if (profilePic && user.profilePicture) {
    profilePic.src = user.profilePicture;
  }
  
  if (profileName) {
    profileName.textContent = user.firstName || 'User';
  }
}

async function loadWeather(weatherClient) {
  try {
    const weatherInfo = document.getElementById('weatherInfo');
    if (!weatherInfo) return;
    let user = window.app?.userContext?.profile;
    if (!user?.location) {
      const profileResponse = await window.app.api.get('/user/profile');
      user = profileResponse?.user;
    }

    if (user?.location) {
      /*console.log('Dashboard: Fetching weather for:', user.location);*/
      const weather = await weatherClient.getCurrent(user.location);
      
      if (weather && weather.temperature !== undefined) {
        const temp = Math.round(weather.temperature);
        const condition = weather.condition || 'clear';
        const icon = getWeatherIcon(condition);
        
    weatherInfo.innerHTML = `
          <div class="d-flex align-items-center">
      <i class="bi bi-${icon} me-2" aria-hidden="true"></i>
            <span>${temp}°C</span>
          </div>
        `;
    weatherInfo.setAttribute('aria-busy', 'false');
      } else {
        throw new Error('Invalid weather data');
      }
    } else {
    weatherInfo.innerHTML = `
        <div class="d-flex align-items-center text-muted">
      <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
          <span>No location</span>
        </div>
      `;
    weatherInfo.setAttribute('aria-busy', 'false');
    }
  } catch (error) {
    console.error('Dashboard: Error loading weather:', error);
    const weatherInfo = document.getElementById('weatherInfo');
    if (weatherInfo) {
    weatherInfo.innerHTML = `
        <div class="d-flex align-items-center text-muted">
      <i class="bi bi-cloud-slash me-2" aria-hidden="true"></i>
          <span>Weather unavailable</span>
        </div>
      `;
    weatherInfo.setAttribute('aria-busy', 'false');
    }
  }
}

function getWeatherIcon(condition) {
  const iconMap = {
    'clear': 'sun',
    'sunny': 'sun',
    'cloudy': 'cloud',
    'partly-cloudy': 'cloud-sun',
    'overcast': 'clouds',
    'rainy': 'cloud-rain',
    'drizzle': 'cloud-drizzle',
    'snowy': 'cloud-snow',
    'stormy': 'cloud-lightning',
    'foggy': 'cloud-fog',
    'windy': 'wind'
  };
  
  return iconMap[condition.toLowerCase()] || 'cloud-sun';
}

async function loadStats(dashClient) {
  try {
    /*console.log('Dashboard: Fetching stats...');*/
    const stats = await dashClient.getStats();
    /*console.log('Dashboard: Stats response:', stats);*/

    const statsEl = document.getElementById('wardrobeStats');
    if (statsEl && stats) {
      const totalItems = stats.totalItems || 0;
      const totalOutfits = stats.totalOutfits || 0;
      const availableItems = stats.availableItems || 0;
      const wornItems = stats.wornItems || 0;
      
  statsEl.innerHTML = `
        <div class="row g-3">
          <div class="col-6">
            <div class="stat-tile">
              <div class="stat-value">${totalItems}</div>
              <div class="stat-label">Total Items</div>
            </div>
          </div>
          <div class="col-6">
            <div class="stat-tile">
              <div class="stat-value">${totalOutfits}</div>
              <div class="stat-label">Outfits</div>
            </div>
          </div>
          <div class="col-6">
            <div class="stat-tile">
              <div class="stat-value text-success">${availableItems}</div>
              <div class="stat-label">Available</div>
            </div>
          </div>
          <div class="col-6">
            <div class="stat-tile">
              <div class="stat-value text-warning">${wornItems}</div>
              <div class="stat-label">Being Worn</div>
            </div>
          </div>
        </div>`;
      statsEl.setAttribute('aria-busy', 'false');
    } else {
      throw new Error('No stats data received');
    }
  } catch (error) {
    console.error('Dashboard: Error loading stats:', error);
    const statsEl = document.getElementById('wardrobeStats');
    if (statsEl) {
    statsEl.innerHTML = `
        <div class="text-center text-muted py-3">
      <i class="bi bi-exclamation-triangle fs-1 mb-3" aria-hidden="true"></i>
          <h6>Unable to load stats</h6>
          <p class="small">Error: ${error.message}</p>
      <button class="btn btn-sm btn-outline-primary" type="button" onclick="location.reload()">
            Retry
          </button>
        </div>`;
  statsEl.setAttribute('aria-busy', 'false');
    }
  }
}

async function loadTodaysOutfit(dashClient) {
  try {
    /*console.log('Dashboard: Fetching today\'s outfit...');*/
    const outfitData = await dashClient.getTodaysOutfit();
    /*console.log('Dashboard: Outfit response:', outfitData);*/

    const outfitEl = document.getElementById('todayOutfit');
    if (!outfitEl) return;
    
    if (outfitData?.hasOutfit && outfitData.outfit?.items?.length > 0) {
      const outfit = outfitData.outfit;
      outfitEl.innerHTML = `
        <div class="outfit-preview">
          <h5 class="mb-3">${outfit.name || 'Suggested Outfit'}</h5>
          <div class="row g-3">
            ${outfit.items.slice(0, 4).map(item => `
              <div class="col-6 col-md-3">
                <div class="outfit-item text-center">
                  <img src="${item.imageUrl || 'https://placehold.co/80x80/f9fafb/6366f1?text=' + encodeURIComponent(item.name)}" 
                       class="img-fluid rounded mb-2" alt="${item.name ? item.name.replaceAll('"', '&quot;') : 'Outfit item'}">
                  <small class="d-block">${item.name}</small>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="mt-3 row">
            <button class="btn btn-outline-primary btn-md me-2" type="button" onclick="window.app.router.navigate('/recommendations')">
              <i class="bi bi-lightbulb me-1" aria-hidden="true"></i>Get Recommendations
            </button>
            <button class="btn btn-primary btn-md" type="button" onclick="window.app.router.navigate('/wardrobe')">
              <i class="bi bi-eye me-1" aria-hidden="true"></i>View Wardrobe
            </button>
          </div>
        </div>
      `;
      outfitEl.setAttribute('aria-busy', 'false');
    } else {
    outfitEl.innerHTML = `
        <div class="text-center text-muted py-4">
      <i class="bi bi-layers fs-1 mb-3" aria-hidden="true"></i>
          <h5>${outfitData?.message || 'No outfit suggestions available'}</h5>
          <p class="small mb-3">Start by adding items to your wardrobe!</p>
      <button class="btn btn-primary" type="button" onclick="window.app.router.navigate('/wardrobe')">
            <i class="bi bi-plus me-1"></i>Add Items
          </button>
        </div>
      `;
    outfitEl.setAttribute('aria-busy', 'false');
    }
  } catch (error) {
    console.error('Dashboard: Error loading outfit:', error);
    const outfitEl = document.getElementById('todayOutfit');
    if (outfitEl) {
    outfitEl.innerHTML = `
        <div class="text-center text-muted py-4">
      <i class="bi bi-exclamation-triangle fs-1 mb-3" aria-hidden="true"></i>
          <h6>Unable to load outfit</h6>
          <p class="small">Error: ${error.message}</p>
        </div>
      `;
    outfitEl.setAttribute('aria-busy', 'false');
    }
  }
}

async function loadRecentActivity(dashClient) {
  try {
  /*  console.log('Dashboard: Fetching recent activity...');*/
    const activities = await dashClient.getRecentActivity();
   /* console.log('Dashboard: Activity response:', activities);*/

    const activityEl = document.getElementById('recentActivity');
    if (!activityEl) return;
    
    if (activities && activities.length > 0) {
  activityEl.innerHTML = activities.map(activity => `
        <li class="activity-item d-flex align-items-center py-2">
          <div class="activity-icon me-3">
    <i class="bi bi-${activity.icon || 'dot'} text-primary" aria-hidden="true"></i>
          </div>
          <div class="activity-content flex-grow-1">
            <p class="mb-0">${activity.message}</p>
            <small class="text-muted">${formatDate(activity.date)}</small>
          </div>
        </li>
      `).join('');
  activityEl.setAttribute('aria-busy', 'false');
    } else {
    activityEl.innerHTML = `
        <li class="text-center text-muted py-4">
      <i class="bi bi-clock-history fs-1 mb-3" aria-hidden="true"></i>
          <h6>No recent activity</h6>
          <p class="small">Start using your wardrobe to see activity here.</p>
        </li>
      `;
    activityEl.setAttribute('aria-busy', 'false');
    }
  } catch (error) {
    console.error('Dashboard: Error loading activity:', error);
    const activityEl = document.getElementById('recentActivity');
    if (activityEl) {
    activityEl.innerHTML = `
        <li class="text-center text-muted py-4">
      <i class="bi bi-exclamation-triangle fs-1 mb-3" aria-hidden="true"></i>
          <h6>Unable to load activity</h6>
          <p class="small">Error: ${error.message}</p>
        </li>
      `;
    activityEl.setAttribute('aria-busy', 'false');
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays === 0) {
    if (diffHours === 0) return 'Just now';
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}