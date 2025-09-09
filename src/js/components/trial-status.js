export class TrialStatus {
    constructor(container) {
        this.container = container;
        this.api = window.app.api;
    }
    async render() {
        try {
            const profile = await this.api.get('/auth/profile');
            const user = profile.user;

            if (user.subscriptionTier !== 'trial') {
                this.container.innerHTML = '';
                return;
            }

            const daysRemaining = Math.max(0, Math.ceil((new Date(user.trialExpires) - new Date()) / (1000 * 60 * 60 * 24)));
            const isExpired = daysRemaining === 0;

            this.container.innerHTML = `
                <div class="trial-status-banner ${isExpired ? 'expired' : ''}">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="trial-info">
                                    ${isExpired ? `
                                        <div class="trial-expired">
                                            <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                                            <strong>Trial Expired</strong>
                                            <span class="ms-2">Upgrade to continue using Smart Wardrobe</span>
                                        </div>
                                    ` : `
                                        <div class="trial-active">
                                            <i class="bi bi-clock-fill text-info me-2"></i>
                                            <strong>Trial Active:</strong>
                                            <span class="ms-2">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining</span>
                                        </div>
                                    `}
                                    <div class="trial-usage mt-1">
                                        <small class="text-muted">
                                            Items: ${user.trialItemsUsed || 0}/3 • 
                                            Outfits: ${user.trialOutfitsUsed || 0}/1
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <button class="btn btn-sm btn-primary" onclick="this.showUpgradeModal()">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering trial status:', error);
        }
    }

    showUpgradeModal() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal fade" id="upgradeModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Upgrade Your Account</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="upgrade-options">
                                <div class="upgrade-option">
                                    <h6>Full Smart Wardrobe Access</h6>
                                    <ul>
                                        <li>Unlimited wardrobe items</li>
                                        <li>Unlimited outfits</li>
                                        <li>RFID device setup</li>
                                        <li>Advanced recommendations</li>
                                        <li>Priority support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Maybe Later</button>
                            <button type="button" class="btn btn-primary">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal.querySelector('.modal'));
        bootstrapModal.show();
    }
}