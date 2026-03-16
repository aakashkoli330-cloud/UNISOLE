document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const loginBtn = document.querySelector(".login-btn");
  const profileBtn = document.getElementById("profile-btn");

  if (token) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "inline-block";
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (profileBtn) profileBtn.style.display = "none";
  }
});