export class TrialCounter {
    static async renderTrialInfo() {
        try {
            const profile = await window.app.api.get('/auth/profile');
            const user = profile.user;

            if (user.subscriptionTier !== 'trial') {
                return '';
            }

            const itemsUsed = user.trialItemsUsed || 0;
            const itemsLeft = Math.max(0, 3 - itemsUsed);
            const isExpired = user.trialExpires && new Date() > new Date(user.trialExpires);
            
            if (isExpired) {
                return `
                    <div class="alert alert-danger mb-3">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Trial Expired!</strong> Upgrade to continue adding items.
                    </div>
                `;
            }

            const alertType = itemsLeft === 0 ? 'warning' : 'info';
            
            return `
                <div class="alert alert-${alertType} mb-3">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <strong>Trial:</strong> ${itemsLeft} item uploads remaining
                    ${itemsLeft === 0 ? ' - <a href="#" onclick="alert(\'Contact us to upgrade!\')">Upgrade now</a>' : ''}
                </div>
            `;
        } catch (error) {
            console.error('Error rendering trial info:', error);
            return '';
        }
    }
}