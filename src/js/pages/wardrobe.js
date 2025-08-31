class WardrobeManager {
    constructor() {
        this.selectedImageFile = null;
        this.selectedRfidTag = null;
        this.items = [];
        this.filteredItems = [];
        this.currentFilter = '';
        this.currentCategory = '';
        this._rfidLoadingPromise = null;
        this.API_BASE = `http://${window.location.hostname}:3001`;
        this.init();
    }

    async init() {
        if (!window.authManager?.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        this.bindImageInputs();
        this.bindSaveItem();
        this.bindFilterEvents();
        this.bindViewToggle();
        this.bindItemActions();
        this.bindRfidSectionInAddModal();

        await this.loadItems();
        await this.checkDeviceStatus();
    }

    bindImageInputs() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('itemImageInput');
        const preview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImageBtn');

        uploadArea?.addEventListener('click', () => fileInput?.click());

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this.selectedImageFile = file;

            const reader = new FileReader();
            reader.onload = (ev) => {
                preview.innerHTML = '';
                preview.style.backgroundImage = `url(${ev.target.result})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
                removeBtn.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        });

        removeBtn?.addEventListener('click', () => {
            this.selectedImageFile = null;
            if (fileInput) fileInput.value = '';
            preview.style.backgroundImage = '';
            preview.innerHTML = `
        <i class="bi bi-camera-fill upload-icon"></i>
        <span class="upload-text">Click to add photo</span>
      `;
            removeBtn.classList.add('d-none');
        });
    }

    async uploadImageFile() {
        if (!this.selectedImageFile) return null;

        const token = window.authManager?.token;
        const formData = new FormData();
        formData.append('image', this.selectedImageFile);

        const response = await fetch(`${this.API_BASE}/item/upload-image`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Upload failed: ${response.status} ${error}`);
        }

        const result = await response.json();
        return result.url || result.location || result.path || result.imageUrl || result;
    }

    // -----------------------------
    // Save and update items
    // -----------------------------
    bindSaveItem() {
        const saveBtn = document.getElementById('saveItemBtn');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            saveBtn.disabled = true;
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';

            try {
                let imageUrl = null;
                if (this.selectedImageFile) {
                    imageUrl = await this.uploadImageFile();
                }

                const form = document.getElementById('addItemForm');
                const itemData = {
                    name: document.getElementById('itemName').value.trim(),
                    category: document.getElementById('itemCategory').value,
                    notes: document.getElementById('itemNotes').value.trim(),
                    imageUrl: imageUrl,
                    // Use data added by RFID scan
                    rfidTag: form?.dataset?.rfidTag || null
                };

                if (!itemData.name || !itemData.category) {
                    throw new Error('Name and category are required');
                }

                const token = window.authManager?.token;
                const response = await fetch(`${this.API_BASE}/item`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(itemData)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Save failed: ${response.status} ${error}`);
                }

                // Saved
                const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
                modal?.hide();
                await this.loadItems();
                this.resetItemForm();
            } catch (error) {
                console.error('Save error:', error);
                this.showError('Failed to save item: ' + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        });
    }

    async updateItemFromForm(itemId) {
        try {
            let imageUrl = null;
            if (this.selectedImageFile) {
                imageUrl = await this.uploadImageFile();
            }

            const updateData = {
                name: document.getElementById('itemName').value.trim(),
                category: document.getElementById('itemCategory').value,
                notes: document.getElementById('itemNotes').value.trim()
            };
            if (imageUrl) updateData.imageUrl = imageUrl;

            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/item/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) throw new Error('Update failed');

            await this.loadItems();
            this.showSuccess('Item updated successfully!');

            const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
            modal?.hide();
            this.resetItemForm();
        } catch (error) {
            console.error('Update item error:', error);
            this.showError('Failed to update item');
        }
    }

    resetItemForm() {
        document.getElementById('addItemForm')?.reset();
        this.selectedImageFile = null;
        this.selectedRfidTag = null;

        const preview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImageBtn');

        if (preview) {
            preview.style.backgroundImage = '';
            preview.innerHTML = `
        <i class="bi bi-camera-fill upload-icon"></i>
        <span class="upload-text">Click to add photo</span>
      `;
        }
        removeBtn?.classList.add('d-none');

        const form = document.getElementById('addItemForm');
        if (form?.dataset) delete form.dataset.rfidTag;

        const rfidStatus = document.getElementById('rfidStatus');
        if (rfidStatus) {
            rfidStatus.innerHTML = `
        <span class="text-muted">No RFID tag associated</span>
        <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
          <i class="bi bi-broadcast"></i> Scan Tag
        </button>
      `;
            document.getElementById('scanRfidBtn')?.addEventListener('click', () => this.handleRfidScanForAdd());
        }
    }

    bindRfidSectionInAddModal() {
        const addItemModal = document.getElementById('addItemModal');
        if (!addItemModal) return;

        const modalBody = addItemModal.querySelector('.modal-body');
        if (!modalBody) return;

        if (!modalBody.querySelector('#scanRfidBtn')) {
            const rfidSection = `
        <div class="mb-3">
          <label class="form-label">RFID Tag Association</label>
          <div class="d-grid">
            <button type="button" class="btn btn-outline-primary" id="scanRfidBtn">
              <i class="bi bi-broadcast me-2"></i>Scan RFID Tag
            </button>
          </div>
          <div class="form-text">Optional: Associate an RFID tag with this item for automatic tracking</div>
        </div>
      `;
            const notesField = modalBody.querySelector('#itemNotes')?.closest('.mb-3');
            if (notesField) {
                notesField.insertAdjacentHTML('beforebegin', rfidSection);
            } else {
                modalBody.insertAdjacentHTML('beforeend', rfidSection);
            }
        }

        document.getElementById('scanRfidBtn')?.addEventListener('click', () => this.handleRfidScanForAdd());
    }

    async ensureRfidModuleLoaded() {
        if (window.rfidSetup) return;

        if (this._rfidLoadingPromise) {
            await this._rfidLoadingPromise;
            return;
        }

        this._rfidLoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/src/js/pages/rfid.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load RFID module'));
            document.body.appendChild(script);
        });

        await this._rfidLoadingPromise;
    }

    async handleRfidScanForAdd() {
        const itemName = document.getElementById('itemName')?.value?.trim();
        if (!itemName) {
            this.showError('Please enter item name first');
            return;
        }

        try {
            await this.ensureRfidModuleLoaded();

            const tempItemId = `temp_${Date.now()}`;
            await window.rfidSetup.openScanModalAndAssociate(tempItemId, () => {
                const form = document.getElementById('addItemForm');
                const scanBtn = document.getElementById('scanRfidBtn');
                // Tag ID is already stored inside rfids modal handler; we only update UI
                if (scanBtn) {
                    scanBtn.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>RFID Tag Associated';
                    scanBtn.disabled = true;
                }

            });
        } catch (error) {
            this.showError('RFID scan failed: ' + (error.message || error));
        }
    }

    async handleItemRfidScan(card) {
        const itemId = card?.dataset?.itemId;
        if (!itemId) return;

        try {
            await this.ensureRfidModuleLoaded();

            await window.rfidSetup?.openScanModalAndAssociate(itemId, () => {
                const btn = card.querySelector('.rfid-btn');
                if (btn) {
                    btn.classList.add('text-success');
                    const icon = btn.querySelector('i');
                    if (icon) icon.className = 'bi bi-check-circle-fill';
                }
                this.loadItems();
            });
        } catch (error) {
            console.error('RFID scan error:', error);
            this.showError('RFID scan failed');
        }
    }

    async checkDeviceStatus() {
        try {
            const status = await window.rfidSetup?.getDeviceStatus();
            if (!status?.devices || status.devices.length === 0) {
                this.showDeviceSetupPrompt();
            }
        } catch (error) {
            console.warn('Could not check device status:', error);
        }
    }

    showDeviceSetupPrompt() {
        const container = document.querySelector('.container');
        const header = container?.querySelector('.page-header');
        if (!header) return;

        const promptHtml = `
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        <strong>RFID Device Not Found</strong>
        <p class="mb-2">Set up your Smart Wardrobe Pi to automatically track your items.</p>
        <a href="device-setup.html" class="btn btn-sm btn-primary">Setup Device</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
        header.insertAdjacentHTML('afterend', promptHtml);
    }

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/item/${itemId}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) throw new Error('Delete failed');

            this.items = this.items.filter(item => item.id !== itemId);
            this.applyFilters();
            this.showSuccess('Item deleted successfully!');
        } catch (error) {
            console.error('Delete item error:', error);
            this.showError('Failed to delete item');
        }
    }

    async updateItemLocation(itemId, location) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/item/${itemId}/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ location })
            });

            if (!response.ok) throw new Error('Location update failed');

            const item = this.items.find(i => String(i.id) === String(itemId));
            if (item) item.location = location;
            this.showSuccess('Location updated successfully!');
        } catch (error) {
            console.error('Update location error:', error);
            this.showError('Failed to update location');
        }
    }

    async logItemWear(itemId) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/item/${itemId}/wear`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) throw new Error('Wear logging failed');

            this.showSuccess('Wear logged successfully!');
            await this.loadItems();
        } catch (error) {
            console.error('Log wear error:', error);
            this.showError('Failed to log wear');
        }
    }

    async loadItems() {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/item`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                console.error('Failed to load items:', response.status);
                return;
            }

            this.items = await response.json();
            this.applyFilters();
            this.updateStats();
            // Re-attach RFID buttons
            document.querySelectorAll('.item-card').forEach(card => this.addRfidButtonToCard(card));
        } catch (error) {
            console.error('Load items error:', error);
        }
    }

    renderItems(items) {
        const container = document.getElementById('itemsContainer');
        if (!container) return;
        container.innerHTML = '';

        items.forEach(item => {
            const itemHtml = this.createItemCard(item);
            container.insertAdjacentHTML('beforeend', itemHtml);
        });
    }

    createItemCard(item) {
        const hasRfid = item.rfidTag ? 'text-success' : '';
        const rfidIcon = item.rfidTag ? 'bi-check-circle-fill' : 'bi-broadcast';

        return `
      <div class="col-md-6 col-lg-4 col-xl-3" data-category="${item.category}" data-item-id="${item.id}">
        <div class="item-card">
          <div class="item-card-image">
            <img src="${item.imageUrl || 'https://placehold.co/300x300/f9fafb/6366f1?text=' + encodeURIComponent(item.name)}" alt="${item.name}">
            <div class="item-card-actions">
              <button class="action-btn favorite-btn ${item.isFavorite ? 'active' : ''}" title="Favorite">
                <i class="bi ${item.isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
              </button>
              <button class="action-btn rfid-btn ${hasRfid}" title="RFID">
                <i class="bi ${rfidIcon}"></i>
              </button>
              <button class="action-btn more-btn" title="More options">
                <i class="bi bi-three-dots"></i>
              </button>
            </div>
          </div>
          <div class="item-card-content">
            <h6 class="item-title">${item.name}</h6>
            <p class="item-category text-muted">${item.category}</p>
            ${item.notes ? `<p class="item-notes">${item.notes}</p>` : ''}
          </div>
        </div>
      </div>
    `;
    }

    bindFilterEvents() {
        const searchInput = document.getElementById('searchItems');
        const categoryPills = document.querySelectorAll('.category-pill');
        const filterBtn = document.getElementById('filterBtn');

        searchInput?.addEventListener('input', (e) => this.filterItems(e.target.value));

        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                categoryPills.forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterByCategory(e.currentTarget.dataset.category);
            });
        });

        filterBtn?.addEventListener('click', () => this.toggleFilterPanel());
    }

    bindViewToggle() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.switchView(e.currentTarget.dataset.view);
            });
        });
    }

    bindItemActions() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.item-card');

            if (e.target.closest('.favorite-btn')) {
                if (card) this.toggleFavorite(card);
            }

            if (e.target.closest('.rfid-btn') && !e.target.closest('.rfid-btn').classList.contains('text-success')) {
                if (card) this.handleItemRfidScan(card);
            }

            if (e.target.closest('.more-btn')) {
                if (card) this.showContextMenu(card, e);
            }
        });
    }

    filterItems(searchTerm = '') {
        this.currentFilter = String(searchTerm).toLowerCase();
        this.applyFilters();
    }

    filterByCategory(category = 'all') {
        this.currentCategory = category;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredItems = this.items.filter(item => {
            const matchesSearch =
                !this.currentFilter ||
                item.name.toLowerCase().includes(this.currentFilter) ||
                item.category.toLowerCase().includes(this.currentFilter) ||
                (item.notes && item.notes.toLowerCase().includes(this.currentFilter));

            const matchesCategory =
                !this.currentCategory ||
                this.currentCategory === 'all' ||
                item.category === this.currentCategory;

            return matchesSearch && matchesCategory;
        });

        this.renderItems(this.filteredItems);
    }

    toggleFilterPanel() {
        const panel = document.getElementById('filterPanel');
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? '' : 'none';
    }

    switchView(view) {
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');

        if (!gridView || !listView) return;

        if (view === 'grid') {
            gridView.style.display = '';
            listView.style.display = 'none';
        } else {
            gridView.style.display = 'none';
            listView.style.display = '';
        }
    }

    async toggleFavorite(card) {
        const btn = card.querySelector('.favorite-btn');
        const icon = btn?.querySelector('i');
        const isActive = btn?.classList.contains('active');

        try {
            const itemId = card.dataset.itemId;
            const token = window.authManager?.token;

            const response = await fetch(`${this.API_BASE}/item/${itemId}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ favorite: !isActive })
            });

            if (response.ok && btn && icon) {
                btn.classList.toggle('active', !isActive);
                icon.className = isActive ? 'bi bi-star' : 'bi bi-star-fill';
            }
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    }

    showContextMenu(card, event) {
        event.preventDefault();

        const itemId = card.dataset.itemId;
        const item = this.items.find(i => String(i.id) === String(itemId));
        if (!item) return;

        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '9999';

        menu.innerHTML = `
      <div class="dropdown-menu show">
        <button class="dropdown-item" onclick="window.wardrobeManager.editItem('${itemId}')">
          <i class="bi bi-pencil me-2"></i>Edit
        </button>
        <button class="dropdown-item" onclick="window.wardrobeManager.logItemWear('${itemId}')">
          <i class="bi bi-clock me-2"></i>Log Wear
        </button>
        <button class="dropdown-item" onclick="window.wardrobeManager.showLocationModal('${itemId}')">
          <i class="bi bi-geo-alt me-2"></i>Update Location
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item text-danger" onclick="window.wardrobeManager.deleteItem('${itemId}')">
          <i class="bi bi-trash me-2"></i>Delete
        </button>
      </div>
    `;

        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function removeMenu() {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            });
        }, 100);
    }

    showLocationModal(itemId) {
        const item = this.items.find(i => String(i.id) === String(itemId));
        if (!item) return;

        const modalHTML = `
      <div class="modal fade" id="locationModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Update Location - ${item.name}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="itemLocation" class="form-label">Current Location</label>
                <select class="form-control" id="itemLocation">
                  <option value="wardrobe" ${item.location === 'wardrobe' ? 'selected' : ''}>Wardrobe</option>
                  <option value="laundry" ${item.location === 'laundry' ? 'selected' : ''}>Laundry</option>
                  <option value="worn" ${item.location === 'worn' ? 'selected' : ''}>Currently Worn</option>
                  <option value="storage" ${item.location === 'storage' ? 'selected' : ''}>Storage</option>
                  <option value="missing" ${item.location === 'missing' ? 'selected' : ''}>Missing</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="window.wardrobeManager.saveLocation('${itemId}')">Update</button>
            </div>
          </div>
        </div>
      </div>
    `;

        const existingModal = document.getElementById('locationModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('locationModal'));
        modal.show();
    }

    async saveLocation(itemId) {
        const select = document.getElementById('itemLocation');
        const location = select?.value;
        if (!location) return;

        await this.updateItemLocation(itemId, location);
        const modal = bootstrap.Modal.getInstance(document.getElementById('locationModal'));
        modal?.hide();
    }

    async editItem(itemId) {
        const item = this.items?.find(i => String(i.id) === String(itemId));
        if (!item) return;

        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemNotes').value = item.notes || '';

        if (item.imageUrl) {
            const preview = document.getElementById('imagePreview');
            preview.style.backgroundImage = `url(${item.imageUrl})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.innerHTML = '';
            document.getElementById('removeImageBtn').classList.remove('d-none');
        }

        const title = document.querySelector('#addItemModal .modal-title');
        if (title) title.textContent = 'Edit Item';

        const saveBtn = document.getElementById('saveItemBtn');
        const newHandler = () => this.updateItemFromForm(itemId);
        if (saveBtn) {
            const clone = saveBtn.cloneNode(true);
            clone.addEventListener('click', newHandler);
            saveBtn.parentNode.replaceChild(clone, saveBtn);
        }

        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        modal.show();
    }

    updateStats() {
        const stats = {
            total: this.items.length,
            categories: [...new Set(this.items.map(item => item.category))].length,
            withRfid: this.items.filter(item => item.rfidTag).length,
            favorites: this.items.filter(item => item.isFavorite).length
        };

        const totalItems = document.getElementById('totalItems');
        const totalCategories = document.getElementById('totalCategories');
        const itemsWithRfid = document.getElementById('itemsWithRfid');
        const favoriteItems = document.getElementById('favoriteItems');

        if (totalItems) totalItems.textContent = stats.total;
        if (totalCategories) totalCategories.textContent = stats.categories;
        if (itemsWithRfid) itemsWithRfid.textContent = stats.withRfid;
        if (favoriteItems) favoriteItems.textContent = stats.favorites;
    }

    showError(message) {
        const alertContainer = document.getElementById('alertContainer') || document.querySelector('.container');
        if (!alertContainer) return;
        alertContainer.insertAdjacentHTML('afterbegin', `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
    }

    showSuccess(message) {
        const alertContainer = document.getElementById('alertContainer') || document.querySelector('.container');
        if (!alertContainer) return;
        alertContainer.insertAdjacentHTML('afterbegin', `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.wardrobeManager = new WardrobeManager();
});