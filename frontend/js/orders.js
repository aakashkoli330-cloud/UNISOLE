console.log("orders.js loaded");

/* ================= CONFIG ================= */
const ORDERS_API = "/api/orders/my";

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

      const itemCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const status = (order.status || "Placed").toLowerCase();

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
          <p>${itemCount} item${itemCount > 1 ? "s" : ""}</p>
          <p>Total: ₹${order.totalAmount}</p>
          <p>Date: ${date}</p>
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