import { AnalyticsClient } from '../services/analytics-service.js';


export async function render() {
    return `
    <div class="container py-4" id="analyticsPage">
        <div id="alertContainer"></div>
        
        <!-- Page Header -->
        <header class="dashboard-header mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1>Analytics</h1>
                    <p class="text-muted">Insights about your wardrobe usage</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary" id="refreshAnalytics">
                        <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                    </button>
                </div>
            </div>
        </header>
        <!-- Analytics Content -->
        <div id="analyticsContent">
            <!-- Basic Stats Cards -->
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="dashboard-card text-center">
                        <div class="dashboard-card-body">
                            <i class="bi bi-grid-3x3-gap text-primary fs-1 mb-3"></i>
                            <h3 id="totalItems" class="mb-1">-</h3>
                            <p class="text-muted mb-0">Total Items</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="dashboard-card text-center">
                        <div class="dashboard-card-body">
                            <i class="bi bi-layers text-success fs-1 mb-3"></i>
                            <h3 id="totalOutfits" class="mb-1">-</h3>
                            <p class="text-muted mb-0">Total Outfits</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="dashboard-card text-center">
                        <div class="dashboard-card-body">
                            <i class="bi bi-star-fill text-warning fs-1 mb-3"></i>
                            <h3 id="favoriteItems" class="mb-1">-</h3>
                            <p class="text-muted mb-0">Favorite Items</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="dashboard-card text-center">
                        <div class="dashboard-card-body">
                            <i class="bi bi-trophy text-primary fs-1 mb-3"></i>
                            <h3 id="sustainabilityScore" class="mb-1">-</h3>
                            <p class="text-muted mb-0">Sustainability Score</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Most Worn Items -->
            <div class="row g-4 mb-4">
                <div class="col-lg-6">
                    <div class="dashboard-card h-100">
                        <div class="dashboard-card-header">
                            <h5 class="mb-0">Most Worn Items</h5>
                        </div>
                        <div class="dashboard-card-body">
                            <div id="mostWornItems">
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6">
                    <div class="dashboard-card h-100">
                        <div class="dashboard-card-header">
                            <h5 class="mb-0">Category Breakdown</h5>
                        </div>
                        <div class="dashboard-card-body">
                            <div id="categoryStats">
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Color Analysis & Sustainability -->
            <div class="row g-4 mb-4">
                <div class="col-lg-6">
                    <div class="dashboard-card h-100">
                        <div class="dashboard-card-header">
                            <h5 class="mb-0">Color Analysis</h5>
                        </div>
                        <div class="dashboard-card-body">
                            <div id="colorAnalysis">
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6">
                    <div class="dashboard-card h-100">
                        <div class="dashboard-card-header">
                            <h5 class="mb-0">Sustainability Insights</h5>
                        </div>
                        <div class="dashboard-card-body">
                            <div id="sustainabilityInsights">
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rarely Used Items -->
            <div class="row g-4">
                <div class="col-12">
                    <div class="dashboard-card">
                        <div class="dashboard-card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Rarely Used Items</h5>
                                <span class="badge bg-warning" id="rarelyUsedCount">0</span>
                            </div>
                        </div>
                        <div class="dashboard-card-body">
                            <div id="rarelyUsedItems">
                                <div class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm" role="status"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function init() {
    console.log('Analytics page: Initializing...');
    
    const api = window.app.api;
    const analyticsClient = new AnalyticsClient(api);
    let analyticsData = null;
    if (window.app?.theme) {
        window.app.theme.applyThemeToAllElements(window.app.theme.getCurrentTheme());
    }
    setupEventListeners();
    await loadAnalytics();
    function setupEventListeners() {
        document.getElementById('refreshAnalytics')?.addEventListener('click', loadAnalytics);
    }
    async function loadAnalytics() {
        try {
            showLoading(true);
            const [basicStats, detailedAnalytics] = await Promise.all([
                analyticsClient.getBasicStats(),
                analyticsClient.getAnalytics()
            ]);
            analyticsData = {
                basicStats,
                ...detailedAnalytics
            };
            renderAnalytics(analyticsData); 
        } catch (error) {
            console.error('Failed to load analytics:', error);
            showError('Failed to load analytics data: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    function showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const content = document.getElementById('analyticsContent');
        
        console.log('showLoading called with:', show);
        console.log('Spinner element:', spinner);
        console.log('Content element:', content);
        
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
            console.log('Spinner display set to:', spinner.style.display);
        }
        if (content) {
            content.style.display = show ? 'none' : 'block';
            console.log('Content display set to:', content.style.display);
        }
    }

    function renderAnalytics(data) {
        console.log('Rendering analytics with data:', data);
        renderBasicStats(data.basicStats);
        renderMostWornItems(data.mostWornItems);
        renderCategoryStats(data.categoryStats);
        renderColorAnalysis(data.colorAnalysis);
        renderSustainabilityInsights(data.sustainabilityStats);
        renderRarelyUsedItems(data.rarelyUsedItems);
    }

    function renderBasicStats(stats) {
        if (!stats) return;

        document.getElementById('totalItems').textContent = stats.totalItems || 0;
        document.getElementById('totalOutfits').textContent = stats.totalOutfits || 0;
        document.getElementById('favoriteItems').textContent = stats.favoriteItems || 0;
        if (analyticsData?.sustainabilityStats?.sustainabilityScore) {
            document.getElementById('sustainabilityScore').textContent = 
                analyticsData.sustainabilityStats.sustainabilityScore + '%';
        }
    }
    function renderMostWornItems(items) {
        const container = document.getElementById('mostWornItems');
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox"></i>
                    <p class="mt-2">No worn items yet</p>
                </div>
            `;
            return;
        }

    container.innerHTML = items.slice(0, 5).map((item, index) => `
            <div class="d-flex align-items-center mb-3">
                <div class="position-relative me-3">
            <img src="${item.imageUrl || 'https://placehold.co/50x50/f9fafb/6366f1?text=Item'}" 
             class="rounded" width="50" height="50" style="object-fit: cover;" alt="${item.name || 'Item'} thumbnail">
                    <span class="position-absolute top-0 start-0 badge bg-primary rounded-pill">${index + 1}</span>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-medium">${item.name}</div>
                    <small class="text-muted">${item.category}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary">${item.wearCount}</div>
                    <small class="text-muted">wears</small>
                </div>
            </div>
        `).join('');
    }

    function renderCategoryStats(stats) {
        const container = document.getElementById('categoryStats');
        if (!container) return;

        if (!stats || stats.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox"></i>
                    <p class="mt-2">No category data</p>
                </div>
            `;
            return;
        }

        const maxCount = Math.max(...stats.map(s => s.count));

        container.innerHTML = stats.map(stat => {
            const percentage = (stat.count / maxCount) * 100;
            return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-medium text-capitalize">${stat.category}</span>
                        <span class="text-muted">${stat.count} items</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-primary" style="width: ${percentage}%"></div>
                    </div>
                    <small class="text-muted">${stat.totalWears} total wears, ${stat.avgWears} avg per item</small>
                </div>
            `;
        }).join('');
    }

    function renderColorAnalysis(analysis) {
        const container = document.getElementById('colorAnalysis');
        if (!container) return;

        if (!analysis || !analysis.mostWornColors || analysis.mostWornColors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-palette"></i>
                    <p class="mt-2">No color data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="mb-3">
                <small class="text-muted">You have ${analysis.totalUniqueColors} unique colors in your wardrobe</small>
            </div>
            ${analysis.mostWornColors.slice(0, 6).map(color => `
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                        <div class="color-swatch me-2" style="background-color: ${color.color}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border-color);"></div>
                        <span class="fw-medium text-capitalize">${color.color}</span>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${color.totalWears}</div>
                        <small class="text-muted">${color.itemCount} items</small>
                    </div>
                </div>
            `).join('')}
        `;
    }

    function renderSustainabilityInsights(stats) {
        const container = document.getElementById('sustainabilityInsights');
        if (!container) return;

        if (!stats) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-leaf"></i>
                    <p class="mt-2">No sustainability data</p>
                </div>
            `;
            return;
        }

        const scoreColor = stats.sustainabilityScore >= 80 ? 'success' : 
                          stats.sustainabilityScore >= 60 ? 'warning' : 'danger';

        container.innerHTML = `
            <div class="row g-3">
                <div class="col-6">
                    <div class="text-center">
                        <div class="h4 text-${scoreColor}">${stats.sustainabilityScore}%</div>
                        <small class="text-muted">Sustainability Score</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center">
                        <div class="h4 text-info">${stats.avgWearsPerItem}</div>
                        <small class="text-muted">Avg Wears/Item</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center">
                        <div class="h4 text-primary">${stats.totalCO2Footprint}kg</div>
                        <small class="text-muted">CO₂ Footprint</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center">
                        <div class="h4 text-secondary">${stats.co2PerWear}kg</div>
                        <small class="text-muted">CO₂/Wear</small>
                    </div>
                </div>
            </div>
            ${stats.recommendation ? `
                <div class="alert alert-info mt-3 mb-0">
                    <i class="bi bi-lightbulb me-2"></i>
                    ${stats.recommendation}
                </div>
            ` : ''}
        `;
    }

    function renderRarelyUsedItems(items) {
        const container = document.getElementById('rarelyUsedItems');
        const countBadge = document.getElementById('rarelyUsedCount');
        
        if (countBadge) {
            countBadge.textContent = items?.length || 0;
        }

        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-check-circle text-success fs-1"></i>
                    <h5 class="mt-3">Great job!</h5>
                    <p>All your items are being used regularly</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row g-3">
                ${items.slice(0, 12).map(item => `
                    <div class="col-md-4 col-lg-3">
                        <div class="card h-100">
                       <img src="${item.imageUrl || 'https://placehold.co/150x120/f9fafb/6366f1?text=Item'}" 
                           class="card-img-top" style="height: 120px; object-fit: cover;" alt="${item.name || 'Item'} image">
                            <div class="card-body p-2">
                                <h6 class="card-title">${item.name}</h6>
                                <p class="card-text">
                                    <small class="text-muted">${item.category}</small><br>
                                    <small class="text-danger">${item.wearCount} wears in ${item.monthsOld} months</small>
                                </p>
                                <div class="btn-group w-100" role="group">
                                    <button class="btn btn-outline-primary btn-sm" onclick="createOutfitWith('${item.id}')">
                                        Use
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm" onclick="donateItem('${item.id}')">
                                        Donate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${items.length > 12 ? `
                <div class="text-center mt-3">
                    <button class="btn btn-outline-primary" onclick="showAllRarelyUsed()">
                        Show All ${items.length} Items
                    </button>
                </div>
            ` : ''}
        `;
    }


    function showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const content = document.getElementById('analyticsContent');
        
        if (spinner) spinner.style.display = show ? 'block' : 'none';
        if (content) content.style.display = show ? 'none' : 'block';
    }

    function showSuccess(message) {
        showAlert(message, 'success');
    }

    function showError(message) {
        showAlert(message, 'danger');
    }

    function showAlert(message, type) {
        const container = document.getElementById('alertContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    window.createOutfitWith = function(itemId) {
        showSuccess('Redirecting to outfit creation...');
        setTimeout(() => {
            window.app.router.navigate('/outfit');
        }, 1000);
    };

    window.donateItem = function(itemId) {
        if (confirm('Are you sure you want to mark this item for donation?')) {
            showSuccess('Item marked for donation');
        }
    };

    window.showAllRarelyUsed = function() {
        renderRarelyUsedItems(analyticsData.rarelyUsedItems);
    };

    console.log('Analytics page: Initialization complete');
}