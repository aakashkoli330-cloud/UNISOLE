/* ==========================================================
   UNISOLE — BOTTOM NAVIGATION JS
   Handles active states and interactions
   ========================================================== */

(function () {
  "use strict";

  function initBottomNav() {
    const bottomNav = document.querySelector(".bottom-nav");
    if (!bottomNav) return;

    const navItems = bottomNav.querySelectorAll(".bottom-nav-item");
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split("/").pop() || "index.html";

    // Define page mappings
    const pageMap = {
      "index.html": { item: "home", icon: "fa-home" },
      "mens.html": { item: "men", icon: "fa-person" },
      "womens.html": { item: "women", icon: "fa-person-dress" },
      "cart.html": { item: "cart", icon: "fa-bag-shopping" },
      "profile.html": { item: "profile", icon: "fa-user" },
      "orders.html": { item: "profile", icon: "fa-box" },
      "login.html": { item: "profile", icon: "fa-user" },
      "register.html": { item: "profile", icon: "fa-user" },
      "checkout.html": { item: "cart", icon: "fa-bag-shopping" },
      "product.html": { item: "home", icon: "fa-home" },
    };

    // Set active state based on current page
    navItems.forEach((item) => {
      const itemName = item.dataset.page;
      const pageInfo = pageMap[currentPage];

      if (pageInfo && itemName === pageInfo.item) {
        item.classList.add("active");
      }

      // Add touch feedback
      item.addEventListener(
        "touchstart",
        function () {
          this.style.opacity = "0.7";
        },
        { passive: true },
      );

      item.addEventListener(
        "touchend",
        function () {
          this.style.opacity = "1";
        },
        { passive: true },
      );
    });

    // Update cart badge count
    updateBottomNavCartBadge();

    // Listen for cart updates
    window.addEventListener("cartUpdated", updateBottomNavCartBadge);
  }

  function updateBottomNavCartBadge() {
    const bottomNavCart = document.querySelector(
      '.bottom-nav-item[data-page="cart"]',
    );
    const topNavCartBadge = document.getElementById("cart-count");

    if (!bottomNavCart || !topNavCartBadge) return;

    const count = topNavCartBadge.textContent;
    let badge = bottomNavCart.querySelector(".nav-badge");

    if (count && parseInt(count) > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge";
        bottomNavCart.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = "flex";
    } else if (badge) {
      badge.style.display = "none";
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBottomNav);
  } else {
    initBottomNav();
  }

  // Re-init on page visibility change (for SPAs or back/forward navigation)
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      setTimeout(initBottomNav, 100);
    }
  });
})();
