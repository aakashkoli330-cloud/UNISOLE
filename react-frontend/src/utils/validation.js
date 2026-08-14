export function validatePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export function validatePincode(pincode) {
  return /^[1-9]\d{5}$/.test(String(pincode || "").trim());
}

export function validateFullName(name) {
  return /^[a-zA-Z\s.]+$/.test(String(name || "").trim()) && name.trim().length >= 2;
}

export function validateAddress(address) {
  return String(address || "").trim().length >= 10;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function validatePassword(password) {
  return String(password || "").length >= 6;
}
