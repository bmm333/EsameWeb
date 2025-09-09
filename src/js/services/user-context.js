export class UserContext {
    constructor(api) {
        this.api = api;
        this.user = null;
    }

    async load() {
        try {
            const token = window.authManager.getToken();
            if (!token) {
                return;
            }
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.sub;
            if (!userId) {
                throw new Error('Invalid user ID in token');
            }
            const profile = await this.api.get(`/user/${userId}`);
            this.user = profile;
            this.onProfileLoaded?.(this.user);
        } catch (error) {
            console.error('Failed to load user profile:', error.message);
            this.user = null;
            if (window.toast) {
                window.toast.show('Failed to load profile. Please try again.', 'error');
            }
        }
    }
    get() {
        return this.user || window.authManager?.user || null;
    }
    update(userData) {
        if (this.user) {
            this.user = { ...this.user, ...userData };
        }
    }
    clear() {
        this.user = null;
    }
}