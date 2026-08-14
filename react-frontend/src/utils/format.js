export function formatPrice(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatOrderId(id) {
  return id ? id.slice(-6).toUpperCase() : "";
}
