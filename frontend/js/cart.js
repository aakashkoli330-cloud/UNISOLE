console.log("cart.js loaded");

const CART_API = "/api/cart";
const PLACEHOLDER_IMG = "https://via.placeholder.com/150";

/* Get image source */
function getImageSrc(image) {
  if (!image) return PLACEHOLDER_IMG;
  if (image.startsWith("http") || image.includes("cloudinary")) return image;
  if (image.includes("/")) {
    return `https://res.cloudinary.com/dfd8f0jha/image/upload/${image}`;
  }
  return `/images/${image}`;
}

/* Load cart */
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
      if (!product) return;

      subtotal += product.price * quantity;
      const imageUrl = getImageSrc(product.image);

      cartItemsEl.innerHTML += `
        <div class="cart-item">

          <div class="cart-img">
            <img src="${imageUrl}" alt="${product.name}">
          </div>

          <div class="cart-info">
            <h3>${product.name}</h3>
            <p class="cart-price">₹${product.price}</p>

            <div class="cart-controls">
              <div class="qty-controls">
                <button class="qty-btn" data-id="${product._id}" data-change="-1">−</button>
                <span>${quantity}</span>
                <button class="qty-btn" data-id="${product._id}" data-change="1">+</button>
              </div>

              <button class="remove-btn" data-id="${product._id}">Remove</button>
            </div>
          </div>

        </div>
      `;
    });

    subtotalEl.textContent = `₹${subtotal}`;
    totalEl.textContent = `₹${subtotal}`;

    if (window.updateCartCount) updateCartCount();

  } catch (err) {
    console.error("Load cart error:", err);
    cartItemsEl.innerHTML = "<p>Failed to load cart</p>";
  }
};

/* Events */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("qty-btn")) {
    updateQty(e.target.dataset.id, Number(e.target.dataset.change));
  }

  if (e.target.classList.contains("remove-btn")) {
    removeItem(e.target.dataset.id);
  }
});

/* Checkout */
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

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cart-items")) {
    loadCart();
  }
});