export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-[linear-gradient(90deg,#f3f4f6_25%,#e5e7eb_37%,#f3f4f6_63%)] bg-[length:936px_100%] ${className}`}
    />
  );
}
