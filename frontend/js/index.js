// ============================================================
// frontend/js/index.js  — FIXED
// FIX: Was hardcoding http://localhost:5000/api/cart/add
//      Changed to relative /api/cart/add — works in both dev and production
// ============================================================

document.querySelectorAll(".add-to-cart-btn").forEach(button => {
  button.addEventListener("click", async () => {
    const productId = button.dataset.id;
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    try {
      button.innerText = "Adding...";
      button.disabled = true;

      // FIX: relative URL works in both localhost and production
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();

      if (res.ok) {
        button.innerText = "Added ✓";
        // Update cart badge if cartActions is loaded
        if (typeof window.updateCartCount === "function") {
          window.updateCartCount();
        }
      } else {
        button.innerText = data.message || "Error";
      }

      setTimeout(() => {
        button.innerText = "Add to Cart";
        button.disabled = false;
      }, 1400);

    } catch (error) {
      console.error("Add to cart error:", error);
      button.innerText = "Failed";
      button.disabled = false;
    }
  });
});
