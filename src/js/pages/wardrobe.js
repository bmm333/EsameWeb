import RfidSetupManager from './rfid-setup.js';

class WardrobeManager {
  constructor() {
    this.selectedImageFile = null;
    this.selectedRfidTag = null;
    this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:3001' 
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
    await this.loadItems();
    await this.checkDeviceStatus();
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
      await this.loadItems();
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
    // Implementation for context menu
    console.log('Show context menu for item:', card.querySelector('.item-title').textContent);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.wardrobeManager = new WardrobeManager();
});