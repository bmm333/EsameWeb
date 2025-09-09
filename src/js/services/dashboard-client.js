export class DashboardClient {
    constructor(api) {
        this.api = api;
    }

    async getStats() {
        try {
            return await this.api.get('/dashboard/stats');
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return {
                totalItems: 0,
                totalOutfits: 0,
                availableItems: 0,
                wornItems: 0
            };
        }
    }

    async getTodaysOutfit() {
        try {
            return await this.api.get('/dashboard/outfit');
        } catch (error) {
            console.error('Dashboard outfit error:', error);
            return {
                hasOutfit: false,
                message: 'Outfit suggestions temporarily unavailable'
            };
        }
    }

    async getRecentActivity() {
        try {
            return await this.api.get('/dashboard/activity');
        } catch (error) {
            console.error('Dashboard activity error:', error);
            return [];
        }
    }
}