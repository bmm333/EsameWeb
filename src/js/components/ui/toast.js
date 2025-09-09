class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }
    
    init() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        this.container = container;
    }
    
    show(message, type = 'info', duration = 5000) {
        const id = `toast-${Date.now()}`;
        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        
        const bgMap = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-primary'
        };
        
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header ${bgMap[type]} text-white">
                <i class="bi ${iconMap[type]} me-2"></i>
                <strong class="me-auto">${this.getTitle(type)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        this.container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            delay: duration,
            autohide: duration > 0
        });
        
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
        
        return bsToast;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    clear() {
        this.container.innerHTML = '';
    }
}
const toast = new ToastManager();
export { toast, ToastManager };
window.toast = toast;