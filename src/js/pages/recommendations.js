export async function render() {
    return `
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Style Recommendations</h2>
            <button id="generateBtn" class="btn btn-primary">
                <i class="bi bi-magic me-1"></i>Generate New
            </button>
        </div>
        
        <div id="recAlert"></div>

        <!-- Filters -->
        <div class="row mb-4">
            <div class="col-md-3">
                <label class="form-label">Occasion</label>
                <select id="occasionFilter" class="form-select">
                    <option value="">Any occasion</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="sporty">Sporty</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Weather</label>
                <select id="weatherFilter" class="form-select">
                    <option value="">Any weather</option>
                    <option value="hot">Hot</option>
                    <option value="cool">Cool</option>
                    <option value="rainy">Rainy</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Show</label>
                <select id="limitFilter" class="form-select">
                    <option value="6">6 recommendations</option>
                    <option value="9">9 recommendations</option>
                    <option value="12">12 recommendations</option>
                </select>
            </div>
            <div class="col-md-3 d-flex align-items-end">
                <button id="refreshBtn" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div id="loadingState" class="text-center py-5 d-none">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">Generating personalized recommendations...</p>
        </div>

        <!-- Recommendations Grid -->
        <div class="row g-4" id="recContainer"></div>

        <!-- Empty State -->
        <div id="emptyState" class="text-center py-5 d-none">
            <i class="bi bi-lightbulb fs-1 text-muted mb-3"></i>
            <h5 class="text-muted">No recommendations yet</h5>
            <p class="text-muted">Add some items to your wardrobe and generate your first recommendations!</p>
            <button class="btn btn-primary" onclick="window.app.router.navigate('/wardrobe')">
                <i class="bi bi-plus me-1"></i>Add Items
            </button>
        </div>
    </div>

    <!-- Recommendation Detail Modal -->
    <div class="modal fade" id="recommendationModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="recModalTitle">Outfit Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="recModalBody">
                    <!-- Dynamic content -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" id="wearOutfitBtn">
                        <i class="bi bi-check-circle me-1"></i>Wear This Outfit
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function init() {
    const { api } = window.app;
    let recommendations = [];
    let selectedRecommendation = null;
    let isGenerating = false;
    let isProcessing = false;

    const { RecommendationClient } = await import('../services/recommendation-client.js');
    const recClient = new RecommendationClient(api);

    document.getElementById('generateBtn')?.addEventListener('click', debounce(generateRecommendations, 1000));
    document.getElementById('refreshBtn')?.addEventListener('click', debounce(loadRecommendations, 500));
    document.getElementById('occasionFilter')?.addEventListener('change', debounce(loadRecommendations, 300));
    document.getElementById('weatherFilter')?.addEventListener('change', debounce(loadRecommendations, 300));
    document.getElementById('limitFilter')?.addEventListener('change', debounce(loadRecommendations, 300));
    document.getElementById('wearOutfitBtn')?.addEventListener('click', markAsWornFromModal);

    await loadRecommendations();

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const recContainer = document.getElementById('recContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (show) {
            loadingState?.classList.remove('d-none');
            recContainer?.classList.add('d-none');
            emptyState?.classList.add('d-none');
        } else {
            loadingState?.classList.add('d-none');
        }
    }

    function showEmptyState() {
        const loadingState = document.getElementById('loadingState');
        const recContainer = document.getElementById('recContainer');
        const emptyState = document.getElementById('emptyState');
        
        loadingState?.classList.add('d-none');
        recContainer?.classList.add('d-none');
        emptyState?.classList.remove('d-none');
    }

    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('recAlert');
        if (!alertContainer) return;
        
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.innerHTML = alertHtml;
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    function recommendationToCard(rec) {
        const itemImages = rec.items
            ?.filter(item => item.imageUrl)
            .slice(0, 3)
            .map(item => `<img src="${item.imageUrl}" class="outfit-item-img" alt="${item.name} item image">`)
            .join('') || '';

        const itemNames = rec.items?.map(item => item.name).join(', ') || 'No items';
        
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 recommendation-card">
                    <div class="card-body">
                        <div class="outfit-images mb-3">
                            ${itemImages || '<div class="no-image-placeholder">No images</div>'}
                        </div>
                        <h6 class="card-title">${rec.title}</h6>
                        <p class="card-text text-muted small">${itemNames}</p>
                        <p class="card-text"><small class="text-muted">${rec.reason || ''}</small></p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="btn-group w-100" role="group">
                            <button type="button" class="btn btn-outline-primary btn-sm view-recommendation" data-rec-id="${rec.id}">
                                <i class="bi bi-eye"></i> View
                            </button>
                            <button type="button" class="btn btn-success btn-sm wear-recommendation" data-rec-id="${rec.id}">
                                <i class="bi bi-check"></i> Wear
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm reject-recommendation" data-rec-id="${rec.id}">
                                <i class="bi bi-x"></i> Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function showRecommendationDetail(rec) {
        selectedRecommendation = rec;
        
        const modal = document.getElementById('recommendationModal');
        const modalTitle = document.getElementById('recModalTitle');
        const modalBody = document.getElementById('recModalBody');
        
        modalTitle.textContent = rec.title;
        
        const itemsHtml = rec.items?.map(item => `
            <div class="col-md-4 mb-3">
                <div class="card">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" class="card-img-top" alt="${item.name} item image">` : ''}
                    <div class="card-body p-2">
                        <h6 class="card-title">${item.name}</h6>
                        <p class="card-text small">${item.category} • ${item.color}</p>
                    </div>
                </div>
            </div>
        `).join('') || '<p>No items found</p>';
        
        modalBody.innerHTML = `
            <div class="mb-3">
                <h6>Items in this outfit:</h6>
                <div class="row">${itemsHtml}</div>
            </div>
            <div class="mb-3">
                <h6>Recommendation reason:</h6>
                <p>${rec.reason || 'No reason provided'}</p>
            </div>
        `;
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    async function generateRecommendations() {
        if (isGenerating || isProcessing) {
            /*console.log('Already generating recommendations, ignoring request');*/
            return;
        }

        isGenerating = true;
        isProcessing = true;
        
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn?.innerHTML;
        
        try {
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
            }
            
            showLoading(true);
            
            const preferences = {
                occasion: document.getElementById('occasionFilter')?.value || '',
                weather: document.getElementById('weatherFilter')?.value || '',
                limit: parseInt(document.getElementById('limitFilter')?.value) || 6
            };

       /*     console.log('Calling generateRecommendations API with:', preferences);*/
            const newRecs = await recClient.generateRecommendations(preferences);
          /*  console.log('API returned:', newRecs.length, 'recommendations');*/
            
            if (newRecs.length === 0) {
                showEmptyState();
                showAlert('No recommendations could be generated. Try adding more items to your wardrobe!', 'warning');
            } else {
                recommendations = deduplicateRecommendations(newRecs);
                renderRecommendations(recommendations);
                showAlert(`Generated ${recommendations.length} new recommendations!`, 'success');
            }
        } catch (error) {
            console.error('Generate recommendations error:', error);
            showAlert('Failed to generate recommendations. Please try again.', 'danger');
        } finally {
            isGenerating = false;
            isProcessing = false;
            showLoading(false);
            
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = originalText || '<i class="bi bi-magic me-1"></i>Generate New';
            }
        }
    }

    async function loadRecommendations() {
        if (isProcessing) {
           /* console.log('Already processing, ignoring load request');*/
            return;
        }

        isProcessing = true;
        
        try {
            showLoading(true);
            const filters = {
                occasion: document.getElementById('occasionFilter')?.value || '',
                weather: document.getElementById('weatherFilter')?.value || '',
                limit: parseInt(document.getElementById('limitFilter')?.value) || 6
            };

          /*  console.log('Loading recommendations with filters:', filters);*/
            const recs = await recClient.getRecommendations(filters);
          /*  console.log('Loaded recommendations:', recs.length);*/

            const activeRecs = recs.filter(rec => !rec.rejectedAt && !rec.wasWorn);
          /*  console.log('Active recommendations after filtering:', activeRecs.length);*/

            recommendations = deduplicateRecommendations(activeRecs);

            if (recommendations.length === 0) {
                showEmptyState();
            } else {
                renderRecommendations(recommendations);
            }
        } catch (error) {
            console.error('Load recommendations error:', error);
            showAlert('Failed to load recommendations', 'danger');
            showEmptyState();
        } finally {
            isProcessing = false;
            showLoading(false);
        }
    }

    function deduplicateRecommendations(recs) {
        const seen = new Set();
        const unique = [];
        
        for (const rec of recs) {
            const itemIds = rec.items?.map(item => item.id).sort().join('-') || '';
            const key = `${itemIds}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(rec);
            } else {
                /*console.log(`Filtering out duplicate recommendation: ${rec.title} (ID: ${rec.id})`);*/
            }
        }

        /*console.log(`Deduplication: ${recs.length} -> ${unique.length} unique recommendations`);*/
        return unique;
    }

    function renderRecommendations(list) {
        const container = document.getElementById('recContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        emptyState?.classList.add('d-none');
        container.classList.remove('d-none');

        if (list.length === 0) {
            showEmptyState();
            return;
        }

        /*console.log('Rendering recommendations:', list.length);*/
        container.innerHTML = list.map(recommendationToCard).join('');
        setupEventListeners(container);
    }

    function setupEventListeners(container) {
        const existingHandler = container._clickHandler;
        if (existingHandler) {
            container.removeEventListener('click', existingHandler);
        }
        
        const clickHandler = handleContainerClick;
        container._clickHandler = clickHandler;
        container.addEventListener('click', clickHandler);
    }

    function handleContainerClick(e) {
        if (isProcessing) return;

        const target = e.target.closest('button[data-rec-id]');
        if (!target) return;

        const recId = parseInt(target.dataset.recId);
        if (isNaN(recId)) return;

        e.preventDefault();
        e.stopPropagation();

        if (target.classList.contains('view-recommendation')) {
            const rec = recommendations.find(r => r.id === recId);
            if (rec) showRecommendationDetail(rec);
        } else if (target.classList.contains('wear-recommendation')) {
            markAsWornFromCard(recId);
        } else if (target.classList.contains('reject-recommendation')) {
            rejectRecommendation(recId);
        }
    }

    async function rejectRecommendation(recId) {
        if (isProcessing) return;
        isProcessing = true;
        
        try {
            const reason = prompt('Why don\'t you like this recommendation? (Optional)');
            if (reason === null) {
                isProcessing = false;
                return;
            }

            /*console.log('Rejecting recommendation:', recId);*/
            await recClient.rejectRecommendation(recId, reason || 'No reason provided');
            
            recommendations = recommendations.filter(r => r.id !== recId);
            renderRecommendations(recommendations);
            showAlert('Recommendation rejected. This helps us improve future suggestions!', 'info');
        } catch (error) {
            console.error('Reject recommendation error:', error);
            showAlert('Failed to reject recommendation', 'danger');
        } finally {
            isProcessing = false;
        }
    }

    async function markAsWornFromCard(recId) {
        if (isProcessing) return;
        isProcessing = true;
        
        try {
            /*console.log('Marking as worn:', recId);*/
            await recClient.markAsWorn(recId);
            
            recommendations = recommendations.filter(r => r.id !== recId);
            renderRecommendations(recommendations);
            showAlert('Outfit marked as worn! Enjoy your style!', 'success');
        } catch (error) {
            console.error('Mark as worn error:', error);
            showAlert('Failed to mark outfit as worn', 'danger');
        } finally {
            isProcessing = false;
        }
    }

    async function markAsWornFromModal() {
        if (isProcessing) return;
        isProcessing = true;
        
        try {
            const id = selectedRecommendation?.id;
            if (!id) {
                isProcessing = false;
                return;
            }

            /*console.log('Marking as worn from modal:', id);*/
            await recClient.markAsWorn(id);
            
            recommendations = recommendations.filter(r => r.id !== id);
            renderRecommendations(recommendations);
            
            bootstrap.Modal.getInstance(document.getElementById('recommendationModal'))?.hide();
            showAlert('Outfit marked as worn! Enjoy your style!', 'success');
        } catch (error) {
            console.error('Mark as worn error:', error);
            showAlert('Failed to mark outfit as worn', 'danger');
        } finally {
            isProcessing = false;
        }
    }
}