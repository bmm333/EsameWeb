import { APP_CONFIG } from '../config/app-config.js';

export function validateRequired(value, fieldName = 'Field') {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} is required`;
    }
    return null;
}

export function validateEmail(email) {
    if (!email) return 'Email is required';
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

export function validatePassword(password) {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
}

export function validatePasswordConfirm(password, confirmPassword) {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
}

export function validatePhoneNumber(phone) {
    if (!phone) return null; // Optional field
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
        return 'Phone number must be 10 digits';
    }
    return null;
}

export function validateFile(file) {
    if (!file) return 'File is required';
    
    const { MAX_SIZE, ACCEPTED_TYPES } = APP_CONFIG.UPLOAD;
    
    if (file.size > MAX_SIZE) {
        return `File size must be less than ${Math.round(MAX_SIZE / 1024 / 1024)}MB`;
    }
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return `File type must be one of: ${ACCEPTED_TYPES.map(t => t.split('/')[1]).join(', ')}`;
    }
    
    return null;
}

export function validateItemName(name) {
    const error = validateRequired(name, 'Item name');
    if (error) return error;
    
    if (name.length > 100) return 'Item name must be less than 100 characters';
    return null;
}

export function validateCategory(category) {
    return validateRequired(category, 'Category');
}

export function validateOutfitName(name) {
    const error = validateRequired(name, 'Outfit name');
    if (error) return error;
    
    if (name.length > 100) return 'Outfit name must be less than 100 characters';
    return null;
}

export function validateForm(data, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        const value = data[field];
        
        if (rule.required) {
            const error = validateRequired(value, rule.label || field);
            if (error) {
                errors[field] = error;
                return;
            }
        }
        
        if (rule.type === 'email') {
            const error = validateEmail(value);
            if (error) errors[field] = error;
        }
        
        if (rule.type === 'password') {
            const error = validatePassword(value);
            if (error) errors[field] = error;
        }
        
        if (rule.type === 'phone') {
            const error = validatePhoneNumber(value);
            if (error) errors[field] = error;
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
        }
        
        if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field] = `${rule.label || field} must be less than ${rule.maxLength} characters`;
        }
        
        if (rule.custom && typeof rule.custom === 'function') {
            const error = rule.custom(value, data);
            if (error) errors[field] = error;
        }
    });
    
    return Object.keys(errors).length > 0 ? errors : null;
}