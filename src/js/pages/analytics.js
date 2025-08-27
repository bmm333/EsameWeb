class AnalyticsManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3001' 
      : '';
    this.init();
  }

  async init() {
    await this.loadAnalytics();
    this.renderCharts();
  }

  async loadAnalytics() {
    const token = window.authManager?.token;
    const response = await fetch(`${this.API_BASE}/analytics`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    if (response.ok) {
      this.analyticsData = await response.json();
    }
  }
}