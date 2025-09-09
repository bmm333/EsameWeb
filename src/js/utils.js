export const Utils = {
    /**
     * Format date to locale string
     */
    formatDate: (date, options = {}) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        });
    },

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime: (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return Utils.formatDate(date);
    },

    /**
     * Debounce function calls
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Generate random ID
     */
    generateId: () => Math.random().toString(36).substr(2, 9),

    /**
     * Capitalize first letter
     */
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),

    /**
     * Safe JSON parse
     */
    safeJsonParse: (str, fallback = null) => {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    },

    /**
     * Show notification
     */
    showNotification: (message, type = 'info') => {
        console.log(`1 1 1 1${type.toUpperCase()}: ${message}`);
    }
};

export default Utils;