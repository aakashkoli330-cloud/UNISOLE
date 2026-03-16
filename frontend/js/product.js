console.log("product.js loaded");

(() => {
  const PRODUCT_API = "/api/products";
  const IMAGE_URL = "/images";

  /* ================= SAFE ADD TO CART ================= */
  function safeAddToCart(productId) {
    if (typeof window.addToCart !== "function") {
      console.error("addToCart not available. cartActions.js not loaded.");
      alert("Please refresh the page");
      return;
    }
    window.addToCart(productId);
  }

  /* ================= LIST PRODUCTS (HOME / MEN / WOMEN) ================= */
  window.loadProducts = async (category) => {
    const container = document.querySelector(".products-container");
    if (!container) return;

    try {
      let url = PRODUCT_API;
      if (category) url += `/category/${category}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Product fetch failed");

      const products = await res.json();
      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = "<p>No products found</p>";
        return;
      }

      products.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <div class="product-img">
            <img src="${IMAGE_URL}/${p.image}" alt="${p.name}">
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <div class="category">${p.category}</div>
            <div class="price">₹${p.price}</div>
            <div class="product-actions">
              <button class="btn-view">View</button>
              <button class="btn-cart">Add to Cart</button>
            </div>
          </div>
        `;

        card.querySelector(".btn-view").onclick = () => {
          location.href = `product.html?id=${p._id}`;
        };

        card.querySelector(".btn-cart").onclick = () => {
          safeAddToCart(p._id);
        };

        container.appendChild(card);
      });
    } catch (err) {
      console.error("Load products error:", err);
      container.innerHTML = "<p>Failed to load products</p>";
    }
  };

  /* ================= PRODUCT DETAILS PAGE ================= */
  async function loadProductDetails() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    try {
      const res = await fetch(`${PRODUCT_API}/${id}`);
      if (!res.ok) throw new Error("Product not found");

      const p = await res.json();

      const img = document.querySelector(".product-image img");
      const title = document.querySelector(".product-title");
      const price = document.querySelector(".product-price");
      const desc = document.querySelector(".product-desc");
      const addBtn = document.querySelector(".add-cart-btn");
      const buyBtn = document.querySelector(".buy-now-btn");

      if (img) img.src = `${IMAGE_URL}/${p.image}`;
      if (title) title.textContent = p.name;
      if (price) price.textContent = `₹${p.price}`;
      if (desc) desc.textContent = p.description || "";

      if (addBtn) {
        addBtn.onclick = () => safeAddToCart(p._id);
      }

      if (buyBtn) {
        buyBtn.onclick = () => {
          safeAddToCart(p._id);
          location.href = "cart.html";
        };
      }
    } catch (err) {
      console.error("Product detail error:", err);
    }
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname.includes("product.html")) {
      loadProductDetails();
    }
  });
})();