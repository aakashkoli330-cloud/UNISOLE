console.log("checkout.js loaded");

/* ================= CONFIG ================= */
const CART_API = "/api/cart";
const ORDER_API = "/api/orders/checkout";

/* ================= AUTH CHECK ================= */
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to checkout");
  window.location.href = "login.html";
}

/* ================= LOAD CART SUMMARY ================= */
async function loadCheckoutSummary() {
  try {
    const res = await fetch(CART_API, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to load cart");

    const cart = await res.json();

    if (!cart.items || cart.items.length === 0) {
      alert("Your cart is empty");
      window.location.href = "cart.html";
      return;
    }

    // Calculate subtotal
    let subtotal = 0;
    cart.items.forEach(item => {
      if (!item.product) return;
      subtotal += item.product.price * item.quantity;
    });

    document.getElementById("subtotal").innerText = `₹${subtotal}`;
    document.getElementById("total").innerText = `₹${subtotal}`;

    updateCartCount(cart.items.length);

  } catch (err) {
    console.error("Checkout load error:", err);
    alert("Failed to load checkout");
  }
}

/* ================= PLACE ORDER ================= */
async function placeOrder() {
  // Get shipping info
  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!fullName || !phone || !address || !city || !state || !pincode) {
    return alert("Please fill all shipping details");
  }

  // Payment method (currently only COD)
  const paymentMethodInput = document.querySelector('input[name="payment"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.nextElementSibling.innerText : "Cash on Delivery";

  try {
    const res = await fetch(ORDER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipping: { fullName, phone, address, city, state, pincode },
        paymentMethod,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Order failed");
    }

    const data = await res.json();
    console.log("Order Response:", data);

    alert("🎉 Order placed successfully!");
    updateCartCount(0);
    window.location.href = "orders.html";

  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.message || "Failed to place order");
  }
}

/* ================= CART COUNT ================= */
function updateCartCount(count = 0) {
  const badge = document.querySelector(".cart-count");
  if (badge) badge.innerText = count;
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadCheckoutSummary();

  const btn = document.querySelector(".place-order-btn");
  if (btn) btn.addEventListener("click", placeOrder);
});