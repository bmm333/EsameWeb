import RfidSetupManager from './rfid-setup.js';

class WardrobeManager {
  constructor() {
    this.rfidSetup = new RfidSetupManager();
    this.init();
  }

  async init() {
    // Check authentication
    if (!window.authManager?.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    await this.loadItems();
    this.bindEvents();
    this.checkDeviceStatus();
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
    
    // RFID-specific events
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
    const itemTitle = card.querySelector('.item-title').textContent;
    const itemId = card.dataset.itemId || itemTitle; // You'll need to add item IDs to cards
    
    try {
      await this.rfidSetup.openScanModalAndAssociate(itemId, (tag, result) => {
        console.log('RFID tag associated with item:', itemTitle, tag, result);
        
        // Update card to show RFID is associated
        const rfidBtn = card.querySelector('.rfid-btn');
        rfidBtn.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
        rfidBtn.title = 'RFID Tag Associated';
      });
    } catch (error) {
      alert('RFID scan failed: ' + error.message);
    }
  }

  async loadItems() {
    try {
      const token = window.authManager?.token;
      const response = await fetch(`${window.API_BASE || 'http://localhost:3001'}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const items = await response.json();
        this.renderItems(items);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  renderItems(items) {
    // Implementation for rendering items from backend
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    // Clear existing items
    gridView.innerHTML = '<div class="row g-4" id="itemsContainer"></div>';
    listView.innerHTML = '';
    
    const container = gridView.querySelector('#itemsContainer');
    
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
              <button class="action-btn rfid-btn ${hasRfid}" title="${item.rfidTag ? 'RFID Tag Associated' : 'Associate RFID Tag'}">
                <i class="bi ${rfidIcon}"></i>
              </button>
              <button class="action-btn more-btn" title="More Options">
                <i class="bi bi-three-dots"></i>
              </button>
            </div>
          </div>
          <div class="item-card-content">
            <h3 class="item-title">${item.name}</h3>
            <div class="item-meta">
              <span class="item-category">${item.category}</span>
              <span class="item-stat">
                <i class="bi bi-repeat"></i>${item.wearCount || 0} Wears
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindFilterEvents() {
    // Filter and search functionality
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
    // Handle item card actions (favorite, more options, etc.)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        this.toggleFavorite(e.target.closest('.item-card'));
      }
      
      if (e.target.closest('.more-btn')) {
        this.showContextMenu(e.target.closest('.item-card'), e);
      }
      
      if (e.target.closest('.rfid-btn') && !e.target.closest('.rfid-btn').classList.contains('text-success')) {
        this.handleItemRfidScan(e.target.closest('.item-card'));
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

  toggleFavorite(card) {
    const btn = card.querySelector('.favorite-btn');
    const icon = btn.querySelector('i');
    const isActive = btn.classList.contains('active');
    
    btn.classList.toggle('active', !isActive);
    icon.className = isActive ? 'bi bi-star' : 'bi bi-star-fill';
    
    // TODO: Send update to backend
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