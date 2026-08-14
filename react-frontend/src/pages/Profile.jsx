import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import { validateFullName, validatePhone, validatePassword, validatePincode } from "../utils/validation";
import { INDIAN_STATES } from "../config";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const { push } = useToast();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    let mounted = true;
    usersApi
      .getMe()
      .then(({ data }) => {
        if (!mounted) return;
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
        });
      })
      .catch(() => mounted && push("error", "Failed to load profile", "Please try again"));
    return () => {
      mounted = false;
    };
  }, [push]);

  if (!profile) {
    return (
      <div className="container-app flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    const next = {};
    if (!validateFullName(form.name)) next.name = "Enter a valid full name";
    if (form.phone && !validatePhone(form.phone)) next.phone = "Enter a valid 10-digit mobile";
    if (form.pincode && !validatePincode(form.pincode)) next.pincode = "Enter a valid 6-digit pincode";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const { data } = await usersApi.update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
        },
      });
      setProfile(data.user);
      localStorage.setItem("user", JSON.stringify({ ...user, name: data.user.name }));
      push("success", "Profile updated", "Your details were saved");
    } catch (err) {
      push("error", "Update failed", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!validatePassword(pw.newPassword))
      next.newPassword = "Password must be at least 6 characters";
    if (pw.confirm !== pw.newPassword) next.confirm = "Passwords do not match";
    setErrors((prev) => ({ ...prev, ...next }));
    if (Object.keys(next).length) return;

    setSavingPw(true);
    try {
      await usersApi.changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      push("success", "Password changed", "Use your new password next login");
    } catch (err) {
      push("error", "Password change failed", getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="container-app py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white">
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900">
              {profile.name}
              {isAdmin && <Badge color="purple">Admin</Badge>}
            </h1>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
        <Link
          to="/orders"
          className="btn-secondary text-sm"
        >
          <i className="fa-solid fa-box-open mr-1" aria-hidden="true" /> My Orders
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card p-6">
          <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
            />
            <Input
              label="Phone"
              placeholder="10-digit mobile"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
              error={errors.phone}
            />
            <Input
              label="Street Address"
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              className="sm:col-span-2"
            />
            <Input
              label="City / District"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <div>
              <label className="label">State</label>
              <select
                className="input"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "") }))}
              error={errors.pincode}
              maxLength={6}
            />
          </div>
          <Button type="submit" variant="primary" loading={saving} className="mt-5">
            Save Changes
          </Button>
        </form>

        <form onSubmit={savePassword} className="card p-6">
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          <div className="mt-5 space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              error={errors.confirm}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" variant="secondary" loading={savingPw} className="mt-5">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
