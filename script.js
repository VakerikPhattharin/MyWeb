/* ============================================================
   CK CHEONG BIOGRAPHY — script.js
   Theme Toggle · Navigation · Scroll FX · Active Links
   ============================================================ */

'use strict';

/* ── Helpers ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. THEME TOGGLE (Light / Dark)
   ============================================================ */
const THEME_KEY = 'ck-bio-theme';

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || null;
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}
function initTheme() {
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
    return;
  }
  // Use system preference as default
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function setupThemeToggle() {
  const btn = $('#themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Sync when OS preference changes (if user hasn't set manually)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ============================================================
   2. NAVBAR — Sticky shadow + mobile menu
   ============================================================ */
function setupNavbar() {
  const navbar   = $('#navbar');
  const toggle   = $('#navToggle');
  const menu     = $('#navMenu');
  if (!navbar) return;

  // Scroll shadow
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-label', isOpen ? 'ปิดเมนู' : 'เปิดเมนู');
    });

    // Close on link click
    $$('.nav-link', menu).forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
  }
}

/* ============================================================
   3. ACTIVE NAV LINK — IntersectionObserver
   ============================================================ */
function setupActiveLinks() {
  const sections = $$('section[id]');
  const links    = $$('.nav-link');
  if (!sections.length || !links.length) return;

  const map = {};
  links.forEach((l) => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) map[href.slice(1)] = l;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          const link = map[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    },
    {
      rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '64')}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ============================================================
   4. SCROLL-REVEAL ANIMATIONS
   ============================================================ */
function setupScrollReveal() {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = $$(
    '.tl-content, .work-card, .award-card, .quote-card, .fact-card, ' +
    '.ref-card, .media-card, .gallery-item, .profile-card, .profile-details, ' +
    '.bio-chapter, .legacy-block'
  );

  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 6) * 0.06}s, transform 0.5s ease ${(i % 6) * 0.06}s`;
  });

  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => reveal.observe(el));
}

/* ============================================================
   5. GALLERY LIGHTBOX (simple)
   ============================================================ */
function setupGallery() {
  const items = $$('.gallery-item');
  if (!items.length) return;

  // Create lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.style.cssText = `
    display: none; position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.92); align-items: center; justify-content: center;
    cursor: zoom-out;
  `;
  const img = document.createElement('img');
  img.style.cssText = `
    max-width: 90vw; max-height: 88vh; border-radius: 8px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6); object-fit: contain;
  `;
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'ปิด');
  closeBtn.style.cssText = `
    position: absolute; top: 1.25rem; right: 1.5rem;
    background: none; border: none; color: #fff; font-size: 1.75rem;
    cursor: pointer; opacity: 0.7; transition: opacity 0.2s;
  `;
  closeBtn.addEventListener('mouseover', () => { closeBtn.style.opacity = '1'; });
  closeBtn.addEventListener('mouseout',  () => { closeBtn.style.opacity = '0.7'; });
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    if (!src) return;
    img.src = src;
    img.alt = alt || '';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    img.src = '';
  }

  items.forEach((item) => {
    const galleryImg = item.querySelector('img');
    if (!galleryImg || galleryImg.style.display === 'none') return;
    item.addEventListener('click', () => openLightbox(galleryImg.src, galleryImg.alt));
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === closeBtn) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

/* ============================================================
   6. BACK TO TOP — show/hide based on scroll
   ============================================================ */
function setupBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const toggle = () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
  };
  btn.style.transition = 'opacity 0.3s, background 0.25s, color 0.25s, border-color 0.25s';
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/* ============================================================
   7. SMOOTH SCROLL for internal anchors (polyfill for Firefox)
   ============================================================ */
function setupSmoothScroll() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '64'
      );
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth',
      });
    });
  });
}

/* ============================================================
   8. YEAR DISPLAY (keeps footer/header dynamic year correct)
   ============================================================ */
function setupYear() {
  $$('.js-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupThemeToggle();
  setupNavbar();
  setupActiveLinks();
  setupScrollReveal();
  setupGallery();
  setupBackToTop();
  setupSmoothScroll();
  setupYear();

  console.log('%c CK Cheong Biography ', 'background:#1C4ED8;color:#fff;font-weight:700;padding:4px 12px;border-radius:4px;', '— Loaded ✓');
});