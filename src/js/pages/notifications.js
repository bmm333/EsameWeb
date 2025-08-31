class NotificationsManager {
    constructor() {
        this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3001'
            : '';
        this.notifications = [];
        this.init();
    }

    async init() {
        if (!window.authManager?.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        await this.loadNotifications();
        this.bindEvents();
        this.render();
    }

    async loadNotifications() {
        try {
            const token = window.authManager?.token;
            const res = await fetch(`${this.API_BASE}/notification`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.notifications = await res.json();
        } catch (err) {
            console.error('Failed to load notifications:', err);
            this.showError('Failed to load notifications');
        }
    }

    render() {
        const list = document.getElementById('notificationsList');
        if (!list) return;

        if (!this.notifications.length) {
            list.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-bell-slash fs-1 text-muted mb-3"></i>
          <h5>No notifications</h5>
          <p class="text-muted">You're all caught up</p>
        </div>
      `;
            return;
        }

        list.innerHTML = this.notifications.map(n => `
      <div class="list-group-item d-flex justify-content-between align-items-start ${n.readAt ? '' : 'bg-light'}" data-id="${n.id}">
        <div class="ms-2 me-auto">
          <div class="fw-bold">${n.title || this.formatType(n.type)}</div>
          <div class="small text-muted">${this.formatDate(n.createdAt)}</div>
          <div>${n.message || ''}</div>
          ${n.data?.outfitId ? `<button class="btn btn-sm btn-outline-primary mt-2" data-action="view-outfit" data-outfit-id="${n.data.outfitId}">
            <i class="bi bi-eye me-1"></i>View outfit
          </button>` : ''}
        </div>
        <div class="btn-group btn-group-sm">
          ${n.readAt ? '' : `<button class="btn btn-outline-success" data-action="mark-read">Mark read</button>`}
          <button class="btn btn-outline-danger" data-action="delete">Delete</button>
        </div>
      </div>
    `).join('');
    }

    bindEvents() {
        document.getElementById('refreshNotifications')?.addEventListener('click', async () => {
            await this.loadNotifications();
            this.render();
        });

        document.getElementById('markAllRead')?.addEventListener('click', async () => {
            try {
                const token = window.authManager?.token;
                const res = await fetch(`${this.API_BASE}/notification/mark-all-read`, {
                    method: 'POST',
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) throw new Error('Failed');
                await this.loadNotifications();
                this.render();
            } catch (error) {
                this.showError('Failed to mark all as read',error);
            }
        });

        document.getElementById('notificationsList')?.addEventListener('click', async (e) => {
            const item = e.target.closest('.list-group-item');
            if (!item) return;
            const id = item.dataset.id;

            if (e.target.matches('[data-action="mark-read"]')) {
                await this.markRead(id);
            }
            if (e.target.matches('[data-action="delete"]')) {
                await this.delete(id);
            }
            if (e.target.matches('[data-action="view-outfit"]')) {
                const outfitId = e.target.dataset.outfitId;
                window.location.href = `/outfit.html?id=${outfitId}`;
            }
        });
    }

    async markRead(id) {
        try {
            const token = window.authManager?.token;
            const res = await fetch(`${this.API_BASE}/notification/${id}/read`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed');
            await this.loadNotifications();
            this.render();
        } catch {
            this.showError('Failed to mark as read');
        }
    }

    async delete(id) {
        try {
            const token = window.authManager?.token;
            const res = await fetch(`${this.API_BASE}/notification/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed');
            this.notifications = this.notifications.filter(n => n.id != id);
            this.render();
        } catch {
            this.showError('Failed to delete notification');
        }
    }

    formatType(type) {
        const map = {
            outfit_suggestion: 'Outfit suggestion',
            schedule_reminder: 'Schedule reminder',
            rfid_alert: 'RFID alert'
        };
        return map[type] || 'Notification';
    }

    formatDate(d) {
        try {
            const date = new Date(d);
            return date.toLocaleString();
        } catch {
            return '';
        }
    }

    showError(message) {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.notificationsManager = new NotificationsManager();
});