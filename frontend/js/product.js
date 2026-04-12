/* ============================================================
   frontend/js/product.js  — FIXED
   FIX 1: Stock display used inline style.color — now uses CSS classes
           (.stock.in / .stock.low / .stock.out) so CSS controls color
   FIX 2: loadProducts() on index.html now passes no category filter
           (previously broken because body had no men-page/women-page class)
   ============================================================ */

console.log("product.js loaded");

(() => {
  const PRODUCT_API = "/api/products";
  const PLACEHOLDER_IMG = "/images/placeholder.png";

  /* ── Safe add to cart ── */
  function safeAddToCart(productId) {
    if (typeof window.addToCart !== "function") {
      console.error("addToCart not available — cartActions.js not loaded.");
      alert("Please refresh the page and try again.");
      return;
    }
    window.addToCart(productId);
  }

  /* ── Image URL helper ── */
  function getImageSrc(image) {
    if (!image || image === "null" || image === "undefined") {
      return PLACEHOLDER_IMG;
    }
    if (image.startsWith("http")) {
      return image;
    }
    if (image.includes("cloudinary")) {
      return image;
    }
    if (image.includes("/") && image.length < 100) {
      return `https://res.cloudinary.com/dfd8f0jha/image/upload/${image}`;
    }
    return `/images/${image}`;
  }

  /* ── Stock label HTML ── */
  function getStockHTML(stock) {
    if (stock <= 0) {
      return `<span class="stock out">Out of Stock</span>`;
    } else if (stock <= 5) {
      return `<span class="stock low">Only ${stock} left</span>`;
    } else {
      return `<span class="stock in">In Stock</span>`;
    }
  }

  /* ── Load product listing ── */
  window.loadProducts = async (category) => {
    const container = document.querySelector(".products-container");
    if (!container) return;

    container.innerHTML = `<p style="color:var(--text-60);padding:40px 0;">Loading products...</p>`;

    try {
      let url = PRODUCT_API;
      if (category) url += `/category/${category.toLowerCase()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Product fetch failed");

      const products = await res.json();
      container.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `<p style="color:var(--text-60);padding:40px 0;">No products found.</p>`;
        return;
      }

      const token = localStorage.getItem("token");
      let cartItems = {};

      if (token) {
        try {
          const cartRes = await fetch("/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData.items) {
              cartData.items.forEach((item) => {
                const pid = item.product?._id || item.product;
                cartItems[pid.toString()] = item.quantity;
              });
            }
          }
        } catch (e) {
          console.log("Could not fetch cart");
        }
      }

      products.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const inCart = cartItems[p._id.toString()] || 0;
        const atMaxStock = inCart >= p.stock;
        const isOutOfStock = p.stock <= 0;
        const isDisabled = isOutOfStock || atMaxStock;

        let btnText = "Add to Cart";
        if (isOutOfStock) btnText = "Out of Stock";
        else if (atMaxStock) btnText = `Max (${inCart})`;

        card.innerHTML = `
          <div class="product-img">
            <img src="${getImageSrc(p.image)}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <div class="category">${p.category}</div>
            <div class="price">₹${p.price}</div>
            ${getStockHTML(p.stock)}
            <div class="product-actions">
              <button class="btn-view">View</button>
              <button class="btn-cart" ${isDisabled ? "disabled" : ""}>
                ${btnText}
              </button>
            </div>
          </div>
        `;

        card.querySelector(".btn-view").onclick = () => {
          location.href = `product.html?id=${p._id}`;
        };

        if (!isDisabled) {
          card.querySelector(".btn-cart").onclick = () => safeAddToCart(p._id);
        }

        container.appendChild(card);
      });
    } catch (err) {
      console.error("Load products error:", err);
      container.innerHTML = `<p style="color:var(--danger);">Failed to load products. Please refresh.</p>`;
    }
  };

  /* ── Single product page ── */
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
      const stockText = document.querySelector(".product-stock");
      const category = document.querySelector(".product-category");

      if (img) img.src = getImageSrc(p.image);
      if (title) title.textContent = p.name;
      if (price) price.textContent = `₹${p.price}`;
      if (desc) desc.textContent = p.description || "";
      if (category)
        category.textContent = p.category ? p.category.toUpperCase() : "";

      // FIX: Use CSS classes instead of inline style.color
      if (stockText) {
        stockText.className = "product-stock"; // reset classes first
        if (p.stock <= 0) {
          stockText.textContent = "Out of Stock";
          stockText.classList.add("out");
        } else if (p.stock <= 5) {
          stockText.textContent = `Only ${p.stock} left`;
          stockText.classList.add("low");
        } else {
          stockText.textContent = `In Stock (${p.stock})`;
          stockText.classList.add("in");
        }
      }

      // Control button state
      if (p.stock <= 0) {
        if (addBtn) {
          addBtn.disabled = true;
          addBtn.innerText = "Out of Stock";
          addBtn.style.opacity = "0.55";
          addBtn.style.cursor = "not-allowed";
        }
      } else {
        if (addBtn) addBtn.onclick = () => safeAddToCart(p._id);
      }
    } catch (err) {
      console.error("Product detail error:", err);
      const page = document.querySelector(".product-page");
      if (page)
        page.innerHTML = `<p style="color:var(--danger);padding:60px;">Failed to load product.</p>`;
    }
  }

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".products-container");

    if (container) {
      let category = null;
      if (document.body.classList.contains("men-page")) category = "men";
      if (document.body.classList.contains("women-page")) category = "women";
      window.loadProducts(category);
    }

    if (location.pathname.includes("product.html")) {
      loadProductDetails();
    }
  });
})();
