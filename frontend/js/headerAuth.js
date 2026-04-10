// ============================================================
// frontend/js/headerAuth.js  — FIXED
// FIX: Was using getElementById("login-btn") but HTML uses class="login-btn"
//      Changed to querySelector(".login-btn") so login/profile toggle works
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // FIX: HTML uses class="login-btn", not id="login-btn"
  const loginBtn  = document.querySelector(".login-btn");
  const profileBtn = document.getElementById("profile-btn");

  if (token) {
    // Logged in — hide login button, show profile
    if (loginBtn)  loginBtn.style.display  = "none";
    if (profileBtn) profileBtn.style.display = "inline-flex";
  } else {
    // Logged out — show login button, hide profile
    if (loginBtn)  loginBtn.style.display  = "inline-flex";
    if (profileBtn) profileBtn.style.display = "none";
  }
});
