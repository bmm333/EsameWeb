export class OutfitClient {
    constructor(api) {
        this.api = api;
    }

    async create(outfitData) {
        try {
            console.log('Creating outfit with data:', outfitData);
            const payload = {
                name: outfitData.name,
                occasion: outfitData.occasion || null,
                notes: outfitData.notes || null,
                itemIds: outfitData.itemIds || []
            };
            
            console.log('Sending payload:', payload);
            const response = await this.api.post('/outfit', payload);
            console.log('Outfit created successfully:', response);
            return response;
        } catch (error) {
            console.error('OutfitClient.create error:', error);
            throw error;
        }
    }

    async list(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.occasion) params.append('occasion', filters.occasion);
            if (filters.season) params.append('season', filters.season);
            if (filters.favorite) params.append('favorite', 'true');
            if (filters.search) params.append('search', filters.search);
            
            const queryString = params.toString();
            const url = queryString ? `/outfit?${queryString}` : '/outfit';
            
            return await this.api.get(url);
        } catch (error) {
            console.error('OutfitClient.list error:', error);
            throw error;
        }
    }

    async getById(id) {
        return await this.api.get(`/outfit/${id}`);
    }

    async update(id, updateData) {
        return await this.api.put(`/outfit/${id}`, updateData);
    }

    async remove(id) {
        return await this.api.delete(`/outfit/${id}`);
    }

    async toggleFavorite(id, isFavorite) {
        return await this.api.patch(`/outfit/${id}/favorite`, { isFavorite });
    }

    async markWorn(id) {
        return await this.api.patch(`/outfit/${id}/worn`, { wornAt: new Date().toISOString() });
    }
}