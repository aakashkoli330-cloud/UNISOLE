/* ==========================================================
   UNISOLE — ANIMATIONS.JS
   Scroll Reveal · 3D Tilt · Button Effects
   ========================================================== */

(() => {
  "use strict";
  console.log("animations.js loaded");

  /* ── Scroll Reveal System ── */
  function initScrollReveal() {
    const reveals = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger",
    );

    if (!reveals.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -80px 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach((el) => observer.observe(el));
  }

  /* ── 3D Tilt Effect for Product Cards ── */
  function initTiltEffect() {
    const tiltCards = document.querySelectorAll(".product-card[data-tilt]");

    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
      });

      card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
        setTimeout(() => (card.style.transition = ""), 100);
      });
    });
  }

  /* ── Button Ripple Effect ── */
  function initRippleEffect() {
    const rippleButtons = document.querySelectorAll(
      ".ripple, .btn-animate, button, .hero-btn, .btn-primary, .btn-secondary",
    );

    rippleButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        this.style.position = "relative";
        this.style.overflow = "hidden";
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /* ── Magnetic Button Effect ── */
  function initMagneticEffect() {
    const magneticBtns = document.querySelectorAll(".btn-magnetic, .hero-btn");

    magneticBtns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ── Hero Text Animation ── */
  function initHeroTextAnimation() {
    const heroTitle = document.querySelector(".hero-content h1");
    if (!heroTitle) return;

    const text = heroTitle.textContent;
    heroTitle.innerHTML = "";

    const words = text.split(" ");
    words.forEach((word, i) => {
      const span = document.createElement("span");
      span.className = "hero-title-word";
      span.textContent = word;
      span.style.animationDelay = `${i * 0.15 + 0.3}s`;
      heroTitle.appendChild(span);
      if (i < words.length - 1)
        heroTitle.appendChild(document.createTextNode(" "));
    });
  }

  /* ── Parallax Effect for Hero ── */
  function initParallax() {
    const hero = document.querySelector(".gradient-hero");
    const heroContent = document.querySelector(".hero-content");

    if (!hero || !heroContent) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight) {
          heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
          heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
        }
      },
      { passive: true },
    );
  }

  /* ── Stagger Animation for Grid Items ── */
  function initStaggerAnimation() {
    const grids = document.querySelectorAll(
      ".products-grid, .products-container",
    );

    grids.forEach((grid) => {
      const cards = grid.querySelectorAll(".product-card");
      cards.forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";
        card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;

        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, 100);
      });
    });
  }

  /* ── Floating Elements ── */
  function initFloatingElements() {
    const floats = document.querySelectorAll(".float, .float-slow");

    floats.forEach((el, i) => {
      el.style.animationDelay = `${(i % 3) * -2}s`;
    });
  }

  /* ── Counter Animation ── */
  function initCounterAnimation() {
    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateCounter();
          observer.disconnect();
        }
      });

      observer.observe(counter);
    });
  }

  /* ── Image Lazy Load Animation ── */
  function initLazyLoadAnimation() {
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  /* ── Smooth Scroll for Anchor Links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ── Page Load Animation ── */
  function initPageLoadAnimation() {
    document.body.classList.add("loaded");

    window.addEventListener("load", () => {
      document.body.classList.add("page-loaded");

      const loader = document.querySelector(".page-loader");
      if (loader) {
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 500);
      }
    });
  }

  /* ── Cursor Trail Effect (Desktop Only) ── */
  function initCursorTrail() {
    if (window.innerWidth < 768) return;

    const trail = document.createElement("div");
    trail.className = "cursor-trail";
    trail.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--yellow);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(trail);

    let mouseX = 0,
      mouseY = 0;
    let trailX = 0,
      trailY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      trail.style.opacity = "0.6";
    });

    document.addEventListener("mouseleave", () => {
      trail.style.opacity = "0";
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.left = trailX + "px";
      trail.style.top = trailY + "px";
      requestAnimationFrame(animateTrail);
    }

    animateTrail();
  }

  /* ── Initialize All Animations ── */
  function init() {
    initScrollReveal();
    initTiltEffect();
    initRippleEffect();
    initMagneticEffect();
    initHeroTextAnimation();
    initParallax();
    initStaggerAnimation();
    initFloatingElements();
    initCounterAnimation();
    initLazyLoadAnimation();
    initSmoothScroll();
    initPageLoadAnimation();
    initCursorTrail();
  }

  /* ── Run on DOM Ready ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ── Reinitialize on route changes (for SPAs) ── */
  window.addEventListener("popstate", () => {
    setTimeout(init, 100);
  });
})();
