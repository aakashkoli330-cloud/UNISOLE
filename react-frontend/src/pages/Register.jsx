import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import { validateEmail, validateFullName, validatePassword } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";
import Logo from "../components/ui/Logo";

export default function Register() {
  const { token, register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!validateFullName(form.name)) next.name = "Enter your full name (letters only)";
    if (!validateEmail(form.email)) next.email = "Enter a valid email address";
    if (!validatePassword(form.password))
      next.password = "Password must be at least 6 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      push("success", "Account created!", "Welcome to UNISOLE");
      navigate("/", { replace: true });
    } catch (err) {
      push("error", "Registration failed", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <Logo showText={false} size="lg" />
            <h1 className="mt-4 text-2xl font-black text-gray-900">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Join UNISOLE in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={(e) => setField("confirm", e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={submitting}
            >
              Create Account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <GoogleLoginButton
            onSuccess={() => {
              push("success", "Welcome!", "Google account linked");
              navigate("/", { replace: true });
            }}
            onError={(msg) => push("error", "Google sign-in failed", msg)}
          />

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
