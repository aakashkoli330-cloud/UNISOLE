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

      const res = await fetch("http:/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();

      if (data.success) {
        button.innerText = "Added ✓";
      } else {
        button.innerText = "Error";
      }

      setTimeout(() => {
        button.innerText = "Add to Cart";
        button.disabled = false;
      }, 1200);

    } catch (error) {
      button.innerText = "Failed";
      button.disabled = false;
    }
  });
});
