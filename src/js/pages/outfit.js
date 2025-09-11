import { OutfitClient } from '../services/outfit-client.js';
import { ItemsClient } from '../services/items-client.js';

export async function render() {
    return `
    
    <div class="container py-4" id="outfitPage">
        <div id="alertContainer"></div>
        
        <!-- Page Header -->
        <header class="dashboard-header mb-4">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1>My Outfits</h1>
                    <p class="text-muted">Manage your outfit combinations</p>
                </div>
                <button class="btn btn-primary" id="createOutfitBtn" type="button" aria-label="Create outfit">
                    <i class="bi bi-plus me-2"></i>Create Outfit
                </button>
            </div>
        </header>
        <!-- Filters -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <label for="occasionFilter" class="form-label">Occasion</label>
                <select class="form-select" id="occasionFilter" aria-label="Filter by occasion">
                    <option value="">All Occasions</option>
                    <option value="casual">Casual</option>
                    <option value="work">Work</option>
                    <option value="formal">Formal</option>
                    <option value="sport">Sport</option>
                    <option value="party">Party</option>
                </select>
            </div>
            <div class="col-md-3">
                <label for="seasonFilter" class="form-label">Season</label>
                <select class="form-select" id="seasonFilter" aria-label="Filter by season">
                    <option value="">All Seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                </select>
            </div>
            <div class="col-md-3">
                <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" id="favoritesOnly">
                    <label class="form-check-label" for="favoritesOnly">Favorites Only</label>
                </div>
            </div>
            <div class="col-md-3">
                <label for="searchOutfits" class="visually-hidden">Search outfits</label>
                <input type="text" class="form-control" id="searchOutfits" placeholder="Search outfits..." aria-label="Search outfits">
            </div>
        </div>
        <div id="loadingSpinner" class="text-center py-5 visually-hidden">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading outfits...</span>
            </div>
        </div>

        <!-- Outfits Grid -->
        <div class="row g-4" id="outfitsContainer">
            <!-- Dynamic outfits will be inserted here -->
        </div>
    </div>

    <!-- Create Outfit Modal -->
    <div class="modal fade" id="createOutfitModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Create New Outfit</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createOutfitForm">
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label" for="outfitName">Outfit Name</label>
                                <input type="text" class="form-control" id="outfitName" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="outfitOccasion">Occasion</label>
                                <select class="form-select" id="outfitOccasion" required aria-label="Outfit occasion">
                                    <option value="">Select occasion</option>
                                    <option value="casual">Casual</option>
                                    <option value="work">Work</option>
                                    <option value="formal">Formal</option>
                                    <option value="sport">Sport</option>
                                    <option value="party">Party</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="outfitNotes">Notes (optional)</label>
                                <textarea class="form-control" id="outfitNotes" rows="2"></textarea>
                            </div>
                        </div>

                        <h6 class="mb-3">Select Items for Your Outfit</h6>
                        <div id="itemsSelection" class="items-selection-container">
                            <div class="text-center py-3">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Loading items...</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <h6>Selected Items (<span id="selectedCount">0</span>)</h6>
                            <div id="selectedItems" class="row g-2 selected-items-container">
                                <div class="col-12 text-muted text-center py-3">
                                    No items selected yet
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Cancel">Cancel</button>
                    <button type="button" class="btn btn-primary" id="saveOutfitBtn" aria-label="Create outfit">Create Outfit</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="outfitDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="outfitDetailsTitle">Outfit Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <strong>Occasion:</strong> <span id="outfitDetailsOccasion">-</span>
                        </div>
                        <div class="col-md-6">
                            <strong>Items:</strong> <span id="outfitDetailsItemCount">-</span>
                        </div>
                    </div>
                    <div id="outfitDetailsNotes" class="mb-3"></div>
                    
                    <h6>Items in this outfit:</h6>
                    <div class="row g-3" id="outfitDetailsItems">
                        <!-- Items will be populated here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
                    <button type="button" class="btn btn-success" id="wearFromDetailsBtn" aria-label="Wear this outfit">Wear This Outfit</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Edit Outfit Modal -->
    <div class="modal fade" id="editOutfitModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="editOutfitForm">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Outfit</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label" for="editOutfitName">Name</label>
                            <input id="editOutfitName" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="editOutfitOccasion">Occasion</label>
                            <select id="editOutfitOccasion" class="form-select" aria-label="Edit outfit occasion">
                                <option value="">Select occasion</option>
                                <option value="casual">Casual</option>
                                <option value="work">Work</option>
                                <option value="formal">Formal</option>
                                <option value="sport">Sport</option>
                                <option value="party">Party</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="editOutfitNotes">Notes</label>
                            <textarea id="editOutfitNotes" class="form-control" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-bs-dismiss="modal" type="button">Cancel</button>
                        <button class="btn btn-primary" type="submit">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- Outfit Details Modal -->
    </div>
    `;
}

