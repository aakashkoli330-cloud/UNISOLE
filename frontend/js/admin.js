/* ============================================================
   frontend/js/admin.js  — FIXED
   FIX: loadOrders() was called on every page load even when the
        Orders tab wasn't active. Now only loads on tab click.
        Also: tab system works correctly with CSS display toggle.
   ============================================================ */

/* ── Admin Auth ── */
const token = localStorage.getItem("token");
const user  = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user || user.role !== "admin") {
  alert("Admin access only");
  localStorage.clear();
  window.location.href = "login.html";
}

/* ── Config ── */
const BACKEND_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://unisole.onrender.com";

/* ── Order Filter ── */
let currentOrderFilter = "all";
let allOrders = [];

const PRODUCT_API = `${BACKEND_URL}/api/products`;
const ORDER_API   = `${BACKEND_URL}/api/orders`;

let editingId = null;
let ordersLoaded = false; // FIX: track whether orders have been fetched

/* ── Basic controls ── */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

document.getElementById("themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* ── Tab switch ── */
function initTabs() {
  const buttons  = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-content");

  // Set initial state
  sections.forEach((sec) => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  const defaultBtn = document.querySelector(".tab-btn.active");
  if (defaultBtn) {
    const target = document.getElementById(defaultBtn.dataset.tab);
    if (target) {
      target.style.display = "block";
      target.classList.add("active");
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b)   => b.classList.remove("active"));
      sections.forEach((sec) => {
        sec.style.display = "none";
        sec.classList.remove("active");
      });

      btn.classList.add("active");

      const target = document.getElementById(btn.dataset.tab);
      if (target) {
        target.style.display = "block";
        target.classList.add("active");
      }

      // FIX: Only load orders when the Orders tab is actually opened
      if (btn.dataset.tab === "orders-section" && !ordersLoaded) {
        loadOrders();
        ordersLoaded = true;
      }
    });
  });
}

