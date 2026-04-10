document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const loginBtn = document.getElementById("login-btn");
  const profileBtn = document.getElementById("profile-btn");

  if (!loginBtn || !profileBtn) return;

  if (token) {
    loginBtn.style.display = "none";
    profileBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    profileBtn.style.display = "none";
  }
});