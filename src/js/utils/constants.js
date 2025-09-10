export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

export const LOCAL_STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'smart-wardrobe-theme',
    USER_PREFERENCES: 'user-preferences',
    DRAFT_OUTFIT: 'draft-outfit'
};

export const EVENTS = {
    USER_LOGGED_IN: 'user:logged-in',
    USER_LOGGED_OUT: 'user:logged-out',
    PROFILE_UPDATED: 'user:profile-updated',
    ITEM_ADDED: 'item:added',
    ITEM_UPDATED: 'item:updated',
    ITEM_DELETED: 'item:deleted',
    OUTFIT_CREATED: 'outfit:created',
    THEME_CHANGED: 'theme:changed'
};

export const CSS_CLASSES = {
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    HIDDEN: 'd-none',
    ACTIVE: 'active'
};

export const ANIMATIONS = {
    FADE_DURATION: 300,
    SLIDE_DURATION: 400,
    BOUNCE_DURATION: 600
};