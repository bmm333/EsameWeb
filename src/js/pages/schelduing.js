class SchedulingManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3001' 
      : '';
    this.init();
  }

  async init() {
    await this.loadSchedules();
    this.bindEvents();
  }

  async loadSchedules() {
    const token = window.authManager?.token;
    const response = await fetch(`${this.API_BASE}/schedule`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    if (response.ok) {
      const schedules = await response.json();
      this.renderSchedules(schedules);
    }
  }//still need to add methods
}