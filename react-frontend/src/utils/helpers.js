let _push = null;

export function registerToast(fn) {
  _push = fn;
}

export function getErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function requireLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    if (_push) _push("info", "Please login to continue", "Redirecting to login...");
    window.location.href = "/login";
    return false;
  }
  return true;
}
