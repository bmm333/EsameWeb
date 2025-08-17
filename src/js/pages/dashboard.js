document.addEventListener('DOMContentLoaded', () => {
  const showDashboard = async () => {
    if (!window.authManager) {
      setTimeout(showDashboard, 100);
      return;
    }

    // Simple one-time auth check
    if (!window.authManager.isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }

    // Validate token and get fresh user data
    try {
      const isValid = await window.authManager.validateToken();
      if (!isValid) {
        window.location.href = '/login.html';
        return;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      window.location.href = '/login.html';
      return;
    }

    // Show dashboard
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('contentWrapper').style.display = 'block';
    
    // Fill user info with fresh data
    const user = window.authManager.user || {};
    document.getElementById('userGreeting').textContent = user.firstName || 'User';
    
    // Set profile picture if available
    const userAvatar = document.getElementById('userAvatar');
    if (user.profilePicture && user.profilePicture !== 'null') {
      userAvatar.src = user.profilePicture;
      userAvatar.alt = `${user.firstName || 'User'}'s profile picture`;
    } else {
      // Fallback to initials
      const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`.toUpperCase();
      userAvatar.src = `https://placehold.co/32x32/f9fafb/6366f1?text=${encodeURIComponent(initials)}`;
    }

    // Setup logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.authManager.logout();
      });
    }
  };

  showDashboard();
});