import { API_BASE } from '../utils.js'; 

class OutfitManager {
    constructor() {
        this.API_BASE = API_BASE;
        this.outfits = [];
        this.init();
    }

    async init() {
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
        this.loadOutfits();
        this.bindEvents();
    }

    // Fetch saved outfits from backend
    async loadOutfits() {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/outfit`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) throw new Error('Failed to load outfits');

            this.outfits = await response.json();
            this.renderOutfits();
        } catch (error) {
            console.error('Error loading outfits:', error);
            this.showError('Failed to load outfits. Please try again.');
        } finally {
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }

    // Render outfits in the UI
    renderOutfits() {
        const container = document.getElementById('outfitsContainer');
        if (!container) return;

        if (this.outfits.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No outfits found. Create your first one!</p>';
            return;
        }

        container.innerHTML = this.outfits.map(outfit => `
            <div class="col-md-6 col-lg-4">
                <div class="outfit-card">
                    <div class="outfit-card-header">
                        <h3 class="outfit-title">${outfit.name}</h3>
                        <div class="outfit-actions">
                            <button class="action-btn favorite-btn" title="Favorite" onclick="outfitManager.toggleFavorite(${outfit.id})">
                                <i class="bi bi-star${outfit.isFavorite ? '-fill' : ''}"></i>
                            </button>
                            <button class="action-btn more-btn" title="More Options">
                                <i class="bi bi-three-dots"></i>
                            </button>
                        </div>
                    </div>
                    <div class="outfit-items">
                        ${outfit.items?.map(item => `
                            <div class="outfit-item available">
                                <img src="${item.imageUrl || 'https://placehold.co/300x300/f9fafb/6366f1?text=Item'}" alt="${item.name}">
                                <div class="outfit-item-status">
                                    <i class="bi bi-check-circle-fill"></i>
                                </div>
                            </div>
                        `).join('') || '<p>No items</p>'}
                    </div>
                    <div class="outfit-card-footer">
                        <div class="outfit-meta">
                            <span class="outfit-occasion">${outfit.occasion || 'Casual'}</span>
                        </div>
                        <button class="app-btn app-btn-primary app-btn-sm" onclick="outfitManager.wearOutfit(${outfit.id})">
                            <i class="bi bi-check2"></i> Wear Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Handle creating a new outfit
    async createOutfit(outfitData) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/outfit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(outfitData)
            });

            if (!response.ok) throw new Error('Failed to create outfit');

            const newOutfit = await response.json();
            this.outfits.push(newOutfit);
            this.renderOutfits();
            this.showSuccess('Outfit created successfully!');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createOutfitModal'));
            modal.hide();
        } catch (error) {
            console.error('Error creating outfit:', error);
            this.showError('Failed to create outfit. Please try again.');
        }
    }

    // Placeholder for wearing an outfit (call backend endpoint if available)
    async wearOutfit(outfitId) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/outfit/${outfitId}/wear`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (response.ok) {
                this.showSuccess('Outfit marked as worn!');
                this.loadOutfits();  // Refresh
            } else {
                throw new Error('Failed to mark outfit as worn');
            }
        } catch (error) {
            console.error('Error wearing outfit:', error);
            this.showError('Failed to mark outfit as worn');
        }
    }

    // Placeholder for toggling favorite (implement backend call if needed)
    toggleFavorite(outfitId) {
        const outfit = this.outfits.find(o => o.id === outfitId);
        if (outfit) {
            outfit.isFavorite = !outfit.isFavorite;
            this.renderOutfits();
            // TODO: Call backend to update favorite status
        }
    }

    // Bind events for the create outfit form
    bindEvents() {
        const saveBtn = document.getElementById('saveOutfitBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = document.getElementById('outfitName').value;
                const occasion = document.getElementById('outfitOccasion').value;
                // Add more fields as needed (e.g., items)
                if (name && occasion) {
                    this.createOutfit({ name, occasion, items: [] });  // Simplify: empty items for now
                } else {
                    this.showError('Please fill in all required fields.');
                }
            });
        }
    }

    // Utility methods for notifications (reuse from dashboard.js if available)
    showSuccess(message) {
        // Implement toast or alert
        alert(message);  // Simple for now
    }
    showError(message) {
        alert(`Error: ${message}`);
    }
}

// Initialize on page load
const outfitManager = new OutfitManager();
window.outfitManager = outfitManager;  // Make it global for onclick handlers