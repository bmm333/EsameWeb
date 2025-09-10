export function render() {
  return `
    <div id="landing-page" data-landing class="landing-root">
      <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
          <a href="/" data-landing-nav class="navbar-brand">Smart Wardrobe</a>
          
          <!-- Mobile Menu Button -->
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi bi-list fs-4"></i>
          </button>
          
          <!-- Collapsible Menu -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <div class="navbar-nav ms-auto d-flex align-items-center">
              <button id="themeSwitcherLanding" class="btn btn-link text-decoration-none nav-link me-2" type="button" aria-label="Toggle theme">
                <i class="bi bi-sun-fill theme-icon-light" aria-hidden="true"></i>
                <i class="bi bi-moon-fill theme-icon-dark d-none" aria-hidden="true"></i>
              </button>
              <a href="/login" data-landing-nav class="btn btn-outline-primary btn-sm me-2">Login</a>
              <a href="/signup" data-landing-nav class="btn btn-primary btn-sm">Sign Up</a>
            </div>
          </div>
        </div>
      </nav>

      <section class="hero-section" id="home">
        <div class="container">
          <div class="row align-items-center min-vh-100 py-5 py-md-0">
            <div class="col-lg-6 py-5 py-lg-0">
              <h1 class="display-4 fw-bold mb-4">Revolutionize Your Wardrobe Experience</h1>
              <p class="lead mb-4">Smart Wardrobe uses RFID technology and AI to transform how you organize, track and select your clothing. Get personalized recommendations and insights about your wardrobe habits.</p>
              <div class="d-flex flex-column flex-sm-row gap-3">
                <a href="/signup" data-landing-nav class="btn btn-primary btn-lg">Get Started</a>
                <a href="/signup?trial=true" data-landing-nav class="btn btn-outline-primary btn-lg">Try free for 7 Days</a>
              </div>
            </div>
            <div class="col-lg-6 mt-5 mt-lg-0">
              <div class="hero-image-container">
                <img src="./src/static/SWA.png" alt="Smart Wardrobe assistant" class="hero-image">
                <div class="floating-element floating-element-1">
                  <i class="bi bi-lightning-charge-fill"></i>
                  <span>Smart Recommendations</span>
                </div>
                <div class="floating-element floating-element-2">
                  <i class="bi bi-tag-fill"></i>
                  <span>RFID Tracking</span>
                </div>
                <div class="floating-element floating-element-3">
                  <i class="bi bi-graph-up"></i>
                  <span>Usage Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials-section py-5" id="testimonials">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="h1 fw-bold mb-3">What Our Users Say</h2>
            <p class="lead text-muted">Discover how Smart Wardrobe has transformed the way people manage their clothing</p>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="testimonial-card">
                <div class="testimonial-content">
                  <i class="bi bi-quote fs-1 text-primary opacity-25"></i>
                  <p class="mb-4">Smart Wardrobe changed how I pick outfits. RFID tracking is effortless and recommendations are spot-on!</p>
                </div>
                <div class="testimonial-author">
                  <div class="testimonial-author-avatar">
                    <img src="https://placehold.co/100x100/f9fafb/6366f1?text=S" alt="Sarah">
                  </div>
                  <div class="testimonial-author-info">
                    <h5 class="mb-0">Sarah Johnson</h5>
                    <p class="testimonial-author-title">Marketing Executive</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="testimonial-card">
                <div class="testimonial-content">
                  <i class="bi bi-quote fs-1 text-primary opacity-25"></i>
                  <p class="mb-4">Traveling is easier. I can plan outfits ahead and never forget essentials.</p>
                </div>
                <div class="testimonial-author">
                  <div class="testimonial-author-avatar">
                    <img src="https://placehold.co/100x100/f9fafb/6366f1?text=M" alt="Michael">
                  </div>
                  <div class="testimonial-author-info">
                    <h5 class="mb-0">Michael Chen</h5>
                    <p class="testimonial-author-title">Consultant</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="testimonial-card">
                <div class="testimonial-content">
                  <i class="bi bi-quote fs-1 text-primary opacity-25"></i>
                  <p class="mb-4">Analytics helped me see what I never wore. Now my wardrobe is intentional.</p>
                </div>
                <div class="testimonial-author">
                  <div class="testimonial-author-avatar">
                    <img src="https://placehold.co/100x100/f9fafb/6366f1?text=A" alt="Aisha">
                  </div>
                  <div class="testimonial-author-info">
                    <h5 class="mb-0">Aisha Patel</h5>
                    <p class="testimonial-author-title">UX Designer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer py-4">
        <div class="container">
          <div class="row">
            <div class="col-md-6 text-center text-md-start">
              <p class="mb-0">&copy; <span id="currentYear"></span> Smart Wardrobe. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="mb-0 text-muted">Designed for a stylish future</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;
}

export function init() {
  document.body.classList.add('landing-active');
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  document.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').replace('#','');
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-landing-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      if (window.app?.router) {
        window.app.router.navigate(a.getAttribute('href'));
      } else {
        window.location.href = a.getAttribute('href');
      }
    });
  });
}