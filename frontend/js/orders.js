console.log("orders.js loaded");

/* ================= CONFIG ================= */
const BACKEND_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://unisole.onrender.com";

const ORDERS_API = `${BACKEND_URL}/api/orders/my`;

/* ================= AUTH CHECK ================= */
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to view orders");
  window.location.href = "login.html";
}

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  const list = document.getElementById("orders-list");
  const emptyText = document.getElementById("empty-orders");

  list.innerHTML = "<p>Loading orders...</p>";
  emptyText.style.display = "none";

  try {
    const res = await fetch(ORDERS_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to load orders");

    const orders = await res.json();

    if (!orders.length) {
      list.innerHTML = "";
      emptyText.style.display = "block";
      return;
    }

    list.innerHTML = "";

    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      const status = (order.status || "Placed").toLowerCase();

      const shipping = order.shipping || {};

      /* ================= ITEMS HTML ================= */
      const itemsHTML = order.items.map(item => {
        let imageUrl;
        if (!item.image) {
          imageUrl = `${BACKEND_URL}/images/placeholder.png`;
        } else if (item.image.startsWith("http") || item.image.includes("cloudinary")) {
          imageUrl = item.image;
        } else if (item.image.includes("/")) {
          imageUrl = `https://res.cloudinary.com/dfd8f0jha/image/upload/${item.image}`;
        } else {
          imageUrl = `${BACKEND_URL}/images/${item.image}`;
        }

        return `
          <div class="order-product">
            <img src="${imageUrl}" alt="${item.name}">
            <div class="order-product-info">
              <h4>${item.name}</h4>
              <p>₹${item.price} × ${item.quantity}</p>
            </div>
          </div>
        `;
      }).join("");

      /* ================= CARD ================= */
      const card = document.createElement("div");
      card.className = "order-item";

      card.innerHTML = `
        <div class="order-top">
          <span class="order-id">
            Order #${order._id.slice(-6).toUpperCase()}
          </span>
          <span class="order-status ${status}">
            ${order.status || "Placed"}
          </span>
        </div>

        <div class="order-details">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod || "Cash on delivery"}</p>
        </div>

        <div class="order-shipping">
          <p><strong>Ship To:</strong> ${shipping.fullName || "N/A"}</p>
          <p>${shipping.address || ""}, ${shipping.city || ""}</p>
        </div>

        <div class="order-products">
          ${itemsHTML}
        </div>
      `;

      list.appendChild(card);
    });

  } catch (err) {
    console.error("Orders error:", err);
    list.innerHTML = "<p>Failed to load orders</p>";
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadOrders);