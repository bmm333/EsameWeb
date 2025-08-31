self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
    console.log('Push received:', event);

    let notificationData = {};
    
    if (event.data) {
        notificationData = event.data.json();
    }

    const options = {
        body: notificationData.body || 'You have a new notification',
        icon: notificationData.icon || '/icons/icon-192x192.png',
        badge: notificationData.badge || '/icons/badge-72x72.png',
        data: notificationData.data || {},
        actions: notificationData.actions || [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200],
        tag: notificationData.tag || 'smart-wardrobe-notification'
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title || 'Smart Wardrobe', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('Notification click received:', event);

    event.notification.close();

    const action = event.action || 'view';
    const data = event.notification.data || {};

    if (action === 'view' || action === 'view_outfit') {
        const url = data.url || '/dashboard.html';
        event.waitUntil(
            clients.openWindow(url)
        );
    } else if (action === 'dismiss') {
        // Just close the notification
        console.log('Notification dismissed');
    }

    // Send message to client about the action
    event.waitUntil(
        clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'notification_action',
                    action: action,
                    data: data
                });
            });
        })
    );
});

self.addEventListener('notificationclose', function(event) {
    console.log('Notification closed:', event);
});

// Handle background sync for offline actions
self.addEventListener('sync', function(event) {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'outfit-worn-sync') {
        event.waitUntil(syncOutfitWorn());
    }
});

async function syncOutfitWorn() {
    // Implementation for syncing outfit worn data when back online
    console.log('Syncing outfit worn data...');
}