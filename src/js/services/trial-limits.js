export class TrialLimits {
    static async checkItemLimit(api) {
        try {
            const profile = await api.get('/auth/profile');
            const user = profile.user;

            if (user.subscriptionTier !== 'trial') {
                return { allowed: true };
            }

            const itemsUsed = user.trialItemsUsed || 0;
            const itemsLimit = 3;

            if (itemsUsed >= itemsLimit) {
                return {
                    allowed: false,
                    message: `Trial limit reached! You can only add ${itemsLimit} items during your trial.`,
                    upgrade: true
                };
            }

            return {
                allowed: true,
                warning: itemsUsed >= itemsLimit - 1 ? `You have ${itemsLimit - itemsUsed} item slots remaining in your trial.` : null
            };
        } catch (error) {
            console.error('Error checking item limit:', error);
            return { allowed: true };
        }
    }

    static async checkOutfitLimit(api) {
        try {
            const profile = await api.get('/auth/profile');
            const user = profile.user;

            if (user.subscriptionTier !== 'trial') {
                return { allowed: true };
            }

            const outfitsUsed = user.trialOutfitsUsed || 0;
            const outfitsLimit = 1;

            if (outfitsUsed >= outfitsLimit) {
                return {
                    allowed: false,
                    message: `Trial limit reached! You can only create ${outfitsLimit} outfit during your trial.`,
                    upgrade: true
                };
            }

            return { allowed: true };
        } catch (error) {
            console.error('Error checking outfit limit:', error);
            return { allowed: true };
        }
    }

    static showLimitModal(message, showUpgrade = false) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="modal fade" id="limitModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-info-circle text-warning me-2"></i>
                                Trial Limit Reached
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                            ${showUpgrade ? `
                                <div class="alert alert-info">
                                    <strong>Want to continue?</strong><br>
                                    Upgrade to get unlimited access to all Smart Wardrobe features!
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>
                            ${showUpgrade ? `
                                <button type="button" class="btn btn-primary" onclick="window.location.href='/dashboard'">
                                    Upgrade Now
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal.querySelector('.modal'));
        bootstrapModal.show();
        modal.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }
}