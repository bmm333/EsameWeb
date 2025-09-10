export const API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup',
        VERIFY: '/auth/verify',
        LOGOUT: '/auth/logout'
    },
    USER: {
        PROFILE: '/user',
        UPDATE: '/user/profile'
    },
    ITEM: {
        LIST: '/item',
        CREATE: '/item',
        ASSOCIATE: '/item/associate',
        FAVORITE: '/item/:id/favorite',
        DELETE: '/item/:id'
    },
    OUTFIT: {
        LIST: '/outfit',
        CREATE: '/outfit',
        DELETE: '/outfit/:id',
        FAVORITE: '/outfit/:id/favorite',
        WORN: '/outfit/:id/worn'
    },
    DASHBOARD: '/dashboard',
    WEATHER: '/weather/current',
    MEDIA: {
        UPLOAD: '/media/upload/item'
    },
    RFID: {
        DEVICES: '/rfid/devices',
        SCAN: '/rfid/scan',
        ASSOCIATE: '/rfid/associate'
    }
};

export const REQUEST_TIMEOUT = 30000;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB