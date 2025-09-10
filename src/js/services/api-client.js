import { API_BASE_URL } from '../config/api-config.js';

export class ApiClient {
    constructor(tokenProvider) {
        this.baseUrl = API_BASE_URL;
        this.tokenProvider = tokenProvider;
        this.defaultHeaders = {};
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    getToken() {
        return this.tokenProvider ? this.tokenProvider() : localStorage.getItem('token');
    }

    setToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    async request(method, url, data = null) {
        const token = this.getToken();
        const fullUrl = this.baseUrl + url;
        
        console.log(`API Request: ${method} ${fullUrl}`);
        if (data) console.log('Request data:', data);
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this.defaultHeaders
            }
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            let response = await fetch(fullUrl, config);
            
            // ✅ Handle 401 with automatic token refresh
            if (response.status === 401 && !url.includes('/auth/')) {
                console.log('API: 401 detected, attempting token refresh');
                
                if (!this.isRefreshing) {
                    this.isRefreshing = true;
                    this.refreshPromise = this.handleTokenRefresh();
                }
                
                try {
                    await this.refreshPromise;
                    
                    // Retry original request with new token
                    const newToken = this.getToken();
                    if (newToken) {
                        config.headers.Authorization = `Bearer ${newToken}`;
                        response = await fetch(fullUrl, config);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed, redirecting to login');
                    window.location.href = '/login';
                    throw new Error('Session expired');
                } finally {
                    this.isRefreshing = false;
                    this.refreshPromise = null;
                }
            }
            
            console.log(`API Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                let errorMessage = `${response.status} ${response.statusText}`;
                
                try {
                    const errorBody = await response.text();
                    console.error('Error response body:', errorBody);
                    
                    if (errorBody) {
                        try {
                            const errorJson = JSON.parse(errorBody);
                            errorMessage = errorJson.message || errorJson.error || errorMessage;
                        } catch (e) {
                            errorMessage = errorBody;
                        }
                    }
                } catch (e) {
                    console.error('Could not read error response body:', e);
                }
                
                throw new Error(errorMessage);
            }

            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (!responseText) return null;
            
            try {
                const result = JSON.parse(responseText);
                console.log('Parsed response:', result);
                return result;
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                return responseText;
            }
        } catch (error) {
            console.error(`API request failed: ${method} ${url}`, error.message);
            throw error;
        }
    }
    async handleTokenRefresh() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(this.baseUrl + '/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        return data.accessToken;
    }

    async get(url) {
        return this.request('GET', url);
    }

    async post(url, data) {
        return this.request('POST', url, data);
    }

    async put(url, data) {
        return this.request('PUT', url, data);
    }

    async patch(url, data) {
        return this.request('PATCH', url, data);
    }

    async delete(url) {
        return this.request('DELETE', url);
    }
}