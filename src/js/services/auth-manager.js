import { ApiClient } from './api-client.js';

export class AuthManager {
    constructor() {
        this.api = new ApiClient(() => this.token);
        this.user = null;
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
        console.log('AuthManager initialized');
    }

    async login(credentials) {
        try {
            const res = await this.api.post('/auth/signin', credentials);
            this.token = res.accessToken || res.token;
            this.refreshToken = res.refreshToken;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('refreshToken', this.refreshToken); 
            this.api.setToken(this.token);
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            this.user = { 
                id: payload.sub, 
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                trial: payload.trial || false
            };
            
            console.log('Login successful');
            return res;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('AuthManager: Attempting token refresh');
            
            const response = await fetch(`${this.api.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            const data = await response.json();
            this.token = data.accessToken;
            this.refreshToken = data.refreshToken;
            localStorage.setItem('token', this.token);
            localStorage.setItem('refreshToken', this.refreshToken);
            this.api.setToken(this.token);
            
            console.log('AuthManager: Token refresh successful');
            return this.token;

        } catch (error) {
            console.error('AuthManager: Token refresh failed:', error);
            this.clearAuth();
            throw error;
        }
    }
async signup(signupData) {
    const { email, password, firstName, lastName } = signupData;

    if (!email || !password || !firstName || !lastName) {
        throw new BadRequestException('All fields are required');
    }
    
    const normalizedPassword = password.trim();
    console.log('Signup - Normalized password length:', normalizedPassword.length);
    
    if (!normalizedPassword) {
        throw new BadRequestException('Password cannot be empty');
    }
    
    try {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }
        
        const passwordValidation = this.validatePasswordStrength(normalizedPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(passwordValidation.message);
        }
        
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + 1); 
        const trialExpires = new Date(now);
        trialExpires.setDate(trialExpires.getDate() + 30);
        
        const userData = {
            email,
            password: normalizedPassword,
            firstName,
            lastName,
            verificationToken,
            verificationTokenExpires: expires,
            passwordChangedAt: now,
            trial: true,
            trialExpires,
            provider: 'local'
        };
        
        const savedUser = await this.userService.createUser(userData);
        
        try {
            await this.mailingService.sendVerificationEmail(savedUser, verificationToken);
            console.log('Verification mail sent successfully');
        } catch (error) {
            console.error('Failed to send verification email:', error);
        }
        
        const { password: _, ...userResponse } = savedUser;
        return {
            statusCode: 201,
            message: 'User registered successfully. Please check your email for verification.',
            user: userResponse
        };
    } catch (error) {
        console.error('AuthService signup error:', error);
        
        if (error instanceof BadRequestException) {
            throw error;
        }
        
        throw new BadRequestException('Registration failed. Please try again.');
    }
}
    

    async logout() {
        try {
            if (this.token) {
                await this.api.post('/auth/logout', { 
                    refreshToken: this.refreshToken 
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    isAuthenticated() {
        return !!this.token && this.isTokenValid();
    }

    isTokenValid() {
        if (!this.token) return false;
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }

    getToken() {
        return this.token;
    }

    getCurrentUser() {
        return this.user;
    }

    clearAuth() {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.api.setToken(null);
        // Navigate to landing page
        const landingContent = document.getElementById('landing-content');
        const appRoot = document.getElementById('app-root');
        if (landingContent) landingContent.style.display = 'block';
        if (appRoot) appRoot.style.display = 'none';
        
        history.pushState({}, '', '/');
        console.log('Authentication cleared');
    }

    async validateToken() {
        if (!this.isAuthenticated()) {
            if (this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (error) {
                    console.error('Token refresh failed during validation:', error);
                    return false;
                }
            }
            return false;
        }
        try {
            await this.api.get('/auth/verify');
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            if (error.message.includes('401') && this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    this.clearAuth();
                    return false;
                }
            }
            
            this.clearAuth();
            return false;
        }
    }
}