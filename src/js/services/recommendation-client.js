export class RecommendationClient {
    constructor(api) {
        this.api = api;
    }
    async getRecommendations(filters = {}) {
        const params = new URLSearchParams();
        if (filters.occasion) {
            params.append('occasion', filters.occasion);
        }
        if (filters.weather) {
            params.append('weather', filters.weather);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }
        const url = `/recommendation${params.toString() ? `?${params.toString()}` : ''}`;
        return await this.api.get(url);
    }
    async generateRecommendations(preferences = {}) {
        return await this.api.post('/recommendation/generate', preferences);
    }
    async saveRecommendation(recommendationData) {
        return await this.api.post('/recommendation', recommendationData);
    }
    async getRecommendationHistory() {
        return await this.api.get('/recommendation/history');
    }
    async markAsWorn(recommendationId) {
        return await this.api.put(`/recommendation/${recommendationId}/worn`);
    }
    async deleteRecommendation(recommendationId) {
        return await this.api.delete(`/recommendation/${recommendationId}`);
    }
    async rejectRecommendation(recommendationId, reason = null) {
        return await this.api.put(`/recommendation/${recommendationId}/reject`, { reason });
    }
}