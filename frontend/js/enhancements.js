/* ============================================================
   frontend/js/enhancements.js  — FIXED
   FIX: Was injecting a new hamburger even when one already exists in HTML
        (all pages already have <div class="hamburger"> hardcoded)
        Now only wires up the existing hamburger, never creates a duplicate.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupNavbar();
    setupHamburger();
    setupScrollReveal();
  }

  /* ── Navbar: add .scrolled class on scroll ── */
  function setupNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 24);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger menu ── */
  function setupHamburger() {
    const navContainer = document.querySelector(".nav-container");
    const navCenter = document.querySelector(".nav-center");
    if (!navContainer || !navCenter) return;

    const hamburger = navContainer.querySelector(".hamburger");
    if (!hamburger) return;

    const toggle = () => {
      hamburger.classList.toggle("open");
      navCenter.classList.toggle("open");
      document.body.style.overflow = navCenter.classList.contains("open")
        ? "hidden"
        : "";
    };

    hamburger.addEventListener("click", toggle);

    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    navCenter.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navCenter.classList.remove("open");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("click", (e) => {
      if (!navContainer.contains(e.target)) {
        hamburger.classList.remove("open");
        navCenter.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  }

  /* ── Scroll reveal via IntersectionObserver ── */
  function setupScrollReveal() {
    const selectors = [
      ".product-card",
      ".cart-item",
      ".order-item",
      ".checkout-form",
      ".order-summary",
      ".cart-summary",
      ".profile-card",
      ".profile-form",
      ".auth-box",
    ];

    const els = document.querySelectorAll(selectors.join(", "));
    if (!els.length) return;

    els.forEach((el, i) => {
      if (!el.classList.contains("sr")) {
        el.classList.add("sr");
        el.style.transitionDelay = (i % 4) * 80 + "ms";
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    els.forEach((el) => observer.observe(el));
  }
})();