/* ── Load products ── */
async function loadProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "<p>Loading products...</p>";

  try {
    const res = await fetch(PRODUCT_API, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load products");

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    data.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product";

      let imageUrl;
      if (!p.image) {
        imageUrl = "placeholder.png";
      } else if (p.image.startsWith("http") || p.image.includes("cloudinary")) {
        imageUrl = p.image;
      } else if (p.image.includes("/")) {
        imageUrl = `https://res.cloudinary.com/dfd8f0jha/image/upload/${p.image}`;
      } else {
        imageUrl = `${BACKEND_URL}/images/${p.image}`;
      }

      card.innerHTML = `
        <img src="${imageUrl}" alt="${p.name}">
        <strong>${p.name}</strong>
        <p class="price">₹${p.price}</p>
        <p class="category">${p.category}</p>
        <p class="stock">Stock: ${p.stock ?? 0}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "product-actions";

      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit";
      editBtn.onclick = () => editProduct(p);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.classList.add("danger");
      deleteBtn.onclick = () => deleteProduct(p._id);

      actions.append(editBtn, deleteBtn);
      card.appendChild(actions);
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

/* ── Add / Update product ── */
async function addProduct(e) {
  e.preventDefault();

  const btn = document.getElementById("addBtn");
  btn.disabled = true;
  btn.innerText = "Saving...";

  const name        = document.getElementById("name").value.trim();
  const price       = document.getElementById("price").value;
  const category    = document.getElementById("category").value.trim().toLowerCase();
  const stock       = document.getElementById("stock").value;
  const description = document.getElementById("description").value;
  const image       = document.getElementById("image").files[0];

  if (!name || !price || !category || !stock) {
    alert("Please fill all required fields");
    btn.disabled = false;
    btn.innerText = editingId ? "Update Product" : "Add Product";
    return;
  }

  if (!editingId && !image) {
    alert("Image is required for a new product");
    btn.disabled = false;
    btn.innerText = "Add Product";
    return;
  }

  const fd = new FormData();
  fd.append("name",        name);
  fd.append("price",       price);
  fd.append("category",    category);
  fd.append("stock",       stock);
  fd.append("description", description);
  if (image) fd.append("image", image);

  const url    = editingId ? `${PRODUCT_API}/${editingId}` : PRODUCT_API;
  const method = editingId ? "PUT" : "POST";

  try {
    const res  = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(editingId ? "Product updated!" : "Product added!");
    resetForm();
    loadProducts();

  } catch (err) {
    console.error(err);
    alert(err.message || "Error saving product");
  }

  btn.disabled = false;
  btn.innerText = editingId ? "Update Product" : "Add Product";
}

/* ── Edit product ── */
function editProduct(product) {
  editingId = product._id;

  document.getElementById("name").value        = product.name;
  document.getElementById("price").value       = product.price;
  document.getElementById("category").value    = product.category.toLowerCase();
  document.getElementById("stock").value       = product.stock || 0;
  document.getElementById("description").value = product.description || "";
  document.getElementById("addBtn").innerText  = "Update Product";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Delete product ── */
async function deleteProduct(id) {
  if (!confirm("Delete this product? This cannot be undone.")) return;

  try {
    const res  = await fetch(`${PRODUCT_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("Deleted successfully");
    loadProducts();

  } catch (err) {
    console.error(err);
    alert(err.message || "Delete failed");
  }
}

/* ── Reset form ── */
function resetForm() {
  editingId = null;
  document.getElementById("addBtn").innerText = "Add Product";
  ["name", "price", "category", "description", "image", "stock"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ── Load orders ── */
async function loadOrders() {
  const container = document.getElementById("admin-orders");
  if (!container) return;

  container.innerHTML = "<p>Loading orders...</p>";

  try {
    const res = await fetch(`${ORDER_API}/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const orders = await res.json();
    if (!res.ok) throw new Error("Failed to load orders");

    allOrders = orders;

    // Filter orders based on current filter
    const filtered = currentOrderFilter === "all" 
      ? orders 
      : orders.filter(o => o.status === currentOrderFilter);

    // Update order count
    const countEl = document.getElementById("orderCount");
    if (countEl) {
      countEl.textContent = `${filtered.length} / ${orders.length} orders`;
    }

    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = `<p>${currentOrderFilter === "all" ? "No orders yet." : "No orders with status '" + currentOrderFilter + "'."}</p>`;
      return;
    }

    filtered.forEach((order) => {
      const div         = document.createElement("div");
      const statusClass = (order.status || "processing").toLowerCase();
      div.className     = `order-item ${statusClass}`;

      const items    = order.items.map((i) =>
        `<li>${i.name} — ₹${i.price} × ${i.quantity}</li>`
      ).join("");

      const shipping = order.shipping || {};
      const userObj  = order.user    || {};
      const status   = order.status  || "Processing";
      const payStatus = order.paymentStatus || "pending";
      const paymentMethod = order.paymentMethod || "razorpay";
      const isCOD = paymentMethod === "cod";
      const isFinalStatus = status === "Delivered" || status === "Cancelled";
      const canUpdateStatus = !isFinalStatus && (payStatus === "verified" || isCOD);
      
      const userEmail = userObj.email || "N/A";
      const userPhone = userObj.phone || shipping.phone || "N/A";
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      let paymentBadge = "";
      if (payStatus === "pending") {
        paymentBadge = '<span class="badge pending">Payment Pending</span>';
      } else if (payStatus === "paid") {
        paymentBadge = '<span class="badge paid">Payment Submitted: ' + (order.transactionId || "N/A") + '</span>';
      } else if (payStatus === "verified") {
        paymentBadge = '<span class="badge verified">Payment Verified</span>';
      } else if (payStatus === "failed") {
        paymentBadge = '<span class="badge failed">Payment Failed</span>';
      }

      const verifyBtn = "";
      const rejectBtn = "";
      
      const statusSelect = canUpdateStatus 
        ? `<select data-id="${order._id}" class="status-select">
            <option ${status === "Placed" ? "selected" : ""}>Placed</option>
            <option ${status === "Processing" ? "selected" : ""}>Processing</option>
            <option ${status === "Shipped"    ? "selected" : ""}>Shipped</option>
            <option ${status === "Delivered"  ? "selected" : ""}>Delivered</option>
            <option ${status === "Cancelled"  ? "selected" : ""}>Cancelled</option>
          </select>`
        : `<span class="${isFinalStatus ? 'status-final' : 'status-locked'}">${status}</span>`;

      div.innerHTML = `
        <div class="order-top">
          <strong>Order #${order._id.slice(-6).toUpperCase()}</strong>
          <span class="order-date">${orderDate}</span>
           ${paymentBadge}
          <span class="payment-method-badge">${isCOD ? 'COD' : 'Razorpay'}</span>
        </div>
        
        <div class="order-info-grid">
          <div class="order-section user-details">
            <h4><i class="fas fa-user"></i> Customer Details</h4>
            <p><strong>Name:</strong> ${shipping.fullName || userObj.name || "N/A"}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Phone:</strong> ${userPhone}</p>
          </div>
          
          <div class="order-section shipping-address">
            <h4><i class="fas fa-map-marker-alt"></i> Shipping Address</h4>
            <p class="address-line">${shipping.address || "N/A"}</p>
            <p><strong>District:</strong> ${shipping.district || "N/A"}</p>
            <p><strong>State:</strong> ${shipping.state || "N/A"}</p>
            <p><strong>Pincode:</strong> ${shipping.pincode || "N/A"}</p>
          </div>
        </div>
        
        <div class="order-section order-items">
          <h4><i class="fas fa-box"></i> Order Items</h4>
          <ul>${items}</ul>
        </div>
        
        <div class="order-footer">
          <p class="total-amount"><strong>Total: ₹${order.totalAmount.toLocaleString('en-IN')}</strong></p>
          <div class="order-actions">
            ${statusSelect}
            ${verifyBtn}
            ${rejectBtn}
          </div>
        </div>
      `;

      container.appendChild(div);
    });

    // Attach status change listeners
    container.querySelectorAll("select[data-id]").forEach((sel) => {
      sel.addEventListener("change", async (e) => {
        const id     = e.target.dataset.id;
        const status = e.target.value;
        e.target.disabled = true;

        try {
          const res = await fetch(`${ORDER_API}/admin/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          ordersLoaded = false;
          await loadOrders();
          ordersLoaded = true;

        } catch (err) {
          console.error(err);
          alert(err.message || "Status update failed");
        }

        e.target.disabled = false;
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Failed to load orders.</p>";
  }
}



/* ── Init ── */
document.getElementById("addForm")?.addEventListener("submit", addProduct);
initTabs();

// Order filter
document.getElementById("orderFilter")?.addEventListener("change", (e) => {
  currentOrderFilter = e.target.value;
  loadOrders();
});
loadProducts(); // Only load products on page load — orders load on tab click
