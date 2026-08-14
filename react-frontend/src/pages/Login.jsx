import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import { validateEmail, validatePassword } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";

export default function Login() {
  const { token, login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || "/";

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!validateEmail(email)) next.email = "Enter a valid email address";
    if (!validatePassword(password)) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      push("success", "Welcome back!", "Login successful");
      navigate(from, { replace: true });
    } catch (err) {
      push("error", "Login failed", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white">
              U
            </span>
            <h1 className="mt-4 text-2xl font-black text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Login to your UNISOLE account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <div className="flex items-center justify-between">
                <label className="label mb-0">Password</label>
                <Link
                  to="/register"
                  className="mb-1.5 text-xs font-semibold text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={submitting}
            >
              Login
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
              push("success", "Welcome back!", "Google login successful");
              navigate(from, { replace: true });
            }}
            onError={(msg) => push("error", "Google login failed", msg)}
          />

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
