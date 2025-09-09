export class ItemsClient {
    constructor(api) {
        this.api = api;
    }

    async list() {
        return await this.api.get('/item');
    }

    async create(itemData) {
        return await this.api.post('/item', itemData);
    }
    
    async update(itemId, itemData) {
        return await this.api.put(`/item/${itemId}`, itemData);
    }

    async get(itemId) {
        return await this.api.get(`/item/${itemId}`);
    }

    async delete(itemId) {
        return await this.api.delete(`/item/${itemId}`);
    }

    async toggle_favorite(itemId, isFavorite) {
        return await this.api.put(`/item/${itemId}/favorite`, { favorite: isFavorite });
    }

    async getAvailability(itemId) {
        return await this.api.get(`/item/${itemId}/availability`);
    }

    async associate_tag_to_item(tagId, itemId, forceOverride = false) {
        return await this.api.post(`/rfid/tags/${tagId}/associate`, {
            itemId,
            forceOverride
        });
    }
}