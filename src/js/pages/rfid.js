class RfidUi {
    constructor() {
        this.currentPollInterval = null;
        this.isScanning = false;
        this.rfidClient = null;
    }

    async init() {
        if (!this.rfidClient && window.app?.api) {
            const { RfidClient } = await import('../services/rfid-client.js');
            this.rfidClient = new RfidClient(window.app.api);
        }
    }

    async load_modal_html() {
        if (document.getElementById('rfidModal')) return;
        try {
            const res = await fetch('/rfid-scan-modal.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (e) {
            const modalHtml = `
        <div class="modal fade" id="rfidModal" tabindex="-1" aria-labelledby="rfidScanModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="rfidScanModalLabel">Scan RFID Tag</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body text-center">
                <div class="rfid-scan-animation">
                  <div class="rfid-scan-icon"><i class="bi bi-broadcast"></i></div>
                </div>
                <h4 class="mt-3">Waiting for RFID Tag</h4>
                <p class="text-muted">Place a tag on the reader</p>
                <div class="rfid-scan-status mt-3">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Scanning...</p>
                </div>
                <div class="rfid-scan-success mt-4" >
                  <i class="bi bi-check-circle-fill text-success fs-1"></i>
                  <p class="mt-2">Done</p>
                </div>
                <div class="rfid-conflict mt-4">
                  <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
                  <h5 class="mt-2">Tag Already Associated</h5>
                  <p class="conflict-message"></p>
                  <div class="btn-group mt-3">
                    <button class="btn btn-secondary" id="scanAnotherBtn">Scan Another</button>
                    <button class="btn btn-warning" id="overrideBtn">Override</button>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }

    stopScanning() {
        console.log('Stopping RFID scanning...');
        this.isScanning = false;
        
        if (this.currentPollInterval) {
            clearInterval(this.currentPollInterval);
            this.currentPollInterval = null;
            console.log('Cleared polling interval');
        }
    }

    async scanTagOnly(onTagScanned = null) {
        await this.init();
        await this.load_modal_html();
        const token = window.authManager?.token;
        if (!token) throw new Error('Authentication required');
        console.log('Starting RFID scan (tag only)...');
        this.stopScanning();
        try {
            await this.rfidClient.clearScanCache();
            console.log('Scan cache cleared');
        } catch (error) {
            console.warn('Failed to clear scan cache:', error);
        }
        const modalEl = document.getElementById('rfidModal');
        if (!modalEl) throw new Error('RFID modal not found');

        const modal = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false
        });
        const statusEl = modalEl.querySelector('.rfid-scan-status');
        const successEl = modalEl.querySelector('.rfid-scan-success');
        const conflictEl = modalEl.querySelector('.rfid-conflict');
        if (statusEl) statusEl.style.display = 'block';
        if (successEl) successEl.style.display = 'none';
        if (conflictEl) conflictEl.style.display = 'none';
        const cleanup = () => {
            console.log('Modal hidden, cleaning up...');
            this.stopScanning();
        };
        modalEl.addEventListener('hidden.bs.modal', cleanup, { once: true });

        modal.show();
        this.isScanning = true;
        let failureCount = 0;
        this.currentPollInterval = setInterval(async () => {
            if (!this.isScanning) {
                console.log('Scanning stopped, clearing interval');
                this.stopScanning();
                return;
            }
            try {
                console.log('Polling for RFID tag...');
                const result = await this.rfidClient.getLatestScan();
                console.log('RFID scan result:', result);
                if (result && result.tagId && result.tagId !== '') {
                    console.log('New RFID tag scanned:', result.tagId);
                    this.stopScanning();
                    if (statusEl) statusEl.style.display = 'none';
                    if (successEl) {
                        successEl.style.display = 'block';
                        successEl.innerHTML = `
                            <i class="bi bi-check-circle-fill text-success fs-1"></i>
                            <p class="mt-2">Tag ${result.tagId} detected!</p>
                        `;
                    }
                    setTimeout(() => {
                        modal.hide();
                        if (onTagScanned) onTagScanned(result.tagId);
                    }, 1500);
                    
                    return;
                }
                failureCount = 0;
                
            } catch (error) {
                console.error('RFID scan error:', error);
                failureCount++;
                if (failureCount >= 5) {
                    console.error('Too many scan failures, stopping');
                    this.stopScanning();
                    modal.hide();
                    return;
                }
            }
        }, 1000);
    }

    async openScanModalAndAssociate(itemId, onSuccess = null) {
        await this.init();
        await this.load_modal_html();
        
        const token = window.authManager?.token;
        if (!token) return;

        console.log('Starting RFID scan and associate for item:', itemId);
        this.stopScanning();
        try {
            await this.rfidClient.clearScanCache();
            await this.rfidClient.setAssociationMode(true);
            console.log('Scan cache cleared and association mode enabled');
        } catch (error) {
            console.warn('Failed to prepare for association:', error);
        }
        const modalEl = document.getElementById('rfidModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl, {
            backdrop: 'static',
            keyboard: false
        });
        const statusEl = modalEl.querySelector('.rfid-scan-status');
        const successEl = modalEl.querySelector('.rfid-scan-success');
        const conflictEl = modalEl.querySelector('.rfid-conflict');
        const conflictMessage = modalEl.querySelector('.conflict-message');
        const scanAnotherBtn = modalEl.querySelector('#scanAnotherBtn');
        const overrideBtn = modalEl.querySelector('#overrideBtn');
        if (statusEl) statusEl.style.display = 'block';
        if (successEl) successEl.style.display = 'none';
        if (conflictEl) conflictEl.style.display = 'none';
        const cleanup = async () => {
            console.log('Modal hidden, cleaning up...');
            this.stopScanning();
            try {
                await this.rfidClient.setAssociationMode(false);
                console.log('Association mode disabled');
            } catch (error) {
                console.warn('Failed to disable association mode:', error);
            }
        };

        modalEl.addEventListener('hidden.bs.modal', cleanup, { once: true });
        modal.show();
        this.isScanning = true;
        let failureCount = 0;
        let currentTagId = null;
        const associateTag = async (tagId, forceOverride = false) => {
            console.log('Attempting to associate tag:', tagId, 'with item:', itemId, 'override:', forceOverride);
            
            try {
                const result = await this.rfidClient.associate_tag(tagId, itemId, forceOverride);
                return { success: true, data: result };
            } catch (error) {
                console.error('Association error:', error);
                return { success: false, error: error.message, data: error.response?.data };
            }
        };
        this.currentPollInterval = setInterval(async () => {
            if (!this.isScanning) {
                console.log('Scanning stopped, clearing interval');
                this.stopScanning();
                return;
            }

            try {
                console.log('Polling for RFID tag (association)...');
                const result = await this.rfidClient.getLatestScan();
                console.log('RFID association scan result:', result);

                if (result && result.tagId && result.tagId !== '') {
                    console.log('RFID tag detected:', result.tagId);
                    currentTagId = result.tagId;
                    this.stopScanning();
                    
                    const { success, data, error } = await associateTag(result.tagId, false);
                    if (success && data.success) {
                        if (statusEl) statusEl.style.display = 'none';
                        if (successEl) {
                            successEl.style.display = 'block';
                            successEl.innerHTML = `
                                <i class="bi bi-check-circle-fill text-success fs-1"></i>
                                <p class="mt-2">Tag ${result.tagId} successfully associated!</p>
                            `;
                        }
                        
                        setTimeout(() => {
                            modal.hide();
                            if (onSuccess) onSuccess(result.tagId);
                        }, 2000);
                        return;
                        
                    } else if (data && data.conflict) {
                        if (statusEl) statusEl.style.display = 'none';
                        if (conflictEl) {
                            conflictEl.style.display = 'block';
                            if (conflictMessage) {
                                conflictMessage.textContent = data.message || 'Tag is already associated with another item';
                            }
                        }

                        const newScanAnotherBtn = scanAnotherBtn?.cloneNode(true);
                        const newOverrideBtn = overrideBtn?.cloneNode(true);
                        
                        if (scanAnotherBtn && newScanAnotherBtn) {
                            scanAnotherBtn.parentNode.replaceChild(newScanAnotherBtn, scanAnotherBtn);
                            newScanAnotherBtn.addEventListener('click', async () => {
                                console.log('Scan another button clicked');
                                if (conflictEl) conflictEl.style.display = 'none';
                                if (statusEl) statusEl.style.display = 'block';
                                currentTagId = null;
                                await this.rfidClient.clearScanCache();
                                this.isScanning = true;
                                this.startPolling();
                            });
                        }
                        
                        if (overrideBtn && newOverrideBtn) {
                            overrideBtn.parentNode.replaceChild(newOverrideBtn, overrideBtn);
                            newOverrideBtn.addEventListener('click', async () => {
                                console.log('Override button clicked');
                                try {
                                    const { success: overrideSuccess, data: overrideData } = await associateTag(currentTagId, true);
                                    
                                    if (overrideSuccess && overrideData.success) {
                                        if (conflictEl) conflictEl.style.display = 'none';
                                        if (successEl) {
                                            successEl.style.display = 'block';
                                            successEl.innerHTML = `
                                                <i class="bi bi-check-circle-fill text-success fs-1"></i>
                                                <p class="mt-2">Tag successfully reassociated!</p>
                                            `;
                                        }
                                        setTimeout(() => {
                                            modal.hide();
                                            if (onSuccess) onSuccess(currentTagId);
                                        }, 2000);
                                    } else {
                                        throw new Error(overrideData?.message || 'Override failed');
                                    }
                                } catch (error) {
                                    console.error('Override error:', error);
                                    if (conflictMessage) {
                                        conflictMessage.textContent = 'Error: ' + error.message;
                                    }
                                }
                            });
                        }
                        
                        return;
                    } else {
                        throw new Error(data?.message || error || 'Association failed');
                    }
                }
                
                failureCount = 0;
            } catch (error) {
                console.error('RFID scan error:', error);
                failureCount++;
                
                if (failureCount >= 5) {
                    if (statusEl) {
                        statusEl.innerHTML = `
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle"></i> 
                                Connection issues. Please check your RFID device and try again.
                            </div>`;
                    }
                    this.stopScanning();
                }
            }
        }, 1000); 
    }

    startPolling() {
        if (this.currentPollInterval) return; 
        
        this.currentPollInterval = setInterval(async () => {
            if (!this.isScanning) {
                this.stopScanning();
                return;
            }
            
            try {
                const result = await this.rfidClient.getLatestScan();
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 1000); 
    }

    async getDeviceStatus() {
        await this.init();
        try {
            const data = await this.rfidClient.devices();
            return data.hasDevice ? data.device : null;
        } catch (error) {
            console.error('Failed to get device status:', error);
            return null;
        }
    }
}
const rfidSetup = new RfidUi();
window.rfidSetup = rfidSetup;