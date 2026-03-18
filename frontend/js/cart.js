console.log("cart.js loaded");


const IMAGE_URL = "/images"; 
const CART_API = "/api/cart";

/* ================= LOAD CART ================= */
window.loadCart = async function () {
  const cartItemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const emptyCartEl = document.getElementById("empty-cart");

  if (!cartItemsEl) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to view cart");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(CART_API, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Cart fetch failed");

    const cart = await res.json();
    const items = cart.items || [];

    cartItemsEl.innerHTML = "";

    if (!items.length) {
      if (emptyCartEl) emptyCartEl.style.display = "block";
      subtotalEl.textContent = "₹0";
      totalEl.textContent = "₹0";

      if (window.updateCartCount) updateCartCount();
      return;
    }

    if (emptyCartEl) emptyCartEl.style.display = "none";

    let subtotal = 0;

    items.forEach(({ product, quantity }) => {
      if (!product) return; // Skip deleted or missing products

      subtotal += product.price * quantity;

      // Fallback image if product.image is missing
      const productImage = product.image ? `${IMAGE_URL}/${product.image}` : "/images/default-product.png";

      cartItemsEl.innerHTML += `
        <div class="cart-item">
          <img src="${productImage}" alt="${product.name}">
          
          <div class="cart-item-info">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>

            <div class="qty-controls">
              <button class="qty-btn" data-id="${product._id}" data-change="-1">−</button>
              <span>${quantity}</span>
              <button class="qty-btn" data-id="${product._id}" data-change="1">+</button>
            </div>

            <button class="remove-btn" data-id="${product._id}">
              Remove
            </button>
          </div>
        </div>
      `;
    });

    subtotalEl.textContent = `₹${subtotal}`;
    totalEl.textContent = `₹${subtotal}`;

    if (window.updateCartCount) updateCartCount();

  } catch (err) {
    console.error("Load cart error:", err);
  }
};

/* ================= EVENTS ================= */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("qty-btn")) {
    updateQty(
      e.target.dataset.id,
      Number(e.target.dataset.change)
    );
  }

  if (e.target.classList.contains("remove-btn")) {
    removeItem(e.target.dataset.id);
  }
});

/* ================= CHECKOUT ================= */
window.goToCheckout = function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to continue");
    window.location.href = "login.html";
    return;
  }

  const cartItemsEl = document.getElementById("cart-items");
  if (!cartItemsEl || cartItemsEl.children.length === 0) {
    alert("Your cart is empty");
    return;
  }

  window.location.href = "checkout.html";
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cart-items")) {
    loadCart();
  }
});
