(() => {
  console.log("cartActions.js loaded");

  const API_URL = "/api/cart";

  /* ================= HELPERS ================= */
  function getToken() {
    return localStorage.getItem("token");
  }

  function requireLogin() {
    alert("Please login first");
    window.location.href = "login.html";
  }

  function getCartCountElements() {
    const elements = [];
    const byId = document.getElementById("cart-count");
    const byClass = document.querySelectorAll(".cart-count");

    if (byId) elements.push(byId);
    byClass.forEach(el => {
      if (el !== byId) elements.push(el);
    });

    return elements;
  }

  /* ================= CART COUNT (REAL TIME) ================= */
  window.updateCartCount = async () => {
    const badges = getCartCountElements();
    if (!badges.length) return;

    const token = getToken();
    if (!token) {
      badges.forEach(b => {
        b.textContent = "0";
        b.style.display = "none";
      });
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : data;

      const totalQty = items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      badges.forEach(b => {
        b.textContent = totalQty;
        b.style.display = totalQty > 0 ? "flex" : "none";
      });

    } catch (err) {
      console.error("Cart count error:", err);
    }
  };

  /* ================= ADD TO CART ================= */
  window.addToCart = async (productId) => {
    const token = getToken();
    if (!token) return requireLogin();

    try {
      const res = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (!res.ok) throw new Error();

      await window.updateCartCount();
      alert("Added to cart");

    } catch {
      alert("Failed to add to cart");
    }
  };

  /* ================= UPDATE QTY ================= */
  window.updateQty = async (productId, change) => {
    const token = getToken();
    if (!token) return requireLogin();

    await fetch(`${API_URL}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, change })
    });

    if (typeof window.loadCart === "function") {
      window.loadCart();
    }
    window.updateCartCount();
  };

  /* ================= REMOVE ITEM ================= */
  window.removeItem = async (productId) => {
    const token = getToken();
    if (!token) return requireLogin();
    if (!confirm("Remove item?")) return;

    await fetch(`${API_URL}/remove/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (typeof window.loadCart === "function") {
      window.loadCart();
    }
    window.updateCartCount();
  };

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    window.updateCartCount();
  });
})();