import RfidSetupManager from './rfid-setup.js';

class WardrobeManager {
  constructor() {
    this.selectedImageFile = null;
    this.selectedRfidTag = null;
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3002' 
      : '';
    this.init();
  }

  async init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    this.bindEvents();
    this.bindImageInputs();
    this.bindSaveItem();
    this.bindRfidEvents();
    this.bindFilterEvents();
    this.bindViewToggle();
    this.bindItemActions();
    await this.loadItems();
    await this.checkDeviceStatus();
  }
  async deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/item/${itemId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.filterItems(this.currentFilter);
        this.showSuccess('Item deleted successfully!');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      this.showError('Failed to delete item');
    }
  }
  bindImageInputs() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('itemImageInput');
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');

    // Click to upload
    uploadArea?.addEventListener('click', () => {
      fileInput?.click();
    });

    // File selection
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
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
      }
    });

    // Remove image
    removeBtn?.addEventListener('click', () => {
      this.selectedImageFile = null;
      fileInput.value = '';
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

    try {
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
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  bindSaveItem() {
    const saveBtn = document.getElementById('saveItemBtn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      saveBtn.disabled = true;
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';

      try {
        // Upload image first if selected
        let imageUrl = null;
        if (this.selectedImageFile) {
          imageUrl = await this.uploadImageFile();
        }

        // Prepare item data
        const itemData = {
          name: document.getElementById('itemName').value.trim(),
          category: document.getElementById('itemCategory').value,
          notes: document.getElementById('itemNotes').value.trim(),
          imageUrl: imageUrl,
          rfidTag: this.selectedRfidTag
        };

        // Validate required fields
        if (!itemData.name || !itemData.category) {
          throw new Error('Name and category are required');
        }

        // Save item
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

        const result = await response.json();
        console.log('Item saved:', result);

        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
        await this.loadItems();

        // Reset form
        this.resetItemForm();

      } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save item: ' + error.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
      }
    });
  }
  
  resetItemForm() {
    document.getElementById('addItemForm').reset();
    this.selectedImageFile = null;
    this.selectedRfidTag = null;
    
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    
    preview.style.backgroundImage = '';
    preview.innerHTML = `
      <i class="bi bi-camera-fill upload-icon"></i>
      <span class="upload-text">Click to add photo</span>
    `;
    removeBtn.classList.add('d-none');
    
    document.getElementById('rfidStatus').innerHTML = `
      <span class="text-muted">No RFID tag associated</span>
      <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
        <i class="bi bi-broadcast"></i> Scan Tag
      </button>
    `;
  }
  bindRfidEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'scanRfidBtn' || e.target.closest('#scanRfidBtn')) {
        this.handleRfidScan();
      }
    });
  }

  async handleRfidScan() {
    try {
      await window.rfidSetup?.openScanModalAndAssociate(null, (tagId) => {
        this.selectedRfidTag = tagId;
        document.getElementById('rfidStatus').innerHTML = `
          <span class="text-success">
            <i class="bi bi-check-circle-fill"></i> RFID Tag: ${tagId}
          </span>
        `;
      });
    } catch (error) {
      console.error('RFID scan error:', error);
      alert('RFID scan failed: ' + error.message);
    }
  }
  async checkDeviceStatus() {
    try {
      const status = await this.rfidSetup.getDeviceStatus();
      if (!status.devices || status.devices.length === 0) {
        this.showDeviceSetupPrompt();
      }
    } catch (error) {
      console.warn('Could not check device status:', error);
    }
  }
  async logItemWear(itemId) {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/item/${itemId}/wear`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        this.showSuccess('Wear logged successfully!');
        await this.loadItems(); // Refresh to update wear count
      } else {
        throw new Error('Wear logging failed');
      }
    } catch (error) {
      console.error('Log wear error:', error);
      this.showError('Failed to log wear');
    }
  }

  showDeviceSetupPrompt() {
    const promptHtml = `
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        <strong>RFID Device Not Found</strong>
        <p class="mb-2">Set up your Smart Wardrobe Pi to automatically track your items.</p>
        <a href="device-setup.html" class="btn btn-sm btn-primary">Setup Device</a>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    const container = document.querySelector('.container');
    const header = container.querySelector('.page-header');
    header.insertAdjacentHTML('afterend', promptHtml);
  }

  bindEvents() {
    // Existing wardrobe events
    this.bindFilterEvents();
    this.bindViewToggle();
    this.bindItemActions();
    this.bindRfidEvents();
  }

  bindRfidEvents() {
    // Add RFID scan button to add item modal
    const addItemModal = document.getElementById('addItemModal');
    if (addItemModal) {
      const modalBody = addItemModal.querySelector('.modal-body');
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
      
      // Insert before the notes field
      const notesField = modalBody.querySelector('#itemNotes').closest('.mb-3');
      notesField.insertAdjacentHTML('beforebegin', rfidSection);
      
      // Bind scan button
      document.getElementById('scanRfidBtn')?.addEventListener('click', () => this.handleRfidScan());
    }

    // Add RFID buttons to existing items
    document.querySelectorAll('.item-card').forEach(card => {
      this.addRfidButtonToCard(card);
    });
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

      if (response.ok) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          item.location = location;
        }
        this.showSuccess('Location updated successfully!');
      } else {
        throw new Error('Location update failed');
      }
    } catch (error) {
      console.error('Update location error:', error);
      this.showError('Failed to update location');
    }
  }
  addRfidButtonToCard(card) {
    const actions = card.querySelector('.item-card-actions');
    if (actions && !actions.querySelector('.rfid-btn')) {
      const rfidBtn = document.createElement('button');
      rfidBtn.className = 'action-btn rfid-btn';
      rfidBtn.title = 'Associate RFID Tag';
      rfidBtn.innerHTML = '<i class="bi bi-broadcast"></i>';
      rfidBtn.addEventListener('click', () => this.handleItemRfidScan(card));
      actions.appendChild(rfidBtn);
    }
  }

  async handleRfidScan() {
    // This would be called when adding a new item
    const itemName = document.getElementById('itemName').value;
    if (!itemName) {
      alert('Please enter item name first');
      return;
    }

    try {
      // Create temporary item ID for scanning
      const tempItemId = `temp_${Date.now()}`;
      
      await this.rfidSetup.openScanModalAndAssociate(tempItemId, (tag, result) => {
        console.log('RFID tag associated:', tag, result);
        // Store the tag ID for when the item is actually saved
        document.getElementById('addItemForm').dataset.rfidTag = tag.tagId;
        
        // Update UI to show tag is associated
        const scanBtn = document.getElementById('scanRfidBtn');
        scanBtn.innerHTML = '<i class="bi bi-check-circle-fill text-success me-2"></i>RFID Tag Associated';
        scanBtn.disabled = true;
      });
    } catch (error) {
      alert('RFID scan failed: ' + error.message);
    }
  }

  async handleItemRfidScan(card) {
    const itemId = card.dataset.itemId;
    try {
      await window.rfidSetup?.openScanModalAndAssociate(itemId, (tagId) => {
        card.querySelector('.rfid-btn').classList.add('text-success');
        card.querySelector('.rfid-btn i').className = 'bi bi-check-circle-fill';
        this.loadItems(); // Refresh to show updated RFID status
      });
    } catch (error) {
      console.error('RFID scan error:', error);
    }
  }

  async loadItems() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/item`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const items = await response.json();
        this.renderItems(items);
      } else {
        console.error('Failed to load items:', response.status);
      }
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
        e.target.classList.add('active');
        this.filterByCategory(e.target.dataset.category);
      });
    });
    
    filterBtn?.addEventListener('click', () => this.toggleFilterPanel());
  }

  bindViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        viewButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.switchView(e.target.dataset.view);
      });
    });
  }

  bindItemActions() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        this.toggleFavorite(e.target.closest('.item-card'));
      }
      
      if (e.target.closest('.rfid-btn') && !e.target.closest('.rfid-btn').classList.contains('text-success')) {
        this.handleItemRfidScan(e.target.closest('.item-card'));
      }
      
      if (e.target.closest('.more-btn')) {
        this.showContextMenu(e.target.closest('.item-card'), e);
      }
    });
  }

  filterItems(searchTerm) {
    const items = document.querySelectorAll('.item-card, .list-item');
    items.forEach(item => {
      const title = item.querySelector('.item-title').textContent.toLowerCase();
      const visible = title.includes(searchTerm.toLowerCase());
      item.closest('.col-md-6, .list-item').style.display = visible ? '' : 'none';
    });
  }

  filterByCategory(category) {
    const items = document.querySelectorAll('[data-category]');
    items.forEach(item => {
      const visible = category === 'all' || item.dataset.category === category;
      item.style.display = visible ? '' : 'none';
    });
  }

  toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? '' : 'none';
  }

  switchView(view) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
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
    const icon = btn.querySelector('i');
    const isActive = btn.classList.contains('active');
    
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

      if (response.ok) {
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
    const item = this.items.find(i => i.id == itemId);
    if (!item) return;

    // Remove existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
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

    // Remove menu when clicking elsewhere
    setTimeout(() => {
      document.addEventListener('click', function removeMenu() {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      });
    }, 100);
  }

  showLocationModal(itemId) {
    const item = this.items.find(i => i.id == itemId);
    if (!item) return;

    const modalHTML = `
      <div class="modal fade" id="locationModal" tabindex="-1">
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

    // Remove existing modal
    const existingModal = document.getElementById('locationModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('locationModal'));
    modal.show();
  }

  async saveLocation(itemId) {
    const location=document.getElementById('itemLocation').value;
    await this.updateItemLocation(itemId, location);
    const modal=bootstrap.Modal.getInstance(document.getElementById('locationModal'));
    modal.hide();
  }
  async editItem(itemId)
  {
    const item=this.item.find(i=>i.id==itemId);
    if(!item) return;
    document.getElementById('itemName').value=item.name;
    document.getElementById('itemCategory').value=item.category;
    document.getElementById('itemNotes').value=item.notes||'';

    if(item.imageUrl){
      const preview = document.getElementById('imagePreview');
      preview.style.backgroundImage = `url(${item.imageUrl})`;
      preview.style.display = 'cover';
      preview.style.backgroundPosition = 'center';
      preview.innerHTML='';
      document.getElementById('removeImageBtn').classList.remove('d-none');
    }
    document.querySelector('#addItemModal .modal-title').textContent='Edit Item';
    document.getElementById('saveItemBtn').onclick=()=>this.updateItemFromForm(itemId);
    const modal=new bootstrap.Modal(document.getElementById('addItemModal'));
    modal.show();
  }
  async updateItemFromForm(itemId) {
    try {
      // Upload new image if selected
      let imageUrl = null;
      if (this.selectedImageFile) {
        imageUrl = await this.uploadImageFile();
      }

      // Prepare update data
      const updateData = {
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value,
        notes: document.getElementById('itemNotes').value.trim()
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      // Update item
      const token = window.authManager?.token;
      const response = await fetch(`${this.API_BASE}/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await this.loadItems();
        this.showSuccess('Item updated successfully!');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
        this.resetItemForm();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Update item error:', error);
      this.showError('Failed to update item');
    }
  }
  filterItems(searchTerm) {
    this.currentFilter = searchTerm.toLowerCase();
    this.applyFilters();
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.currentFilter || 
        item.name.toLowerCase().includes(this.currentFilter) ||
        item.category.toLowerCase().includes(this.currentFilter) ||
        (item.notes && item.notes.toLowerCase().includes(this.currentFilter));
      
      const matchesCategory = !this.currentCategory || item.category === this.currentCategory;
      
      return matchesSearch && matchesCategory;
    });

    this.renderItems(this.filteredItems);
  }

  // Enhanced stats display
  updateStats() {
    const stats = {
      total: this.items.length,
      categories: [...new Set(this.items.map(item => item.category))].length,
      withRfid: this.items.filter(item => item.rfidTag).length,
      favorites: this.items.filter(item => item.isFavorite).length
    };

    document.getElementById('totalItems').textContent = stats.total;
    document.getElementById('totalCategories').textContent = stats.categories;
    document.getElementById('itemsWithRfid').textContent = stats.withRfid;
    document.getElementById('favoriteItems').textContent = stats.favorites;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.wardrobeManager = new WardrobeManager();
});