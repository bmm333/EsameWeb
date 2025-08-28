class AnalyticsManager {
  constructor() {
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3002' 
      : '';
    this.analyticsData = null;
    this.charts = {};
    this.init();
  }

  async init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    await this.loadAnalytics();
    this.bindEvents();
    this.renderCharts();
    this.renderStats();
  }

  async loadAnalytics() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        this.analyticsData = await response.json();
        console.log('Analytics data loaded:', this.analyticsData);
      } else {
        console.error('Failed to load analytics:', response.status);
        this.showError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Analytics load error:', error);
      this.showError('Unable to connect to analytics service');
    }
  }

  renderStats() {
    if (!this.analyticsData) return;

    const stats = this.analyticsData.summary || {};
    
    // Update stat cards
    this.updateStatCard('totalWears', stats.totalWears || 0);
    this.updateStatCard('mostWornItem', stats.mostWornItem?.name || 'N/A');
    this.updateStatCard('favoriteCategory', stats.favoriteCategory || 'N/A');
    this.updateStatCard('avgWearsPerWeek', stats.avgWearsPerWeek || 0);
    this.updateStatCard('wardrobeUtilization', `${stats.wardrobeUtilization || 0}%`);
    this.updateStatCard('outfitVariety', stats.outfitVariety || 0);
  }

  updateStatCard(statId, value) {
    const element = document.getElementById(statId);
    if (element) {
      element.textContent = value;
    }
  }

  renderCharts() {
    if (!this.analyticsData) return;

    this.renderWearsChart();
    this.renderCategoryChart();
    this.renderTrendChart();
    this.renderHeatmap();
  }

  renderWearsChart() {
    const ctx = document.getElementById('wearsChart');
    if (!ctx || !this.analyticsData.wearsByItem) return;

    const data = this.analyticsData.wearsByItem.slice(0, 10); // Top 10 items
    
    if (this.charts.wears) {
      this.charts.wears.destroy();
    }

    this.charts.wears = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          label: 'Times Worn',
          data: data.map(item => item.wearCount),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Most Worn Items'
          }
        }
      }
    });
  }

  renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx || !this.analyticsData.wearsByCategory) return;

    const data = this.analyticsData.wearsByCategory;
    
    if (this.charts.category) {
      this.charts.category.destroy();
    }

    this.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(cat => cat.category),
        datasets: [{
          data: data.map(cat => cat.wearCount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Wears by Category'
          }
        }
      }
    });
  }

  renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx || !this.analyticsData.wearsTrend) return;

    const data = this.analyticsData.wearsTrend;
    
    if (this.charts.trend) {
      this.charts.trend.destroy();
    }

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(point => point.date),
        datasets: [{
          label: 'Items Worn',
          data: data.map(point => point.count),
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Wear Trend (Last 30 Days)'
          }
        }
      }
    });
  }

  renderHeatmap() {
    const container = document.getElementById('wearHeatmap');
    if (!container || !this.analyticsData.wearHeatmap) return;

    const heatmapData = this.analyticsData.wearHeatmap;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let heatmapHTML = `
      <div class="heatmap-grid">
        <div class="heatmap-days">
          ${days.map(day => `<div class="heatmap-day-label">${day}</div>`).join('')}
        </div>
        <div class="heatmap-cells">
    `;

    heatmapData.forEach(week => {
      week.forEach(day => {
        const intensity = Math.min(day.count / 3, 1); // Max intensity at 3+ wears
        heatmapHTML += `
          <div class="heatmap-cell" 
               style="opacity: ${intensity}"
               data-date="${day.date}"
               data-count="${day.count}"
               title="${day.date}: ${day.count} items worn">
          </div>
        `;
      });
    });

    heatmapHTML += '</div></div>';
    container.innerHTML = heatmapHTML;
  }

  renderInsights() {
    const container = document.getElementById('insightsContainer');
    if (!container || !this.analyticsData.insights) return;

    const insights = this.analyticsData.insights;
    
    container.innerHTML = insights.map(insight => `
      <div class="insight-card alert alert-${insight.type || 'info'}">
        <div class="d-flex align-items-center">
          <i class="bi ${this.getInsightIcon(insight.type)} me-2"></i>
          <div>
            <strong>${insight.title}</strong>
            <p class="mb-0">${insight.message}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  getInsightIcon(type) {
    const icons = {
      'info': 'bi-info-circle',
      'warning': 'bi-exclamation-triangle',
      'success': 'bi-check-circle',
      'tip': 'bi-lightbulb'
    };
    return icons[type] || 'bi-info-circle';
  }

  renderTopItems() {
    const container = document.getElementById('topItemsList');
    if (!container || !this.analyticsData.topItems) return;

    container.innerHTML = this.analyticsData.topItems.map(item => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="${item.imageUrl || 'https://placehold.co/40x40'}" 
               alt="${item.name}" class="rounded me-3" width="40" height="40">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">${item.category}</small>
          </div>
        </div>
        <span class="badge bg-primary">${item.wearCount} wears</span>
      </div>
    `).join('');
  }

  renderUnderutilized() {
    const container = document.getElementById('underutilizedList');
    if (!container || !this.analyticsData.underutilized) return;

    container.innerHTML = this.analyticsData.underutilized.map(item => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <img src="${item.imageUrl || 'https://placehold.co/40x40'}" 
               alt="${item.name}" class="rounded me-3" width="40" height="40">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">Last worn: ${item.lastWorn ? new Date(item.lastWorn).toLocaleDateString() : 'Never'}</small>
          </div>
        </div>
        <span class="badge bg-warning">${item.daysSinceWorn} days</span>
      </div>
    `).join('');
  }

  bindEvents() {
    // Time period selector
    const periodSelect = document.getElementById('analyticsPeriod');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.loadAnalytics(e.target.value);
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportAnalytics');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshAnalytics');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadAnalytics());
    }
  }

  async exportData() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/analytics/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wardrobe-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess('Analytics exported successfully!');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showError('Failed to export analytics');
    }
  }

  showError(message) {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsManager = new AnalyticsManager();
});