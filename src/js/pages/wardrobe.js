export function render() {
    return `
    <div class="container py-4">
      <div id="alertContainer"></div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>My Wardrobe</h1>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addItemModal">
          <i class="bi bi-plus-lg"></i> Add Item
        </button>
      </div>

      <div class="mb-3 d-flex gap-2 align-items-center">
        <div class="search-box flex-grow-1">
          <i class="bi bi-search"></i>
          <input type="text" id="searchItems" placeholder="Search items..." class="form-control">
        </div>
    <button type="button" class="btn btn-outline-secondary" id="filterBtn" aria-label="Open filter options">
          <i class="bi bi-funnel"></i> Filter
        </button>
      </div>

      <div class="filter-panel mb-4" id="filterPanel">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="categoryFilter" class="form-label">Category</label>
            <select aria-labelledby="categoryFilter" class="form-select" id="categoryFilter">
              <option value="">All Categories</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="outerwear">Outerwear</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
              <option value="dresses">Dresses</option>
              <option value="bags">Bags</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Color</label>
            <select aria-labelledby="colorFilter" class="form-select" id="colorFilter">
              <option value="">All Colors</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="gray">Gray</option>
              <option value="brown">Brown</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Occasion</label>
            <select aria-labelledby="occasionFilter" class="form-select" id="occasionFilter">
              <option value="">All Occasions</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Sort By</label>
            <select aria-labelledby="sortFilter" class="form-select" id="sortFilter">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
        <div class="mt-3">
          <button type="button" class="btn btn-secondary me-2" id="resetFiltersBtn" aria-label="Reset filters">Reset</button>
          <button type="button" class="btn btn-primary" id="applyFiltersBtn" aria-label="Apply filters">Apply Filters</button>
        </div>
      </div>

      <div class="category-pills mb-4">
    <button type="button" class="category-pill active" data-category="" aria-label="Show all items">All Items</button>
    <button type="button" class="category-pill" data-category="tops" aria-label="Show tops items">Tops</button>
    <button type="button" class="category-pill" data-category="bottoms" aria-label="Show bottoms items">Bottoms</button>
    <button type="button" class="category-pill" data-category="outerwear" aria-label="Show outerwear items">Outerwear</button>
    <button type="button" class="category-pill" data-category="shoes" aria-label="Show shoes items">Shoes</button>
    <button type="button" class="category-pill" data-category="accessories" aria-label="Show accessories items">Accessories</button>
    <button type="button" class="category-pill" data-category="dresses" aria-label="Show dresses items">Dresses</button>
    <button type="button" class="category-pill" data-category="bags" aria-label="Show bags items">Bags</button>
      </div>

      <div class="row g-4" id="itemsContainer"></div>

      <div class="modal fade" id="addItemModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalTitle">Add New Item</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="addItemForm">
                <div class="mb-3">
                  <label for="itemImageInput" class="form-label">Item Image</label>
                  <div class="image-upload-area" id="imageUploadArea">
                    <div id="imagePreview">
                      <i class="bi bi-camera-fill upload-icon"></i>
                      <span class="upload-text">Click to add photo</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 d-none" id="removeImageBtn" aria-label="Remove image" title="Remove image">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <input type="file" id="itemImageInput" accept="image/*">
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="itemName" class="form-label">Name *</label>
                      <input type="text" class="form-control" id="itemName" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Category *</label>
                      <select aria-labelledby="itemCategory" class="form-select" id="itemCategory" required>
                        <option value="">Select category</option>
                        <option value="tops">Tops</option>
                        <option value="bottoms">Bottoms</option>
                        <option value="shoes">Shoes</option>
                        <option value="accessories">Accessories</option>
                        <option value="outerwear">Outerwear</option>
                        <option value="dresses">Dresses</option>
                        <option value="bags">Bags</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Color</label>
                      <input type="text" class="form-control" id="itemColor" placeholder="e.g., Blue, Red, Black">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Occasion</label>
                      <select aria-labelledby="itemOccasion" class="form-select" id="itemOccasion">
                        <option value="">Select occasion</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="sporty">Sporty</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea class="form-control" id="itemNotes" rows="2" placeholder="Additional notes about the item"></textarea>
                </div>

                <div class="mb-3" id="rfidSection">
                  <label class="form-label">RFID Tag</label>
                  <div class="rfid-status" id="rfidStatusAdd">
                    <span class="text-muted">No RFID tag</span>
                    <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
                      <i class="bi bi-broadcast"></i> Scan Tag
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveItemBtn">Save Item</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-danger">Delete Item</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete <strong id="deleteItemName"></strong>?</p>
              <p class="text-muted">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="rfidModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Scan RFID Tag</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <i class="bi bi-broadcast fs-1 text-primary mb-3"></i>
              <p>Place your RFID tag near the reader to scan.</p>
              <div id="rfidStatus" class="mt-3">
                <span class="text-muted">Waiting for tag...</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;
}

let isSaving = false;

export async function init() {
    const { api } = window.app;
    let items = [];
    let filteredItems = [];
    let itemToDelete = null;
    
    const itemsClient = new (await import('../services/items-client.js')).ItemsClient(api);
    const mediaClient = new (await import('../services/media-client.js')).MediaClient(api);
    let selected_file = null;
    let selected_tag_id = null;
    let editingItemId = null;
    let currentFilters = {
        search: '',
        category: '',
        color: '',
        occasion: '',
        sort: 'newest'
    };
     async function isTrialUser() {
        try {
            const user = window.app?.userContext?.profile;
            return user?.subscriptionTier === 'trial' || 
                   user?.trial === true || 
                   user?.accountType === 'trial' ||
                   !user?.subscriptionTier;
        } catch {
            return false;
        }
    }
    setTimeout(async () => {
        if (await isTrialUser()) {
            const rfidSection = document.getElementById('rfidSection');
            if (rfidSection) {
                rfidSection.style.display = 'none';
            }
        }
    }, 100);

    await reload();
    document.getElementById('searchItems')?.addEventListener('input', debounce((e) => {
        currentFilters.search = e.target.value.toLowerCase().trim();
        applyFiltersAndRender();
    }, 300));
    document.getElementById('filterBtn')?.addEventListener('click', () => {
        const panel = document.getElementById('filterPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    });
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-pill')) {
            document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.category = e.target.dataset.category || '';
            applyFiltersAndRender();
        }
    });
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
    });

    document.getElementById('colorFilter')?.addEventListener('change', (e) => {
        currentFilters.color = e.target.value;
    });

    document.getElementById('occasionFilter')?.addEventListener('change', (e) => {
        currentFilters.occasion = e.target.value;
    });

    document.getElementById('sortFilter')?.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
    });

    document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
        applyFiltersAndRender();
        const panel = document.getElementById('filterPanel');
        if (panel) panel.style.display = 'none';
    });

    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        currentFilters = {
            search: '',
            category: '',
            color: '',
            occasion: '',
            sort: 'newest'
        };
        document.getElementById('searchItems').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('colorFilter').value = '';
        document.getElementById('occasionFilter').value = '';
        document.getElementById('sortFilter').value = 'newest';
        document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
        document.querySelector('.category-pill[data-category=""]')?.classList.add('active');
        
        applyFiltersAndRender();
    });
    bind_image_inputs();
    document.getElementById('scanRfidBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (await isTrialUser()) {
            error('RFID features are not available during your trial period. Upgrade to access RFID functionality.');
            return;
        }
        try {
            const api = window.app.api;
            await api.post('/rfid/association-mode', { active: true });
            await api.post('/rfid/scan/clear');
            
            const rfidStatus = document.getElementById('rfidStatusAdd');
            rfidStatus.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span>Scanning for RFID tag...</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="cancelScan">Cancel</button>
                </div>
            `;
            let scanning = true;
            document.getElementById('cancelScan')?.addEventListener('click', async () => {
                scanning = false;
                await api.post('/rfid/association-mode', { active: false });
                rfidStatus.innerHTML = `
                    <span class="text-muted">No RFID tag</span>
                    <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
                        <i class="bi bi-broadcast"></i> Scan Tag
                    </button>
                `;
            });
            const pollForTag = setInterval(async () => {
                if (!scanning) {
                    clearInterval(pollForTag);
                    return;
                }
                
                try {
                    const result = await api.get('/rfid/scan');
                    
                    if (result.tagId) {
                        scanning = false;
                        clearInterval(pollForTag);
                        selected_tag_id = result.tagId;
                        
                        await api.post('/rfid/association-mode', { active: false });
                        
                        rfidStatus.innerHTML = `
                            <div class="d-flex align-items-center">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                <span>Tag: ${result.tagId}</span>
                                <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="clearTag">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                        `;
                        
                        document.getElementById('clearTag')?.addEventListener('click', () => {
                            selected_tag_id = null;
                            rfidStatus.innerHTML = `
                                <span class="text-muted">No RFID tag</span>
                                <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
                                    <i class="bi bi-broadcast"></i> Scan Tag
                                </button>
                            `;
                        });
                    }
                } catch (error) {
                    console.error('Poll error:', error);
                }
            }, 1500);

        } catch (error) {
            console.error('RFID scan failed:', error);
            await api.post('/rfid/association-mode', { active: false });
        }
    });

    document.getElementById('saveItemBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSaving) {
            return;
        }
        
        isSaving = true;
        const saveBtn = e.target;
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        const modal_el = document.getElementById('addItemModal');
        let createdItem = null;

        try {
            const name = document.getElementById('itemName').value.trim();
            const category = document.getElementById('itemCategory').value;
            const color = document.getElementById('itemColor').value.trim();
            const occasion = document.getElementById('itemOccasion').value;
            const notes = document.getElementById('itemNotes').value.trim();
            
            if (!name || !category) throw new Error('Name and category are required');
            
            let imageUrl = null;
            if (editingItemId) {
                const existingItem = items.find(item => item.id === editingItemId);
                imageUrl = existingItem?.imageUrl || null;
            }
            
            if (selected_file && selected_file !== 'REMOVE') {
                try {
                    const up = await mediaClient.upload_item_image(selected_file);
                    if (typeof up === 'string' && up.includes('<!DOCTYPE html>')) {
                        throw new Error('Upload endpoint returned HTML - likely authentication or routing issue');
                    }
                    imageUrl = up?.media?.url || up?.url || up?.data?.url || up?.imageUrl || up?.secure_url || up?.location || up?.path || (typeof up === 'string' ? up.trim() : null) || up?._raw || null;
                } catch (uploadError) {
                    console.error('Upload failed:', uploadError.message);
                }
            }

            const itemData = { name, category, color, occasion, notes, imageUrl };
            
            if (editingItemId) {
                createdItem = await itemsClient.update(editingItemId, itemData);
            } else {
                createdItem = await itemsClient.create(itemData);
            }
            
            if (selected_tag_id) {
                const itemCheck = await itemsClient.list();
                const itemExists = itemCheck.some(item => item.id === createdItem.id);
                if (!itemExists) {
                    throw new Error('Created item was deleted unexpectedly');
                }
                const result = await itemsClient.associate_tag_to_item(selected_tag_id, createdItem.id, false);
                if (result.conflict) {
                    const shouldOverride = await showConflictDialog(result);
                    if (shouldOverride) {
                        const overrideResult = await itemsClient.associate_tag_to_item(selected_tag_id, createdItem.id, true);
                        if (overrideResult.success) {
                            ok('Item created and tag reassociated (old item removed)');
                        } else {
                            throw new Error(overrideResult.message || 'Override failed');
                        }
                    } else {
                        await itemsClient.delete(createdItem.id);
                        createdItem = null;
                        throw new Error('Item creation cancelled - tag already in use');
                    }
                } else if (result.success) {
                    ok(`Item ${editingItemId ? 'updated' : 'created'} and RFID tag associated`);
                } else {
                    throw new Error(result.message || 'Association failed');
                }
            } else {
                ok(`Item ${editingItemId ? 'updated' : 'created'} successfully`);
            }
            
            await api.post('/rfid/association-mode', { active: false });
            bootstrap.Modal.getInstance(modal_el)?.hide();
            selected_file = null;
            selected_tag_id = null;
            editingItemId = null;
            reset_form();
            await reload();
            
        } catch (err) {
            console.error('Save item error:', err);
            if (createdItem && createdItem.id && !editingItemId) {
                try {
                    await itemsClient.delete(createdItem.id);
                } catch (deleteError) {
                    console.error('Failed to cleanup created item:', deleteError);
                }
            }
            error(err.message || 'Failed to save item');
            try {
                await api.post('/rfid/association-mode', { active: false });
            } catch (e) {
                console.error('Failed to exit association mode:', e);
            }
        } finally {
            isSaving = false;
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    });
    
    document.addEventListener('click', async (e) => {
        const card = e.target.closest('.item-card');
        if (!card) return;
        const container = card.closest('[data-item-id]');
        const item_id = container?.dataset?.itemId;
        const item = items.find(i => i.id == item_id);
        if (!item) return;
        
        if (e.target.closest('.favorite-btn')) {
            const btn = card.querySelector('.favorite-btn');
            const active = btn?.classList.contains('active');
            try {
                await itemsClient.toggle_favorite(item_id, !active);
                btn.classList.toggle('active', !active);
                const icon = btn.querySelector('i');
                if (icon) icon.className = !active ? 'bi bi-star-fill' : 'bi bi-star';
                item.isFavorite = !active;
                ok(`Item ${!active ? 'added to' : 'removed from'} favorites`);
            } catch (err) {
                error('Failed to toggle favorite');
                console.error(err);
            }
        }
        if (e.target.closest('.edit-item')) {
            e.preventDefault();
            await editItem(item);
        }
        if (e.target.closest('.delete-item')) {
            e.preventDefault();
            await confirmDeleteItem(item);
        }
        if (e.target.closest('.refresh-status')) {
            e.preventDefault();
            await refreshItemStatus(item_id);
        }
    });
    
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
        if (!itemToDelete) return;
        try {
            await itemsClient.delete(itemToDelete.id);
            ok(`Item "${itemToDelete.name}" deleted successfully`);
            bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
            await reload();
        } catch (err) {
            error('Failed to delete item');
            console.error(err);
        }
        itemToDelete = null;
    });
    
    async function showConflictDialog(conflictData) {
        return new Promise((resolve) => {
            const existingItem = conflictData.existingItem;
            const modalHtml = `
                <div class="modal fade" id="conflictModal" tabindex="-1" data-bs-backdrop="static">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title text-warning">
                                    <i class="bi bi-exclamation-triangle me-2"></i>Tag Already in Use
                                </h5>
                            </div>
                            <div class="modal-body">
                                <p><strong>This RFID tag is already associated with:</strong></p>
                                <div class="alert alert-info">
                                    <strong>${existingItem?.name || 'Unknown Item'}</strong><br>
                                    <small class="text-muted">Category: ${existingItem?.category || 'Unknown'}</small>
                                </div>
                                <p class="text-danger">
                                    <strong>If you continue:</strong><br>
                                    • The existing item "<em>${existingItem?.name}</em>" will be <strong>deleted</strong><br>
                                    • This tag will be associated with your new item
                                </p>
                                <p>What would you like to do?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" id="cancelConflict">
                                    Cancel & Scan Different Tag
                                </button>
                                <button type="button" class="btn btn-danger" id="overrideConflict">
                                    <i class="bi bi-exclamation-triangle me-1"></i>
                                    Delete Old Item & Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const existing = document.getElementById('conflictModal');
            if (existing) existing.remove();
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const conflictModal = new bootstrap.Modal(document.getElementById('conflictModal'));
            conflictModal.show();
            document.getElementById('cancelConflict').addEventListener('click', () => {
                conflictModal.hide();
                resolve(false);
            });
            document.getElementById('overrideConflict').addEventListener('click', () => {
                conflictModal.hide();
                resolve(true);
            });
            document.getElementById('conflictModal').addEventListener('hidden.bs.modal', () => {
                document.getElementById('conflictModal').remove();
            });
        });
    }

   function bind_image_inputs() {
    const upload_area = document.getElementById('imageUploadArea');
    const file_input = document.getElementById('itemImageInput');
    const preview = document.getElementById('imagePreview');
    const remove_btn = document.getElementById('removeImageBtn');

    if (upload_area) {
        upload_area.replaceWith(upload_area.cloneNode(true));
        const new_upload_area = document.getElementById('imageUploadArea');
        
        new_upload_area?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file_input = document.getElementById('itemImageInput');
            if (file_input) {
                file_input.click();
            }
        });
    }
    
    if (file_input) {
        file_input.replaceWith(file_input.cloneNode(true));
        const new_file_input = document.getElementById('itemImageInput');
        
        new_file_input?.addEventListener('change', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.target.files?.[0];
            if (!file) return;
            
            selected_file = file;
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = document.getElementById('imagePreview');
                const remove_btn = document.getElementById('removeImageBtn');
                if (preview) {
                    preview.innerHTML = '';
                    preview.style.backgroundImage = `url(${ev.target.result})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                }
                remove_btn?.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (remove_btn) {
        remove_btn.replaceWith(remove_btn.cloneNode(true));
        const new_remove_btn = document.getElementById('removeImageBtn');
        
        new_remove_btn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const preview = document.getElementById('imagePreview');
            const file_input = document.getElementById('itemImageInput');
            
            if (editingItemId) {
                selected_file = 'REMOVE';
                if (preview) {
                    preview.innerHTML = `
                        <div class="text-center py-4">
                            <i class="bi bi-image text-muted fs-1"></i>
                            <p class="text-muted mb-0">Image will be removed</p>
                        </div>
                    `;
                    preview.style.backgroundImage = '';
                }
            } else {
                selected_file = null;
                if (file_input) file_input.value = '';
                if (preview) {
                    preview.style.backgroundImage = '';
                    preview.innerHTML = `<i class="bi bi-camera-fill upload-icon"></i><span class="upload-text">Click to add photo</span>`;
                }
            }
            new_remove_btn.classList.add('d-none');
        });
    }
}

    async function editItem(item) {
        editingItemId = item.id;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Edit Item';
        document.getElementById('itemName').value = item.name || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemColor').value = item.color || '';
        document.getElementById('itemOccasion').value = item.occasion || '';
        document.getElementById('itemNotes').value = item.notes || '';
        const preview = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removeImageBtn');
        selected_file = null;
        
        if (item.imageUrl) {
            preview.innerHTML = '';
            preview.style.backgroundImage = `url(${item.imageUrl})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            removeBtn.classList.remove('d-none');
        } else {
            preview.style.backgroundImage = '';
            preview.innerHTML = `<i class="bi bi-camera-fill upload-icon"></i><span class="upload-text">Click to add photo</span>`;
            removeBtn.classList.add('d-none');
        }
        
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'),{backdrop:'static'});
        modal.show();
    }

    async function confirmDeleteItem(item) {
        itemToDelete = item;
        document.getElementById('deleteItemName').textContent = item.name;
        
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    async function reload() {
        try {
            items = await itemsClient.list();
            applyFiltersAndRender();
        } catch (e) {
            error('Failed to load items');
        }
    }

    function applyFiltersAndRender() {
        let filtered = [...items];

        if (currentFilters.search) {
            filtered = filtered.filter(item =>
                item.name?.toLowerCase().includes(currentFilters.search) ||
                item.category?.toLowerCase().includes(currentFilters.search) ||
                item.notes?.toLowerCase().includes(currentFilters.search) ||
                item.color?.toLowerCase().includes(currentFilters.search)
            );
        }
        if (currentFilters.category) {
            filtered = filtered.filter(item => item.category === currentFilters.category);
        }
        if (currentFilters.color) {
            filtered = filtered.filter(item => item.color === currentFilters.color);
        }
        if (currentFilters.occasion) {
            filtered = filtered.filter(item => item.occasion === currentFilters.occasion);
        }
        filtered.sort((a, b) => {
            switch (currentFilters.sort) {
                case 'oldest':
                    return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                case 'newest':
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
        filteredItems = filtered;
        render_items(filtered);
    }
    function render_items(list) {
        const container = document.getElementById('itemsContainer');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center text-muted py-5">
                        <i class="bi bi-search fs-1 mb-3"></i>
                        <h5>No items found</h5>
                        <p>Try adjusting your search or filters</p>
                    </div>
                </div>
            `;
            return;
        }
        container.innerHTML = list.map(item => item_to_card(item)).join('');
    }

    function item_to_card(item) {
        const safeName = (item?.name || 'Item').replace(/`/g, '\\`');
        const safeNotes = (item?.notes || '').replace(/`/g, '\\`');
        const safeColor = (item?.color || '').replace(/`/g, '\\`');
        const safeOccasion = (item?.occasion || '').replace(/`/g, '\\`');
        const safeCategory = (item?.category || '').replace(/`/g, '\\`');
        
        const src = item?.imageUrl || `https://placehold.co/300x300/f9fafb/6366f1?text=${encodeURIComponent(safeName)}`;
        const hasRfidTag = item.hasRfidTag || !!item.rfidTag;
        let isAvailable, actualLocation, statusBadge;
        
        if (hasRfidTag) {
            isAvailable = item.isAvailable !== undefined ? item.isAvailable : true; 
            actualLocation = item.actualLocation || item.location || 'wardrobe';
            if (isAvailable) {
                statusBadge = '<span class="badge bg-success position-absolute top-0 start-0 m-2">Available</span>';
            } else if (actualLocation === 'being_worn') {
                statusBadge = '<span class="badge bg-warning position-absolute top-0 start-0 m-2">Being Worn</span>';
            } else {
                statusBadge = '<span class="badge bg-secondary position-absolute top-0 start-0 m-2">Not Available</span>';
            }
        } else {
            isAvailable = false;
            actualLocation = 'unknown';
            statusBadge = '<span class="badge bg-secondary position-absolute top-0 start-0 m-2">Unknown</span>';
        }
        let lastSeenInfo = '';
        if (hasRfidTag && item.lastSeen) {
            const lastSeenDate = new Date(item.lastSeen);
            const timeDiff = Date.now() - lastSeenDate.getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            let timeAgo = '';
            if (days > 0) {
                timeAgo = `${days}d ago`;
            } else if (hours > 0) {
                timeAgo = `${hours}h ago`;
            } else {
                timeAgo = 'Just now';
            }
            lastSeenInfo = `<small class="text-muted d-block">Last seen: ${timeAgo}</small>`;
        } else if (!hasRfidTag) {
            lastSeenInfo = `<small class="text-muted d-block">No RFID tracking</small>`;
        }
        return `
            <div class="col-md-6 col-lg-4 col-xl-3" data-item-id="${item.id}">
                <div class="item-card ${!isAvailable ? 'item-unavailable' : ''}">
                    <div class="item-card-image position-relative">
                        <img src="${src}" alt="Image of ${safeName} ${safeCategory} item"  text="Item Image" loading="lazy">
                        ${statusBadge}
                        ${hasRfidTag ? '<i class="bi bi-broadcast-pin position-absolute bottom-0 end-0 m-2 text-primary" title="RFID Enabled"></i>' : '<i class="bi bi-question-circle position-absolute bottom-0 end-0 m-2 text-muted" title="No RFID Tag"></i>'}
                        <div class="item-card-actions">
                            <button class="action-btn favorite-btn${item.isFavorite ? ' active' : ''}" type="button" aria-label="Favorite" title="Favorite">
                                <i class="bi ${item.isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
                            </button>
                            <div class="dropdown">
                                <button class="action-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Show actions">
                                    <i class="bi bi-three-dots"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item edit-item" href="#" data-item-id="${item.id}">
                                        <i class="bi bi-pencil me-2"></i>Edit
                                    </a></li>
                                    <li><a class="dropdown-item delete-item text-danger" href="#" data-item-id="${item.id}">
                                        <i class="bi bi-trash me-2"></i>Delete
                                    </a></li>
                                    ${hasRfidTag ? `
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item refresh-status" href="#" data-item-id="${item.id}">
                                        <i class="bi bi-arrow-clockwise me-2"></i>Refresh Status
                                    </a></li>
                                    ` : `
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-muted" href="#" disabled>
                                        <i class="bi bi-broadcast me-2"></i>Add RFID Tag
                                    </a></li>
                                    `}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="item-card-content">
                        <h6 class="item-title">${safeName}</h6>
                        <p class="item-category text-muted">${safeCategory}</p>
                        ${safeColor ? `<small class="text-muted">Color: ${safeColor}</small><br>` : ''}
                        ${safeOccasion ? `<small class="text-muted">Occasion: ${safeOccasion}</small><br>` : ''}
                        ${lastSeenInfo}
                        ${safeNotes ? `<p class="item-notes">${safeNotes}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    async function refreshItemStatus(itemId) {
        try {
            const refreshButton = document.querySelector(`[data-item-id="${itemId}"] .refresh-status`);
            if (refreshButton) {
                refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Refreshing...';
            }
            const updatedItem = await itemsClient.get(itemId);
            const itemIndex = items.findIndex(item => item.id == itemId);
            if (itemIndex !== -1) {
                items[itemIndex] = updatedItem;
                applyFiltersAndRender(); 
                ok('Item status refreshed');
            }
        } catch (err) {
            error('Failed to refresh item status');
            console.error(err);
        }
    }
    function reset_form() {
    document.getElementById('addItemForm')?.reset();
    const preview = document.getElementById('imagePreview');
    const rm = document.getElementById('removeImageBtn');
    if (preview) {
        preview.style.backgroundImage = '';
        preview.innerHTML = `<i class="bi bi-camera-fill upload-icon"></i><span class="upload-text">Click to add photo</span>`;
    }
    rm?.classList.add('d-none');
    selected_file = null;
    selected_tag_id = null;
    editingItemId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Item';
    
    const rfidStatusAdd = document.getElementById('rfidStatusAdd');
    if (rfidStatusAdd) {
        rfidStatusAdd.innerHTML = `
            <span class="text-muted">No RFID tag</span>
            <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="scanRfidBtn">
                <i class="bi bi-broadcast"></i> Scan Tag
            </button>
        `;
    }
    api.post('/rfid/association-mode', { active: false }).catch(() => {});
}
    function error(msg) {
        const ac = document.getElementById('alertContainer');
        if (!ac) return;
        ac.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>${msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function ok(msg) {
        const ac = document.getElementById('alertContainer');
        if (!ac) return;
        ac.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show">
                <i class="bi bi-check-circle-fill me-2"></i>${msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
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
}