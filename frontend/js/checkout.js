console.log("checkout.js loaded");

const CART_API = "/api/cart";
const ORDER_API = "/api/orders";

let currentOrder = null;
let currentRazorpayOrder = null;
let cartItems = [];
let selectedPayment = "razorpay";

const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to checkout");
  window.location.href = "login.html";
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "Error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearError(fieldId) {
  const errorEl = document.getElementById(fieldId + "Error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function validateFullName(name) {
  if (!name || name.trim().length < 2) {
    return "Please enter a valid full name (at least 2 characters)";
  }
  if (!/^[a-zA-Z\s.]+$/.test(name.trim())) {
    return "Name should only contain letters, spaces, and dots";
  }
  return null;
}

function validatePhone(phone) {
  if (!phone || phone.trim() === "") {
    return "Please enter your phone number";
  }
  if (!/^\d{10}$/.test(phone.trim())) {
    return "Phone number must be exactly 10 digits";
  }
  return null;
}

function validateState(state) {
  if (!state || state === "") {
    return "Please select your state";
  }
  return null;
}

function validateDistrict(district) {
  if (!district || district === "") {
    return "Please select your district";
  }
  return null;
}

function validatePincode(pincode) {
  if (!pincode || pincode.trim() === "") {
    return "Please enter your pincode";
  }
  if (!/^\d{6}$/.test(pincode.trim())) {
    return "Pincode must be exactly 6 digits";
  }
  return null;
}

function validateAddress(address) {
  if (!address || address.trim().length < 10) {
    return "Please enter a complete address (at least 10 characters)";
  }
  return null;
}

function populateStates() {
  const stateSelect = document.getElementById("state");
  if (!stateSelect) return;
  
  stateSelect.innerHTML = '<option value="">Select State</option>';
  
  STATES.forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

function populateDistricts(state) {
  const districtSelect = document.getElementById("district");
  if (!districtSelect) return;
  
  districtSelect.innerHTML = '<option value="">Select District</option>';
  
  if (!state || !DISTRICTS[state]) {
    districtSelect.disabled = true;
    return;
  }
  
  const districts = DISTRICTS[state].sort();
  districts.forEach(district => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    districtSelect.appendChild(option);
  });
  
  districtSelect.disabled = false;
}

function lookupPincode(pincode) {
  if (!pincode || pincode.length !== 6) {
    return null;
  }
  return PINCODE_DATA[pincode] || null;
}

function handleStateChange() {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const pincodeHint = document.getElementById("pincodeHint");
  
  const selectedState = stateSelect.value;
  
  populateDistricts(selectedState);
  
  clearError("state");
  clearError("district");
  
  districtSelect.value = "";
  pincodeHint.textContent = "";
  pincodeHint.style.display = "none";
}

function handlePincodeInput(pincode) {
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const pincodeHint = document.getElementById("pincodeHint");
  
  pincode = pincode.replace(/\D/g, "");
  
  if (pincode.length === 6) {
    const lookup = lookupPincode(pincode);
    
    if (lookup) {
      const [district, state] = lookup;
      
      if (stateSelect.value === state) {
        districtSelect.value = district;
        pincodeHint.textContent = `${district}, ${state}`;
        pincodeHint.style.display = "inline";
        pincodeHint.classList.add("success");
        clearError("pincode");
      } else {
        pincodeHint.textContent = "Pincode doesn't match selected state";
        pincodeHint.style.display = "inline";
        pincodeHint.classList.remove("success");
      }
    } else {
      pincodeHint.textContent = "Entered pincode not in our database";
      pincodeHint.style.display = "inline";
      pincodeHint.classList.remove("success");
    }
  } else {
    pincodeHint.style.display = "none";
  }
  
  return pincode;
}

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

    cartItems = cart.items;
    renderCartItems();
    updateTotals();

    if (typeof window.updateCartCount === "function") {
      window.updateCartCount();
    }

  } catch (err) {
    console.error("Checkout load error:", err);
    alert("Failed to load checkout. Please try again.");
  }
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  if (!container) return;
  
  container.innerHTML = "";
  
  cartItems.forEach(item => {
    if (!item.product) return;
    
    const product = item.product;
    const price = product.price * item.quantity;
    
    container.innerHTML += `
      <div class="cart-item-summary">
        <img src="${getImageSrc(product.image)}" alt="${product.name}">
        <div class="info">
          <h4>${product.name}</h4>
          <p>Qty: ${item.quantity}</p>
        </div>
        <span class="price">₹${price.toLocaleString()}</span>
      </div>
    `;
  });
}

function getImageSrc(image) {
  if (!image) return "/images/placeholder.png";
  if (image.startsWith("http")) return image;
  if (image.includes("cloudinary")) return image;
  return `/images/${image}`;
}

function updateTotals() {
  let subtotal = 0;
  cartItems.forEach(item => {
    if (item.product) {
      subtotal += item.product.price * item.quantity;
    }
  });
  
  document.getElementById("subtotal").textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById("total").textContent = `₹${subtotal.toLocaleString()}`;
}

