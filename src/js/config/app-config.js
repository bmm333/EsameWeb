export const APP_CONFIG = {
    NAME: 'Smart Wardrobe',
    VERSION: '1.0.0',
    ENVIRONMENT: 'development',
    TRIAL_LIMITS: {
        ITEMS: 3,
        OUTFITS: 1,
        DURATION_DAYS: 30
    },
    UI: {
        THEME_STORAGE_KEY: 'smart-wardrobe-theme',
        DEFAULT_THEME: 'light',
        ITEMS_PER_PAGE: 12,
        AUTO_SAVE_DELAY: 1000
    },
    UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        QUALITY: 0.8
    },
    RFID: {
        SCAN_TIMEOUT: 10000,
        AUTO_RETRY: true,
        MAX_RETRIES: 3
    },
    ROUTES: {
        LANDING: '/',
        LOGIN: '/login',
        SIGNUP: '/signup',
        DASHBOARD: '/dashboard',
        WARDROBE: '/wardrobe',
        OUTFITS: '/outfit',
        SETTINGS: '/settings',
        DEVICE_SETUP: '/device-setup'
    }
};
export const SUPPORTED_CATEGORIES = [
    'tops',
    'bottoms', 
    'dresses',
    'shoes',
    'accessories',
    'outerwear'
];
export const SUPPORTED_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#A52A2A' }
];