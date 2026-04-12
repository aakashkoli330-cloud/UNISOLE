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
      ".ripple, .btn-animate, .hero-btn, .btn-primary, .btn-secondary, .checkout-btn, .empty-btn, .auth-box button[type='submit']",
    );

    rippleButtons.forEach((btn) => {
      if (btn.closest(".qty-controls") || btn.classList.contains("qty-btn"))
        return;

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
    // Disabled - using CSS animation instead
    // const heroTitle = document.querySelector(".hero-content h1");
    // if (!heroTitle) return;
    // const text = heroTitle.textContent;
    // heroTitle.innerHTML = "";
    // const words = text.split(" ");
    // words.forEach((word, i) => {
    //   const span = document.createElement("span");
    //   span.className = "hero-title-word";
    //   span.textContent = word;
    //   span.style.animationDelay = `${i * 0.15 + 0.3}s`;
    //   heroTitle.appendChild(span);
    //   if (i < words.length - 1)
    //     heroTitle.appendChild(document.createTextNode(" "));
    // });
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

  /* ── Custom Cursor (Disabled - using default) ── */
  function initCustomCursor() {
    // Using default browser cursor
  }

  /* ── Page Loader & Progress Bar ── */
  function initPageLoader() {
    document.body.classList.add("page-transition");

    const loader = document.createElement("div");
    loader.className = "page-loader";
    document.body.prepend(loader);

    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 300);
      }, 500);
    });
  }

  /* ── Particles Background ── */
  function initParticles() {
    const container = document.querySelector(".particles-container");
    if (!container) return;

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 15 + "s";
      particle.style.animationDuration = 15 + Math.random() * 10 + "s";
      particle.style.width = 2 + Math.random() * 4 + "px";
      particle.style.height = particle.style.width;
      particle.style.opacity = 0.1 + Math.random() * 0.3;
      container.appendChild(particle);
    }
  }

  /* ── Parallax Effect ── */
  function initParallaxScroll() {
    document.documentElement.style.setProperty("--scroll", window.scrollY);

    window.addEventListener(
      "scroll",
      () => {
        document.documentElement.style.setProperty("--scroll", window.scrollY);
      },
      { passive: true },
    );
  }

  /* ── Typewriter Effect ── */
  function initTypewriter() {
    const elements = document.querySelectorAll("[data-typewriter]");
    elements.forEach((el) => {
      const text = el.textContent;
      el.textContent = "";
      el.style.borderRight = "2px solid var(--yellow)";
      el.style.whiteSpace = "nowrap";
      el.style.overflow = "hidden";
      el.style.width = "0";

      setTimeout(() => {
        el.style.animation = `typing 2s steps(${text.length}) forwards, blink 0.7s step-end infinite`;
        el.style.width = text.length + "ch";
        el.textContent = text;
      }, 500);
    });
  }

  /* ── Count-up Animation ── */
  function initCountUp() {
    const counters = document.querySelectorAll("[data-count-up]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.countUp);
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function update(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(start + (target - start) * eased);

              el.textContent = current.toLocaleString();

              if (progress < 1) {
                requestAnimationFrame(update);
              }
            }

            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ── Cart Fly-to Animation ── */
  function initCartFlyTo() {
    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".btn-cart, .add-cart-btn");
      if (!addBtn) return;

      const img = addBtn
        .closest(".product-card, .product-page")
        ?.querySelector(".product-img img, .product-image img");
      if (!img) return;

      const cartBtn = document.querySelector(".cart-btn");
      if (!cartBtn) return;

      const imgRect = img.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();

      const flyingImg = document.createElement("img");
      flyingImg.src = img.src;
      flyingImg.className = "fly-to-cart";
      flyingImg.style.left = imgRect.left + "px";
      flyingImg.style.top = imgRect.top + "px";
      document.body.appendChild(flyingImg);

      const deltaX =
        cartRect.left + cartRect.width / 2 - imgRect.left - imgRect.width / 2;
      const deltaY =
        cartRect.top + cartRect.height / 2 - imgRect.top - imgRect.height / 2;

      flyingImg.animate(
        [
          {
            transform: "scale(1)",
            left: imgRect.left + "px",
            top: imgRect.top + "px",
          },
          {
            transform: "scale(0.3)",
            left: imgRect.left + deltaX + "px",
            top: imgRect.top + deltaY + "px",
            opacity: 0,
          },
        ],
        {
          duration: 600,
          easing: "cubic-bezier(0.2, 1, 0.3, 1)",
        },
      ).onfinish = () => {
        flyingImg.remove();
        cartBtn.classList.add("bounce-animation");
        setTimeout(() => cartBtn.classList.remove("bounce-animation"), 500);
      };
    });
  }

  /* ── Shake Form on Error ── */
  window.shakeElement = function (el) {
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (el) {
      el.classList.add("shake");
      setTimeout(() => el.classList.remove("shake"), 500);
    }
  };

  /* ── Success Animation ── */
  window.showSuccessAnimation = function (targetEl) {
    const success = document.createElement("div");
    success.className = "success-checkmark";
    success.innerHTML = '<i class="fas fa-check"></i>';
    success.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999;";

    document.body.appendChild(success);

    setTimeout(() => {
      success.style.transition = "opacity 0.3s ease";
      success.style.opacity = "0";
      setTimeout(() => success.remove(), 300);
    }, 1500);
  };

  /* ── Lightbox ── */
  function initLightbox() {
    document.addEventListener("click", (e) => {
      const img = e.target.closest(
        ".lightbox-trigger, .product-img img, .product-image img",
      );
      if (!img) return;

      const lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.innerHTML = `
        <button class="lightbox-close">&times;</button>
        <img src="${img.src}" alt="${img.alt || ""}" class="lightbox-content">
      `;

      document.body.appendChild(lightbox);
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => lightbox.classList.add("active"));

      const close = () => {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
        setTimeout(() => lightbox.remove(), 300);
      };

      lightbox
        .querySelector(".lightbox-close")
        .addEventListener("click", close);
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) close();
      });

      document.addEventListener("keydown", function escHandler(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", escHandler);
        }
      });
    });
  }

  /* ── Blur-to-Sharp Reveal ── */
  function initBlurReveal() {
    const blurElements = document.querySelectorAll(".blur-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 },
    );

    blurElements.forEach((el) => observer.observe(el));
  }

  /* ── Page Transitions ── */
  function initPageTransitions() {
    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      if (link.target === "_blank") return;

      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.add("page-exit");

        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      });
    });
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
    initCustomCursor();
    initPageLoader();
    initParticles();
    initParallaxScroll();
    initTypewriter();
    initCountUp();
    initCartFlyTo();
    initLightbox();
    initBlurReveal();
    initPageTransitions();
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