async function placeOrder() {
  const fullName = document.getElementById("fullName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const state = document.getElementById("state")?.value;
  const district = document.getElementById("district")?.value;
  const pincode = document.getElementById("pincode")?.value.trim();
  const address = document.getElementById("address")?.value.trim();

  let hasErrors = false;

  const fullNameError = validateFullName(fullName);
  if (fullNameError) {
    showError("fullName", fullNameError);
    hasErrors = true;
  } else {
    clearError("fullName");
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    showError("phone", phoneError);
    hasErrors = true;
  } else {
    clearError("phone");
  }

  const stateError = validateState(state);
  if (stateError) {
    showError("state", stateError);
    hasErrors = true;
  } else {
    clearError("state");
  }

  const districtError = validateDistrict(district);
  if (districtError) {
    showError("district", districtError);
    hasErrors = true;
  } else {
    clearError("district");
  }

  const pincodeError = validatePincode(pincode);
  if (pincodeError) {
    showError("pincode", pincodeError);
    hasErrors = true;
  } else {
    clearError("pincode");
  }

  const addressError = validateAddress(address);
  if (addressError) {
    showError("address", addressError);
    hasErrors = true;
  } else {
    clearError("address");
  }

  if (hasErrors) {
    const firstError = document.querySelector(".field-error[style*='block']");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const placeBtn = document.getElementById("placeOrderBtn");
  if (placeBtn) {
    placeBtn.disabled = true;
    placeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  }

  try {
    const shipping = { fullName, phone, state, district, pincode, address };

    if (selectedPayment === "cod") {
      const res = await fetch(ORDER_API + "/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping,
          paymentMethod: "cod"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order failed");
      }

      alert("Order placed successfully! You will pay ₹" + data.order.totalAmount.toLocaleString() + " on delivery.");
      window.location.href = "orders.html";
    } else {
      const res = await fetch(ORDER_API + "/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipping }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      currentOrder = data.order;
      currentRazorpayOrder = {
        id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency
      };

      openRazorpayCheckout(data);
    }

  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.message || "Failed to place order. Please try again.");
    
    if (placeBtn) {
      placeBtn.disabled = false;
      updateButtonText();
    }
  }
}

function openRazorpayCheckout(orderData) {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    name: "UNISOLE",
    description: `Order #${currentOrder._id.slice(-8).toUpperCase()}`,
    image: "/images/logo.png",
    order_id: orderData.razorpayOrderId,
    handler: async function (response) {
      await verifyPayment(response);
    },
    prefill: {
      name: currentOrder.shipping.fullName,
      email: "",
      contact: currentOrder.shipping.phone
    },
    notes: {
      order_id: currentOrder._id
    },
    theme: {
      color: "#1a6fba"
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert("Payment failed: " + response.error.description);
      const placeBtn = document.getElementById("placeOrderBtn");
      if (placeBtn) {
        placeBtn.disabled = false;
        updateButtonText();
      }
    });
    rzp.open();
  } catch (err) {
    console.error("Razorpay error:", err);
    alert("Payment initialization failed. Please try again.");
    const placeBtn = document.getElementById("placeOrderBtn");
    if (placeBtn) {
      placeBtn.disabled = false;
      updateButtonText();
    }
  }
}

async function verifyPayment(response) {
  try {
    const res = await fetch(ORDER_API + "/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Payment verification failed");
    }

    alert("Payment successful! Your order has been placed.");
    window.location.href = "orders.html";

  } catch (err) {
    console.error("Payment verification error:", err);
    alert("Payment verification failed: " + err.message + ". Please contact support with your payment ID: " + response.razorpay_payment_id);
    
    const placeBtn = document.getElementById("placeOrderBtn");
    if (placeBtn) {
      placeBtn.disabled = false;
      updateButtonText();
    }
  }
}

function updatePaymentSelection() {
  const selected = document.querySelector('input[name="payment"]:checked');
  if (selected) {
    selectedPayment = selected.value;
    updateButtonText();
  }
}

function updateButtonText() {
  const placeBtn = document.getElementById("placeOrderBtn");
  if (placeBtn) {
    if (selectedPayment === "razorpay") {
      placeBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Pay';
    } else {
      placeBtn.innerHTML = '<i class="fas fa-money-bill"></i> Place Order (Pay on Delivery)';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateStates();
  loadCheckoutSummary();

  const btn = document.getElementById("placeOrderBtn");
  if (btn) btn.addEventListener("click", placeOrder);
  
  const paymentOptions = document.querySelectorAll('input[name="payment"]');
  paymentOptions.forEach(option => {
    option.addEventListener("change", updatePaymentSelection);
  });
  
  updatePaymentSelection();
  
  const stateSelect = document.getElementById("state");
  if (stateSelect) {
    stateSelect.addEventListener("change", handleStateChange);
  }

  const districtSelect = document.getElementById("district");
  if (districtSelect) {
    districtSelect.addEventListener("change", () => clearError("district"));
  }

  const pincodeInput = document.getElementById("pincode");
  if (pincodeInput) {
    pincodeInput.addEventListener("input", (e) => {
      e.target.value = handlePincodeInput(e.target.value);
    });
    pincodeInput.addEventListener("blur", (e) => {
      if (e.target.value.length > 0 && e.target.value.length < 6) {
        showError("pincode", "Pincode must be exactly 6 digits");
      }
    });
  }

  const fullNameInput = document.getElementById("fullName");
  if (fullNameInput) {
    fullNameInput.addEventListener("blur", (e) => {
      const error = validateFullName(e.target.value.trim());
      if (error) showError("fullName", error);
      else clearError("fullName");
    });
  }

  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });
    phoneInput.addEventListener("blur", (e) => {
      const error = validatePhone(e.target.value.trim());
      if (error) showError("phone", error);
      else clearError("phone");
    });
  }

  const addressInput = document.getElementById("address");
  if (addressInput) {
    addressInput.addEventListener("blur", (e) => {
      const error = validateAddress(e.target.value.trim());
      if (error) showError("address", error);
      else clearError("address");
    });
  }
});
