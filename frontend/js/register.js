(() => {
  console.log("register.js loaded");

  const API_URL = "/api";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    if (!form) return console.error("registerForm not found");

    // Email/password registration
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.elements["name"].value.trim();
      const email = form.elements["email"].value.trim();
      const password = form.elements["password"].value.trim();
      const confirmPassword = form.elements["confirmPassword"].value.trim();

      if (!name || !email || !password || !confirmPassword) {
        return alert("Please fill all fields");
      }

      if (password !== confirmPassword) {
        return alert("Passwords do not match");
      }

      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        console.log("REGISTER RESPONSE:", data);

        if (!res.ok) {
          return alert(data.message || "Registration failed");
        }

        alert("Account created! Please check your email to verify before logging in.");
        window.location.href = "login.html";

      } catch (err) {
        console.error("Register error:", err);
        alert("Server error");
      }
    });

    // Google Sign-In Handler
    window.handleGoogleCredentialResponse = async (response) => {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();
        console.log("GOOGLE LOGIN RESPONSE:", data);

        if (!res.ok) return alert(data.message || "Google login failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful via Google!");
        window.location.href = data.user.role === "admin" ? "admin.html" : "index.html";

      } catch (err) {
        console.error("Google login error:", err);
        alert("Google login failed");
      }
    };

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: "536359177570-1cdaq9fajio2hhb6do6ige2o5i2l25gm.apps.googleusercontent.com",
      callback: handleGoogleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large", text: "signup_with" }
    );

    window.google.accounts.id.prompt(); // optional
  });
})();