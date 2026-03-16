/* ================= ADMIN AUTH ================= */
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user || user.role !== "admin") {
  alert("Admin access only");
  localStorage.clear();
  window.location.href = "login.html";
}

/* ================= CONFIG ================= */
const PRODUCT_API = "/api/products";
const ORDER_API = "/api/orders/admin";
const IMAGE_BASE = "/images";
let editingId = null;

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "login.html";
};

/* ================= THEME ================= */
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* ================= TAB SWITCHING ================= */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  const container = document.getElementById("products");
  container.innerHTML = "<p>Loading products...</p>";

  try {
    const res = await fetch(PRODUCT_API, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Fetch failed");

    const products = await res.json();
    container.innerHTML = "";

    if (!products.length) {
      container.innerHTML = "<p>No products found</p>";
      return;
    }

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <img src="${IMAGE_BASE}/${p.image}">
        <strong>${p.name}</strong>
        <p>₹${p.price}</p>
        <small>${p.category}</small>

        <div class="product-actions">
          <button onclick="editProduct(
            '${p._id}',
            '${p.name}',
            '${p.price}',
            '${p.category}',
            \`${p.description || ""}\`
          )">Edit</button>

          <button class="danger" onclick="deleteProduct('${p._id}')">
            Delete
          </button>
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load products</p>";
  }
}

/* ================= ADD / UPDATE PRODUCT ================= */
async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const image = document.getElementById("image").files[0];

  if (!name || !price || !category) return alert("Fill all required fields");
  if (!image && !editingId) return alert("Image required");

  const fd = new FormData();
  fd.append("name", name);
  fd.append("price", price);
  fd.append("category", category);
  fd.append("description", description);
  if (image) fd.append("image", image);

  const url = editingId ? `${PRODUCT_API}/${editingId}` : PRODUCT_API;
  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });

    if (!res.ok) throw new Error("Save failed");

    resetForm();
    loadProducts();
  } catch (err) {
    console.error(err);
    alert("Product save failed");
  }
}

/* ================= EDIT PRODUCT ================= */
function editProduct(id, name, price, category, description) {
  editingId = id;
  document.getElementById("name").value = name;
  document.getElementById("price").value = price;
  document.getElementById("category").value = category;
  document.getElementById("description").value = description;
  document.getElementById("addBtn").innerText = "Update Product";
}

/* ================= DELETE PRODUCT ================= */
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`${PRODUCT_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Delete failed");

    loadProducts();
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

/* ================= RESET FORM ================= */
function resetForm() {
  editingId = null;
  document.getElementById("addBtn").innerText = "Add Product";

  ["name", "price", "category", "description", "image"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ================= LOAD ORDERS (ADMIN) ================= */
async function loadOrders() {
  const container = document.getElementById("admin-orders");
  container.innerHTML = "<p>Loading orders...</p>";

  try {
    const res = await fetch(ORDER_API, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Order fetch failed");

    const orders = await res.json();
    container.innerHTML = "";

    if (!orders.length) {
      container.innerHTML = "<p>No orders yet</p>";
      return;
    }

    orders.forEach(order => {
      const div = document.createElement("div");
      div.className = "order-item";

      // Build HTML for items
      const itemsHTML = order.items.map(item => `
        <li>${item.name} - ₹${item.price} × ${item.quantity}</li>
      `).join("");

      // Shipping info
      const shipping = order.shipping || {};
      const shippingHTML = `${shipping.fullName || ""}, ${shipping.phone || ""}, ${shipping.address || ""}, ${shipping.city || ""}, ${shipping.state || ""}, ${shipping.pincode || ""}`;

      const status = order.status || "Processing";

      div.innerHTML = `
        <div class="order-top">
          <span class="order-id">Order #${order._id.slice(-6).toUpperCase()}</span>

          <select class="order-status-select" data-id="${order._id}">
            <option value="Processing" ${status === "Processing" ? "selected" : ""}>Processing</option>
            <option value="Shipped" ${status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option value="Delivered" ${status === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </div>

        <div class="order-details">
          <p><strong>User:</strong> ${order.user?.name || "N/A"} (${order.user?.email || "N/A"})</p>
          <p><strong>Items:</strong></p>
          <ul>${itemsHTML}</ul>
          <p><strong>Total:</strong> ₹${order.totalAmount}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Shipping:</strong> ${shippingHTML}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase() || "N/A"}</p>
        </div>
      `;

      container.appendChild(div);
    });

    // ================= ORDER STATUS CHANGE =================
    document.querySelectorAll(".order-status-select").forEach(select => {
      select.addEventListener("change", async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;

        try {
          const res = await fetch(`${ORDER_API}/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
          });

          if (!res.ok) throw new Error("Update failed");

          alert(`Order status updated to ${newStatus}`);
          loadOrders();
        } catch (err) {
          console.error(err);
          alert("Failed to update order status");
        }
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load orders</p>";
  }
}

/* ================= INIT ================= */
loadProducts();
loadOrders();