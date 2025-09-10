export class MediaClient {
    constructor(api) {
        this.api = api;
    }
        async upload_item_image(file, options = {}) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'items');
            formData.append('removeBackground', 'true');
            if (options.itemId) formData.append('itemId', options.itemId);
    
            const baseURL = this.api.baseURL || this.api.baseUrl || this.api.base || window.app?.config?.apiBase || 'http://192.168.1.7:3001';
            const url = `${baseURL.replace(/\/+$/,'')}/media/upload/item`;
            const token = this.api.getToken?.();
    
            const headers = {};
            if (token) headers.Authorization = `Bearer ${token}`;
    
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData
            });
    
            const text = await response.text();
            const raw = text || '';
            const lower = raw.toLowerCase();
    
            if (lower.startsWith('<!doctype') || lower.includes('<html')) {
                throw new Error('Upload endpoint returned HTML (likely redirect or auth issue).');
            }
    
            const xssiStrip = raw.replace(/^\)\]\}',?\n?/, '').trim();
            let parsed = null;
    
            try {
                if (response.headers.get('content-type')?.includes('application/json') || xssiStrip.startsWith('{') || xssiStrip.startsWith('[')) {
                    parsed = JSON.parse(xssiStrip);
                }
            } catch (e) {
                parsed = null;
            }
    
            if (!parsed) {
                const trimmed = xssiStrip.trim();
                if (/^https?:\/\/\S+$/i.test(trimmed)) {
                    parsed = { url: trimmed };
                } else {
                    const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
                    if (urlMatch) parsed = { url: urlMatch[0] };
                }
            }
    
            if (!parsed) {
                const jsonMatch = raw.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try { parsed = JSON.parse(jsonMatch[0]); } catch (e) { parsed = null; }
                }
            }
    
            const body = parsed || {};
            body._raw = raw;
            const deducedUrl = body.url || body.secure_url || (body.media && body.media.url) || (body.data && body.data.url) || body.location || body.path || null;
    
            const result = { ok: response.ok, status: response.status, url: deducedUrl, body };
    
            if (!response.ok) {
                const msg = body?.message || body?.error || `HTTP ${response.status}`;
                const err = new Error(msg);
                err.response = result;
                throw err;
            }
    
            return result;
        }
   
    async delete_media(mediaId) {
        return this.api.del(`/media/${mediaId}`);
    }

    async get_user_media(folder = null) {
        const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
        return this.api.get(`/media${query}`);
    }
}