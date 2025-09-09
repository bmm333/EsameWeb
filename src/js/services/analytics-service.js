export class AnalyticsClient {
    constructor(api) {
        this.api = api;
    }

    async getBasicStats() {
        try {
            const response = await this.api.get('/analytics/basic-stats');
            return response;
        } catch (error) {
            console.error('Failed to get basic stats:', error);
            throw error;
        }
    }

    async getAnalytics() {
        try {
            const response = await this.api.get('/analytics');
            return response;
        } catch (error) {
            console.error('Failed to get analytics:', error);
            throw error;
        }
    }

    async getRarelyUsedItems() {
        try {
            const response = await this.api.get('/analytics/rarely-used');
            return response;
        } catch (error) {
            console.error('Failed to get rarely used items:', error);
            throw error;
        }
    }

    async trackOutfitWorn(itemIds, location = 'unknown') {
        try {
            const response = await this.api.post('/analytics/outfit-worn', {
                itemIds,
                location,
                timestamp: new Date().toISOString(),
                wornAt: new Date().toISOString()
            });
            return response;
        } catch (error) {
            console.error('Failed to track outfit worn:', error);
            throw error;
        }
    }

    async trackItemScanned(itemId, location, action = 'scanned') {
        try {
            const response = await this.api.post('/analytics/item-interaction', {
                itemId,
                location,
                action,
                timestamp: new Date().toISOString()
            });
            return response;
        } catch (error) {
            console.error('Failed to track item scanned:', error);
            throw error;
        }
    }
}