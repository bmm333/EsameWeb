class PushService {
    constructor() {
        this.swRegistration = null;
        this.isSubscribed = false;
        this.applicationServerKey = 'BMD0DPZue1qes53ZKRgeGo0ABFFdaitzytSQi9xjLt3Xctf58RUldi1f-rVA4xfkzRXo1LRc5QNu1Dyr7BxhEPI'; 
    }

    async initialize() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', this.swRegistration);
                
                await this.updateSubscriptionOnServer();
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.warn('Push messaging is not supported');
        }
    }

    async subscribeUser() {
        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.applicationServerKey)
            });

            console.log('User is subscribed:', subscription);

            await this.updateSubscriptionOnServer(subscription);
            this.isSubscribed = true;
            
            return { success: true, subscription };
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
            return { success: false, error: error.message };
        }
    }

    async updateSubscriptionOnServer(subscription = null) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            if (subscription) {
                const response = await fetch('/api/notifications/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(subscription)
                });

                if (!response.ok) {
                    throw new Error('Failed to update subscription on server');
                }
            }
        } catch (error) {
            console.error('Error updating subscription on server:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
window.PushService = PushService;