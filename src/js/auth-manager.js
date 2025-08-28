export class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    
    this.baseURL = window.location.hostname === 'localhost' ? 
      'http://localhost:3002' : 
      'http://localhost:3002';
    
    this.isValidating = false;
    this.isNavigating = false; 
    this.guardSetup = false;

    setTimeout(() => {
      this.setupNavigationGuard();
    }, 100);
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) caches.delete(name);
      });
    }
  }
  async validateTokenSync() {
    if (this.isValidating || this.isNavigating) return;
    this.isValidating = true;

    try {
      const isValid = await this.validateToken();
      if (!isValid) {
        this.clearAuth();
        if (this.isProtectedPage() && !this.isNavigating) {
          this.isNavigating = true;
          window.location.href = '/login.html';
        }
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearAuth();
      if (this.isProtectedPage() && !this.isNavigating) {
        this.isNavigating = true;
        window.location.href = '/login.html';
      }
    } finally {
      this.isValidating = false;
    }
  }

  async validateToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.user) {
          this.user = {
            id: data.user.id || data.user.userId,
            email: data.user.email,
            firstName: data.user.firstName || 'User',
            lastName: data.user.lastName || '',
            profileSetupCompleted: data.user.profileSetupCompleted,
            profilePicture: data.user.profilePicture 
          };
          localStorage.setItem('user', JSON.stringify(this.user));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  async verifyEmail(token) {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.message || 'Email verification failed'
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async resendVerificationEmail(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to resend verification email'
        };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async setupProfile(profileData) {
    try {
      console.log('AuthManager: Setting up profile with data:', profileData);
      
      const response = await fetch(`${this.baseURL}/user/profile/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user data
        this.user = { ...this.user, ...data.user, profileSetupCompleted: true };
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return {
          success: true,
          message: data.message || 'Profile setup completed successfully',
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to setup profile'
        };
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async getProfileSetupStatus() {
    try {
      if (!this.token) {
        return { profileSetupCompleted: false, needsProfileSetup: true };
      }

      const response = await fetch(`${this.baseURL}/user/profile/setup-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to get profile setup status');
        return { profileSetupCompleted: false, needsProfileSetup: true };
      }
    } catch (error) {
      console.error('Profile setup status error:', error);
      return { profileSetupCompleted: false, needsProfileSetup: true };
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        this.isNavigating = false;
        
        return {
          success: true,
          user: this.user,
          needsProfileSetup: data.needsProfileSetup
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async register(userData) {
    try {
      console.log('Registering with baseURL:', this.baseURL);
      
      const response = await fetch(`${this.baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          error: `Server error: ${response.status} ${response.statusText}`
        };
      }

      if (response.ok && data.statusCode === 201) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check if the server is running on port 3001.' 
      };
    }
  }

  async logout() {
    if (this.token) {
      try {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    
    this.clearAuth();
    this.isNavigating = true;
    window.location.replace('/login.html?t=' + Date.now());
  }

  isAuthenticated() {
    return this.token && this.user && !this.isValidating;
  }

  isProtectedPage() {
    const protectedPages = ['/dashboard.html', '/wardrobe.html', '/outfit.html', '/onboarding.html'];
    const currentPath = window.location.pathname;
    return protectedPages.some(page => currentPath.includes(page));
  }

  async checkPageAccess() {
    if (this.isNavigating) return; // Prevent navigation loops
    
    const currentPath = window.location.pathname;
    const isProtected = this.isProtectedPage();
    
    console.log('AuthManager: Checking page access for:', currentPath);
    console.log('AuthManager: Is protected page:', isProtected);
    console.log('AuthManager: Is authenticated:', this.isAuthenticated());

    // If on login/signup page and already authenticated, redirect to appropriate page
    if (this.isAuthenticated() && (currentPath.includes('/login.html') || currentPath.includes('/signup.html'))) {
      try {
        const status = await this.getProfileSetupStatus();
        this.isNavigating = true;
        if (status.needsProfileSetup) {
          window.location.href = '/onboarding.html';
        } else {
          window.location.href = '/dashboard.html';
        }
        return;
      } catch (error) {
        console.error('Error checking profile status:', error);
      }
    }

    // If protected page and not authenticated, redirect to login
    if (isProtected && !this.isAuthenticated()) {
      console.log('AuthManager: Redirecting to login - not authenticated');
      this.isNavigating = true;
      window.location.href = '/login.html';
      return;
    }

    // If authenticated and on protected page, check profile setup
    if (this.isAuthenticated() && isProtected) {
      try {
        // Validate token first
        const isValid = await this.validateToken();
        if (!isValid) {
          this.isNavigating = true;
          window.location.href = '/login.html';
          return;
        }

        // Check profile setup status
        const status = await this.getProfileSetupStatus();
        console.log('AuthManager: Profile setup status:', status);
        
        if (status.needsProfileSetup && currentPath !== '/onboarding.html') {
          console.log('AuthManager: Redirecting to onboarding - profile setup needed');
          this.isNavigating = true;
          window.location.href = '/onboarding.html';
          return;
        }
        
        if (!status.needsProfileSetup && currentPath === '/onboarding.html') {
          console.log('AuthManager: Redirecting to dashboard - profile already complete');
          this.isNavigating = true;
          window.location.href = '/dashboard.html';
          return;
        }
      } catch (error) {
        console.error('AuthManager: Token validation failed:', error);
        this.clearAuth();
        this.isNavigating = true;
        window.location.href = '/login.html';
      }
    }
  }

  setupNavigationGuard() {
    // Only set up guard once
    if (this.guardSetup) return;
    this.guardSetup = true;

    // Check authentication on hash change
    window.addEventListener('hashchange', () => {
      setTimeout(() => this.checkPageAccess(), 100);
    });

    // Reduced frequency of validation checks
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.isAuthenticated() && !this.isValidating) {
        setTimeout(() => this.validateTokenSync(), 500);
      }
    });

    window.addEventListener('focus', async () => {
      if (this.isAuthenticated() && !this.isValidating) {
        setTimeout(() => this.validateTokenSync(), 500);
      }
    });

    // Add cache control headers for protected pages
    if (this.isProtectedPage()) {
      const metaNoCache = document.createElement('meta');
      metaNoCache.httpEquiv = 'Cache-Control';
      metaNoCache.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(metaNoCache);

      const metaPragma = document.createElement('meta');
      metaPragma.httpEquiv = 'Pragma';
      metaPragma.content = 'no-cache';
      document.head.appendChild(metaPragma);

      const metaExpires = document.createElement('meta');
      metaExpires.httpEquiv = 'Expires';
      metaExpires.content = '0';
      document.head.appendChild(metaExpires);
    }
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.replace('/login.html');
      return false;
    }
    return true;
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }
}