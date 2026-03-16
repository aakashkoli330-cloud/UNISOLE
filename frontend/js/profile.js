const API = "/api/users";
const token = localStorage.getItem("token");

if (!token) {
  location.href = "login.html";
}

/* ================= DOM ELEMENTS ================= */
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userAddress = document.getElementById("userAddress");

const name = document.getElementById("name");
const phone = document.getElementById("phone");
const street = document.getElementById("street");
const city = document.getElementById("city");
const state = document.getElementById("state");
const pincode = document.getElementById("pincode");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const logoutBtn = document.getElementById("logoutBtn");

/* ================= LOAD PROFILE ================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Profile fetch failed");
    }

    const user = await res.json();

    // Display user info
    userName.textContent = user.name || "-";
    userEmail.textContent = user.email || "-";
    userPhone.textContent = user.phone || "-";
    userAddress.textContent = user.address
      ? `${user.address.street || ""}, ${user.address.city || ""}, ${user.address.state || ""}, ${user.address.pincode || ""}`
      : "-";

    // Fill form inputs for editing
    name.value = user.name || "";
    phone.value = user.phone || "";
    if (user.address) {
      street.value = user.address.street || "";
      city.value = user.address.city || "";
      state.value = user.address.state || "";
      pincode.value = user.address.pincode || "";
    }
  } catch (err) {
    console.error(err);
    alert("Session expired. Please login again.");
    localStorage.removeItem("token");
    location.href = "login.html";
  }
}

/* ================= UPDATE PROFILE ================= */
async function updateProfile() {
  try {
    const res = await fetch(`${API}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name.value,
        phone: phone.value,
        address: {
          street: street.value,
          city: city.value,
          state: state.value,
          pincode: pincode.value
        }
      })
    });

    if (!res.ok) throw new Error("Update failed");

    alert("Profile updated successfully!");
    loadProfile();
  } catch (err) {
    console.error(err);
    alert("Failed to update profile");
  }
}

/* ================= CHANGE PASSWORD ================= */
async function changePassword() {
  const currentPwd = currentPassword.value;
  const newPwd = newPassword.value;

  if (!currentPwd || !newPwd) {
    return alert("Please fill all password fields");
  }

  try {
    const res = await fetch(`${API}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
    });

    if (!res.ok) throw new Error("Password change failed");

    alert("Password changed successfully!");
    currentPassword.value = "";
    newPassword.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to change password");
  }
}

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  location.href = "login.html";
};

/* ================= INITIAL LOAD ================= */
loadProfile();