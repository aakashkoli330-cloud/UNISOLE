(() => {
  console.log("login.js loaded");

  const API_URL = "/api";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return console.error("loginForm not found");

    // ------------------------------
    // Normal Email/Password Login
    // ------------------------------
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = form.elements["email"].value.trim();
      const password = form.elements["password"].value.trim();

      if (!email || !password) return alert("Please fill all fields");

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (!res.ok) return alert(data.message || "Login failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful!");
        window.location.href = data.user.role === "admin" ? "admin.html" : "index.html";

      } catch (err) {
        console.error("Login error:", err);
        alert("Server error");
      }
    });

    // ------------------------------
    // Google Login
    // ------------------------------
    window.handleGoogleCredentialResponse = async (response) => {
      try {
        console.log("Google ID Token:", response.credential);

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

    // ------------------------------
    // Render Google Sign-In Button
    // ------------------------------
    google.accounts.id.initialize({
      client_id: "536359177570-1cdaq9fajio2hhb6do6ige2o5i2l25gm.apps.googleusercontent.com",
      callback: handleGoogleCredentialResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      {  theme: "outline", size: "large", text: "signup_with" }
    );

    google.accounts.id.prompt(); // Optional automatic popup
  });
})();