/* ============================================================
   frontend/js/enhancements.js  — FIXED
   FIX: Was injecting a new hamburger even when one already exists in HTML
        (all pages already have <div class="hamburger"> hardcoded)
        Now only wires up the existing hamburger, never creates a duplicate.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavbar();
    setupHamburger();
    setupScrollReveal();
  }

  /* ── Navbar: add .scrolled class on scroll ── */
  function setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 24);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger menu ── */
  function setupHamburger() {
    const navContainer = document.querySelector('.nav-container');
    const navLinks     = document.querySelector('.nav-links');
    if (!navContainer || !navLinks) return;

    // FIX: Use the existing hamburger from HTML — NEVER create a new one
    const hamburger = navContainer.querySelector('.hamburger');
    if (!hamburger) return; // no hamburger in this page, skip

    const toggle = () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow =
        navLinks.classList.contains('open') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggle);

    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    // Close when a nav link is clicked
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close when clicking outside the navbar
    document.addEventListener('click', (e) => {
      if (!navContainer.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Scroll reveal via IntersectionObserver ── */
  function setupScrollReveal() {
    const selectors = [
      '.product-card',
      '.cart-item',
      '.order-item',
      '.checkout-form',
      '.order-summary',
      '.cart-summary',
      '.profile-card',
      '.profile-form',
      '.auth-box',
    ];

    const els = document.querySelectorAll(selectors.join(', '));
    if (!els.length) return;

    els.forEach((el, i) => {
      if (!el.classList.contains('sr')) {
        el.classList.add('sr');
        el.style.transitionDelay = (i % 4) * 80 + 'ms';
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    els.forEach((el) => observer.observe(el));
  }

})();
