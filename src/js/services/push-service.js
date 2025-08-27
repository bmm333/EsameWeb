class PushService {
    constructor() {
        this.swRegistration = null;
        this.isSubscribed = false;
        this.applicationServerKey = 'BMD0DPZue1qes53ZKRgeGo0ABFFdaitzytSQi9xjLt3Xctf58RUldi1f-rVA4xfkzRXo1LRc5QNu1Dyr7BxhEPI'; 
        this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
          ? 'http://localhost:3001' 
          : '';
    }

    async initialize() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', this.swRegistration);
                
                // Check existing subscription
                const existingSubscription = await this.swRegistration.pushManager.getSubscription();
                if (existingSubscription) {
                    this.isSubscribed = true;
                    await this.updateSubscriptionOnServer(existingSubscription);
                }
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'notification_action') {
                        this.handleNotificationAction(event.data);
                    }
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.warn('Push messaging is not supported');
        }
    }

    async subscribeUser() {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

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

            const endpoint = subscription ? '/notifications/push/subscribe' : '/notifications/push/unsubscribe';
            const method = subscription ? 'POST' : 'DELETE';

            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: subscription ? JSON.stringify(subscription) : null
            });

            if (!response.ok) {
                throw new Error(`Failed to update subscription on server: ${response.status}`);
            }

            console.log('Subscription updated on server');
        } catch (error) {
            console.error('Error updating subscription on server:', error);
        }
    }

    async unsubscribeUser() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await this.updateSubscriptionOnServer(null);
                this.isSubscribed = false;
                console.log('User unsubscribed from push notifications');
                return { success: true };
            }
        } catch (error) {
            console.error('Failed to unsubscribe user:', error);
            return { success: false, error: error.message };
        }
    }

    handleNotificationAction(data) {
        console.log('Handling notification action:', data);
        // Handle custom notification actions here
        if (data.action === 'view_outfit' && data.outfitId) {
            window.location.href = `/outfit.html?id=${data.outfitId}`;
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

    // Check if notifications are supported and enabled
    isSupported() {
        return ('serviceWorker' in navigator && 
                'PushManager' in window && 
                'Notification' in window);
    }

    // Get current subscription status
    async getSubscriptionStatus() {
        if (!this.swRegistration) return false;
        
        const subscription = await this.swRegistration.pushManager.getSubscription();
        return !!subscription;
    }
}

window.PushService = PushService;