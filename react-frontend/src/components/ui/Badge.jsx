const colors = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-brand-100 text-brand-700",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-100 text-purple-700",
};

export default function Badge({ color = "gray", children, className = "" }) {
  return (
    <span className={`badge ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
}

export function statusColor(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("paid") || s.includes("verified") || s.includes("delivered")) return "green";
  if (s.includes("cancel") || s.includes("failed") || s.includes("out")) return "red";
  if (s.includes("pending") || s.includes("placed")) return "yellow";
  if (s.includes("processing")) return "blue";
  return "gray";
}
