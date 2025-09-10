export class RfidClient {
    constructor(api) {
        this.api = api;
    }

    async getLatestScan() {
        return this.api.get('/rfid/scan');
    }

    async clearScanCache() {
        return this.api.post('/rfid/scan/clear');
    }

    async setAssociationMode(active) {
        return this.api.post('/rfid/association-mode', { active });
    }

    async associate_tag(tagId, itemId, forceOverride = false) {
        return this.api.post(`/rfid/tags/${tagId}/associate`, {
            itemId,
            forceOverride
        });
    }

    async devices() {
        return this.api.get('/rfid/devices');
    }

    async tags() {
        return this.api.get('/rfid/tags');
    }

    async generate_device_key(deviceName) {
        return this.api.post('/rfid/device/generate-key', { deviceName });
    }
}