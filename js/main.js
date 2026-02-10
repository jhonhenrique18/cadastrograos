/* ================================================
   GRÃOS S.A. - LANDING PAGE JS
   Webhook form, animations, counters
   ================================================ */

// ---- CONFIGURATION ----
// Change this to your webhook URL (Make, Zapier, n8n, custom API, etc.)
const WEBHOOK_URL = 'https://hook.us1.make.com/inkz32f2u99o4admj7k3j794621gtn98';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCounters();
  initRevealAnimations();
  initFormHandling();
  initNavbarScroll();
  initCatalogModal();
  initFloatingCta();
  initScrollTracking();
});

/* ---------- Particle Background ---------- */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  const count = window.innerWidth < 768 ? 8 : 30;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.width = particle.style.height = (Math.random() * 3 + 2) + 'px';
    
    const colors = [
      'rgba(74,124,47,0.3)',
      'rgba(232,200,64,0.2)',
      'rgba(107,142,58,0.25)',
      'rgba(245,166,35,0.15)'
    ];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(particle);
  }
}

/* ---------- Animated Counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    
    el.textContent = current.toLocaleString('es-PY');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('es-PY');
    }
  }
  
  requestAnimationFrame(update);
}

/* ---------- Reveal Animations (Scroll) ---------- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll(
    '.product-card, .benefit-card, .secondary-card, .section-header, .cta-text, .cta-form, .catalog-card'
  );
  
  if (!reveals.length) return;
  
  reveals.forEach(el => el.classList.add('reveal'));
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 50, 400); // Cap stagger at 400ms max
        
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
}

/* ---------- Form Handling (Webhook) ---------- */
function initFormHandling() {
  const forms = document.querySelectorAll('.lead-form');
  
  forms.forEach(form => {
    // Phone mask
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
      input.addEventListener('input', handlePhoneMask);
      input.addEventListener('focus', () => {
        if (!input.value) input.value = '0';
      });
    });
    
    // Form submission via webhook
    form.addEventListener('submit', handleFormSubmit);
  });
}

function handlePhoneMask(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  if (value.length > 11) {
    value = value.slice(0, 11);
  }
  
  // Format: 0XXX XXX XXX
  if (value.length > 7) {
    value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
  } else if (value.length > 4) {
    value = value.slice(0, 4) + ' ' + value.slice(4);
  }
  
  e.target.value = value;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  
  // Get form data
  const nombre = form.querySelector('[name="nombre"]').value.trim();
  const whatsapp = form.querySelector('[name="whatsapp"]').value.trim();
  const ciudad = form.querySelector('[name="ciudad"]').value.trim();
  const tipoNegocio = form.querySelector('[name="tipo_negocio"]').value;
  
  // Validate phone
  const phoneDigits = whatsapp.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    const phoneInput = form.querySelector('input[type="tel"]');
    phoneInput.style.borderColor = '#E53935';
    phoneInput.focus();
    
    const originalPlaceholder = phoneInput.placeholder;
    phoneInput.placeholder = 'Número incompleto...';
    phoneInput.value = '';
    
    setTimeout(() => {
      phoneInput.style.borderColor = '';
      phoneInput.placeholder = originalPlaceholder;
    }, 2000);
    return;
  }
  
  // Validate required fields
  if (!nombre || !ciudad || !tipoNegocio) {
    return;
  }
  
  // Show loading
  if (btnText && btnLoading) {
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
  }
  submitBtn.disabled = true;
  
  // Date and time separated
  const now = new Date();
  const fecha = now.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  
  // Capture UTMs from URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source') || '';
  const utmMedium = urlParams.get('utm_medium') || '';
  const utmCampaign = urlParams.get('utm_campaign') || '';
  const utmContent = urlParams.get('utm_content') || '';
  const utmTerm = urlParams.get('utm_term') || '';
  const fbclid = urlParams.get('fbclid') || '';
  
  // Prepare form data (Make.com parses each field separately)
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('whatsapp', whatsapp);
  formData.append('ciudad', ciudad);
  formData.append('tipo_negocio', tipoNegocio);
  formData.append('fecha', fecha);
  formData.append('hora', hora);
  formData.append('utm_source', utmSource);
  formData.append('utm_medium', utmMedium);
  formData.append('utm_campaign', utmCampaign);
  formData.append('utm_content', utmContent);
  formData.append('utm_term', utmTerm);
  formData.append('fbclid', fbclid);
  formData.append('origen', 'Landing Page Grãos S.A.');
  
  // Send to webhook
  try {
    if (WEBHOOK_URL && WEBHOOK_URL !== 'YOUR_WEBHOOK_URL_HERE') {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
    }
  } catch (error) {
    // Don't block the user if webhook fails
    console.warn('Webhook error:', error);
  }
  
  // Always redirect to thank you page with name
  const encodedName = encodeURIComponent(nombre.split(' ')[0]);
  window.location.href = '/gracias?nombre=' + encodedName;
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(10,10,10,0.95)';
      navbar.style.borderBottomColor = 'rgba(74,124,47,0.15)';
    } else {
      navbar.style.background = 'rgba(10,10,10,0.85)';
      navbar.style.borderBottomColor = 'rgba(255,255,255,0.06)';
    }
  }, { passive: true });
}

/* ---------- Catalog Modal (Desktop only) ---------- */
function initCatalogModal() {
  const modal = document.getElementById('catalogModal');
  if (!modal) return;
  
  const catalogBtns = document.querySelectorAll('.catalog-btn');
  const closeBtn = document.getElementById('closeCatalog');
  const isMobile = window.innerWidth < 768;
  
  catalogBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  
  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Floating CTA Button (appears after scrolling past hero form, hides near 2nd form) ---------- */
function initFloatingCta() {
  const floatingCta = document.getElementById('floatingCta');
  const heroForm = document.getElementById('registro');
  const ctaSection = document.getElementById('contacto');
  if (!floatingCta || !heroForm) return;
  
  let heroVisible = true;
  let ctaVisible = false;
  
  function updateVisibility() {
    if (heroVisible || ctaVisible) {
      floatingCta.style.display = 'none';
      floatingCta.classList.add('hidden-cta');
    } else {
      floatingCta.style.display = 'block';
      floatingCta.classList.remove('hidden-cta');
    }
  }
  
  // Watch hero form
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      heroVisible = entry.isIntersecting;
      updateVisibility();
    });
  }, { threshold: 0.1 });
  heroObserver.observe(heroForm);
  
  // Watch CTA section (second form) - hide floating CTA when user can see the 2nd form
  if (ctaSection) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        ctaVisible = entry.isIntersecting;
        updateVisibility();
      });
    }, { threshold: 0.1 });
    ctaObserver.observe(ctaSection);
  }
}

/* ---------- Scroll Depth Tracking (Meta Pixel) ---------- */
function initScrollTracking() {
  const thresholds = [25, 50, 75, 100];
  const tracked = new Set();
  
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    const scrollPercent = Math.round((window.pageYOffset / scrollHeight) * 100);
    
    thresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !tracked.has(threshold)) {
        tracked.add(threshold);
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'ScrollDepth', {
            percent: threshold
          });
        }
      }
    });
  }, { passive: true });
}

/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
      
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  });
});