export async function init() {
    /*console.log('Outfit page: Initializing...');*/
    const api = window.app.api;
    const outfitClient = new OutfitClient(api);
    const itemsClient = new ItemsClient(api);
    let outfits = [];
    let availableItems = [];
    let selectedItems = new Set();
    let currentEditingOutfit = null;
    if (window.app?.theme) {
        window.app.theme.applyThemeToAllElements(window.app.theme.getCurrentTheme());
    }
    setupEventListeners();

    await loadOutfits();
    async function loadOutfits(filters = {}) {
        try {
            /*console.log('Loading outfits with filters:', filters);*/
            showLoading(true);
            const response = await outfitClient.list(filters);
            /*console.log('Outfits response:', response);*/
            outfits = Array.isArray(response) ? response : (response?.outfits || []);
            renderOutfits(outfits);
        } catch (error) {
            console.error('Failed to load outfits:', error);
            showError('Failed to load outfits: ' + error.message);
            const container = document.getElementById('outfitsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="dashboard-card text-center py-5">
                            <i class="bi bi-exclamation-triangle text-danger"></i>
                            <h4 class="mt-3">Failed to load outfits</h4>
                            <p class="text-muted">Please try again later</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">
                                <i class="bi bi-arrow-clockwise me-2"></i>Reload
                            </button>
                        </div>
                    </div>
                `;
            }
        } finally {
            showLoading(false);
        }
    }

    async function loadAvailableItems() {
        try {
            const response = await itemsClient.list();
            availableItems = Array.isArray(response) ? response : (response?.items || response || []);
            renderAvailableItems();
        } catch (error) {
            console.error('Failed to load items:', error);
            showError('Failed to load wardrobe items');
        }
    }
    function renderOutfits(outfitList) {
        const container = document.getElementById('outfitsContainer');
        if (!container) return;

        if (!outfitList || outfitList.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="dashboard-card text-center py-5">
                        <i class="bi bi-layers text-muted"></i>
                        <h4 class="mt-3">No outfits yet</h4>
                        <p class="text-muted">Create your first outfit to get started</p>
                        <button class="btn btn-primary" id="createFirstOutfit">
                            <i class="bi bi-plus me-2"></i>Create Outfit
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('createFirstOutfit')?.addEventListener('click', async () => {
                await loadAvailableItems();
                const modal = new bootstrap.Modal(document.getElementById('createOutfitModal'));
                modal.show();
            });
            return;
        }

        container.innerHTML = outfitList.map(outfit => createOutfitCard(outfit)).join('');
    }

    function createOutfitCard(outfit) {
        const favoriteClass = outfit.isFavorite ? 'text-warning' : 'text-muted';
        const favoriteIcon = outfit.isFavorite ? 'bi-star-fill' : 'bi-star';
        const itemCount = outfit.items?.length || 0;
        const imageUrl = outfit.image || 'https://placehold.co/300x200/f9fafb/6366f1?text=Outfit';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="dashboard-card h-100" data-outfit-id="${outfit.id}">
                    <div class="position-relative">
                        <img src="${imageUrl}" class="card-img-top" alt="${outfit.name}">
                        <div class="position-absolute top-0 end-0 p-2">
                            <button type="button" class="btn btn-sm btn-light rounded-circle" data-action="favorite" title="Toggle favorite">
                                <i class="bi ${favoriteIcon} ${favoriteClass}"></i>
                            </button>
                        </div>
                    </div>
                    <div class="dashboard-card-body">
                        <h5 class="mb-2">${outfit.name}</h5>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted">${outfit.occasion || 'No occasion'}</small>
                            <small class="text-muted">${itemCount} items</small>
                        </div>
                        <div class="d-grid gap-2">
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-secondary btn-sm flex-fill" data-action="details">
                                    <i class="bi bi-eye me-1"></i>Details
                                </button>
                                <button type="button" class="btn btn-outline-primary btn-sm flex-fill" data-action="edit" title="Edit outfit" aria-label="Edit outfit">
                                    <i class="bi bi-pencil me-1"></i>Edit
                                </button>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-success btn-sm flex-fill" data-action="wear" title="Mark as worn" aria-label="Mark as worn">
                                    <i class="bi bi-check2-circle me-1"></i>Wear
                                </button>
                                <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" title="Delete outfit" aria-label="Delete outfit">
                                    <i class="bi bi-trash" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    async function showOutfitDetails(outfitId) {
        try {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
            const instance = bootstrap.Modal.getInstance(modal);
            if (instance) {
                instance.hide();
            }
            });

            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());

            const outfit = await outfitClient.getById(outfitId);
            
            document.getElementById('outfitDetailsTitle').textContent = outfit.name;
            document.getElementById('outfitDetailsOccasion').textContent = outfit.occasion || 'None';
            document.getElementById('outfitDetailsItemCount').textContent = `${outfit.items?.length || 0} items`;
            
            const notesContainer = document.getElementById('outfitDetailsNotes');
            if (outfit.notes) {
            notesContainer.innerHTML = `<p><strong>Notes:</strong> ${outfit.notes}</p>`;
            } else {
            notesContainer.innerHTML = '';
            }
            
            const itemsContainer = document.getElementById('outfitDetailsItems');
            if (outfit.items && outfit.items.length > 0) {
            itemsContainer.innerHTML = outfit.items.map(item => `
                <div class="col-md-4">
                <div class="card h-100">
                    <img src="${item.imageUrl || 'https://placehold.co/150x120/f9fafb/6366f1?text=Item'}" 
                        class="card-img-top" alt="${item.name}">
                    <div class="card-body p-2">
                    <h6 class="card-title">${item.name}</h6>
                    <p class="card-text">
                        <small class="text-muted">${item.category}</small><br>
                        ${item.color ? `<small class="text-muted">Color: ${item.color}</small>` : ''}
                    </p>
                    </div>
                </div>
                </div>
            `).join('');
            } else {
            itemsContainer.innerHTML = '<div class="col-12"><p class="text-muted">No items in this outfit</p></div>';
            }
            
            const wearBtn = document.getElementById('wearFromDetailsBtn');
            const newWearBtn = wearBtn.cloneNode(true);
            wearBtn.parentNode.replaceChild(newWearBtn, wearBtn);
            
            newWearBtn.addEventListener('click', async () => {
            try {
                await markAsWorn(outfitId);
                const modal = bootstrap.Modal.getInstance(document.getElementById('outfitDetailsModal'));
                if (modal) modal.hide();
            } catch (error) {
                console.error('Failed to mark as worn:', error);
                showError('Failed to mark outfit as worn');
            }
            });
            const modalElement = document.getElementById('outfitDetailsModal');
            const modal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
            });
            
            modalElement.addEventListener('hidden.bs.modal', function cleanupModalBackdrop() {
            const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
            remainingBackdrops.forEach(backdrop => backdrop.remove());
            modalElement.removeEventListener('hidden.bs.modal', cleanupModalBackdrop);
            });
            
            modal.show();
            
        } catch (error) {
            console.error('Failed to load outfit details:', error);
            showError('Failed to load outfit details');
        }
        }


        function renderAvailableItems() {
        const container = document.getElementById('itemsSelection');
        if (!container) return;

        if (availableItems.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox"></i>
                    <p class="mt-2">No items in your wardrobe yet</p>
                    <button class="btn btn-primary btn-sm" onclick="window.app.router.navigate('/wardrobe')">
                        Add Items
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row g-2">
                ${availableItems.map(item => `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card h-100 item-card ${selectedItems.has(item.id) ? 'border-primary selected' : ''}" 
                            data-item-id="${item.id}">
                            <img src="${item.imageUrl || 'https://placehold.co/150x150/f9fafb/6366f1?text=Item'}" 
                                class="card-img-top" alt="${item.name}">
                            <div class="card-body p-2">
                                <p class="card-text small mb-1">${item.name}</p>
                                <small class="text-muted">${item.category}</small>
                                ${selectedItems.has(item.id) ? '<i class="bi bi-check-circle-fill text-primary position-absolute top-0 end-0 m-1"></i>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        const existingCards = container.querySelectorAll('.item-card');
        existingCards.forEach(card => {
            const clone = card.cloneNode(true);
            card.parentNode.replaceChild(clone, card);
        });
        container.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const itemId = parseInt(card.dataset.itemId);
                /*console.log('Item clicked:', itemId);*/
                toggleItemSelection(itemId);
                
                return false;
            }, true);
        });
    }
        function setupEventListeners() {
            document.getElementById('createOutfitBtn')?.addEventListener('click', async (e) => {
                e.preventDefault();
                await loadAvailableItems();
                const modalElement = document.getElementById('createOutfitModal');
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: 'static',
                    keyboard: false,
                    focus: true
                });
                modal.show();
            });
    
            document.getElementById('occasionFilter')?.addEventListener('change', handleFilterChange);
            document.getElementById('seasonFilter')?.addEventListener('change', handleFilterChange);
            document.getElementById('favoritesOnly')?.addEventListener('change', handleFilterChange);
            document.getElementById('searchOutfits')?.addEventListener('input', debounce(handleFilterChange, 300));
            document.getElementById('saveOutfitBtn')?.addEventListener('click', handleOutfitSave);
            document.getElementById('editOutfitForm')?.addEventListener('submit', handleOutfitEdit);
            document.addEventListener('click', handleOutfitCardClick);
        }
    function toggleItemSelection(itemId) {
       /* console.log('Toggling selection for item:', itemId);*/

        if (selectedItems.has(itemId)) {
            selectedItems.delete(itemId);
            /*console.log('Removed item from selection');*/
        } else {
            selectedItems.add(itemId);
            /*console.log('Added item to selection');*/
        }
        
        updateSelectedItemsDisplay();
        renderAvailableItems();
    }
    
    function updateSelectedItemsDisplay() {
        const selectedContainer = document.getElementById('selectedItems');
        const countElement = document.getElementById('selectedCount');
        
        if (countElement) {
            countElement.textContent = selectedItems.size;
        }

        if (!selectedContainer) return;

        if (selectedItems.size === 0) {
            selectedContainer.innerHTML = `
                <div class="col-12 text-muted text-center py-3">
                    No items selected yet
                </div>
            `;
            return;
        }
        const selectedItemsData = Array.from(selectedItems).map(id => 
            availableItems.find(item => item.id === id)
        ).filter(Boolean);

        selectedContainer.innerHTML = selectedItemsData.map(item => `
            <div class="col-auto">
                <div class="d-flex align-items-center bg-primary text-white rounded px-2 py-1">
                    <small>${item.name}</small>
                    <button class="btn btn-sm p-0 ms-2 text-white remove-item-btn" 
                            data-remove-item="${item.id}" type="button">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
        `).join('');

        selectedContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const itemId = parseInt(btn.dataset.removeItem);
                toggleItemSelection(itemId);
                return false;
            }, true);
        });
    }

    async function handleOutfitSave() {
        if (selectedItems.size === 0) {
            showError('Please select at least one item for your outfit');
            return;
        }

        const outfitName = document.getElementById('outfitName').value;
        const outfitOccasion = document.getElementById('outfitOccasion').value;
        const outfitNotes = document.getElementById('outfitNotes').value;

        if (!outfitName.trim()) {
            showError('Please enter an outfit name');
            return;
        }

        const outfitData = {
            name: outfitName.trim(),
            occasion: outfitOccasion,
            notes: outfitNotes.trim(),
            itemIds: Array.from(selectedItems)
        };

        try {
            await outfitClient.create(outfitData);
            showSuccess('Outfit created successfully!');
            document.getElementById('createOutfitForm').reset();
            selectedItems.clear();
            updateSelectedItemsDisplay();
            bootstrap.Modal.getInstance(document.getElementById('createOutfitModal')).hide();
            
            await loadOutfits();
        } catch (error) {
            console.error('Failed to create outfit:', error);
            showError(error.message || 'Failed to create outfit');
        }
    }

    async function handleOutfitCardClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = e.target.closest('.dashboard-card[data-outfit-id]');
        if (!card) return;

        const outfitId = parseInt(card.dataset.outfitId);
        const action = e.target.closest('[data-action]')?.dataset.action;

        if (!action) return;

        try {
            switch (action) {
            case 'favorite':
                await toggleFavorite(outfitId, card);
                break;
            case 'wear':
                await markAsWorn(outfitId);
                break;
            case 'edit':
                await editOutfit(outfitId);
                break;
            case 'delete':
                await deleteOutfit(outfitId);
                break;
            case 'details':
                await showOutfitDetails(outfitId);
                break;
            }
        } catch (error) {
            console.error(`Failed to ${action} outfit:`, error);
            showError(`Failed to ${action} outfit`);
        }
        }

    async function toggleFavorite(outfitId, card) {
        try {
            const btn = card.querySelector('[data-action="favorite"] i');
            const isActive = btn.classList.contains('bi-star-fill');
            
            await outfitClient.toggleFavorite(outfitId, !isActive);
            
            btn.className = !isActive ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted';

            const outfit = outfits.find(o => o.id === outfitId);
            if (outfit) {
                outfit.isFavorite = !isActive;
            }
            
            showSuccess(`Outfit ${!isActive ? 'added to' : 'removed from'} favorites`);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            showError('Failed to update favorite status');
        }
    }

    async function markAsWorn(outfitId) {
        try {
            await outfitClient.markWorn(outfitId);
            showSuccess('Outfit marked as worn');
            await loadOutfits();
        } catch (error) {
            console.error('Failed to mark as worn:', error);
            showError('Failed to mark outfit as worn');
        }
    }

    async function editOutfit(outfitId) {
        try {
            const outfit = await outfitClient.getById(outfitId);
            currentEditingOutfit = outfit;
            
            document.getElementById('editOutfitName').value = outfit.name;
            document.getElementById('editOutfitOccasion').value = outfit.occasion || '';
            document.getElementById('editOutfitNotes').value = outfit.notes || '';
            
            const modal = new bootstrap.Modal(document.getElementById('editOutfitModal'));
            modal.show();
        } catch (error) {
            console.error('Failed to load outfit for editing:', error);
            showError('Failed to load outfit details');
        }
    }

    async function handleOutfitEdit(e) {
        e.preventDefault();
        
        if (!currentEditingOutfit) return;

        const updateData = {
            name: document.getElementById('editOutfitName').value,
            occasion: document.getElementById('editOutfitOccasion').value,
            notes: document.getElementById('editOutfitNotes').value
        };

        try {
            await outfitClient.update(currentEditingOutfit.id, updateData);
            showSuccess('Outfit updated successfully!');
            
            bootstrap.Modal.getInstance(document.getElementById('editOutfitModal')).hide();
            currentEditingOutfit = null;
            
            await loadOutfits();
        } catch (error) {
            console.error('Failed to update outfit:', error);
            showError('Failed to update outfit');
        }
    }

    async function deleteOutfit(outfitId) {
        if (!confirm('Are you sure you want to delete this outfit?')) return;

        try {
            await outfitClient.remove(outfitId);
            showSuccess('Outfit deleted successfully');
            await loadOutfits();
        } catch (error) {
            console.error('Failed to delete outfit:', error);
            showError('Failed to delete outfit');
        }
    }

    function handleFilterChange() {
        const checkbox = document.getElementById('favoritesOnly');
        const occasionFilter = document.getElementById('occasionFilter');
        const seasonFilter = document.getElementById('seasonFilter');
        const searchInput = document.getElementById('searchOutfits');
        
        // Debug logging
       /* console.log('Checkbox element:', checkbox);
        console.log('Checkbox checked state:', checkbox?.checked);*/
        
        const filters = {
            occasion: occasionFilter?.value || '',
            season: seasonFilter?.value || '',
            favorite: checkbox?.checked ?? false, 
            search: searchInput?.value || ''
        };

       /* console.log('Applying filters:', filters);*/
        loadOutfits(filters);
    }

    function showLoading(show) {
       /* console.log('showLoading called with:', show); */

        const spinner = document.getElementById('loadingSpinner');
        const container = document.getElementById('outfitsContainer');
        
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
            /* console.log('Spinner display set to:', spinner.style.display); */
        } else {
            console.warn('Spinner element not found');
        }
        
        if (container) {
            container.style.display = show ? 'none' : 'block';
            /* console.log('Container display set to:', container.style.display); */
        } else {
            console.warn('Container element not found');
        }
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
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
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

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /*console.log('Outfit page: Initialization complete');*/
}