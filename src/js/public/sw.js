self.addEventListener('push', function(event) {
    console.log('Push received:', event);

    let notificationData = {};
    
    if (event.data) {
        notificationData = event.data.json();
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/icons/icon-192x192.png',
        badge: notificationData.badge || '/icons/badge-72x72.png',
        data: notificationData.data,
        actions: notificationData.actions || [],
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    console.log('Notification click received:', event);

    event.notification.close();

    if (event.action === 'view' || event.action === 'view_outfit') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
    // 'dismiss' action will just clsoe the notificaiton
});