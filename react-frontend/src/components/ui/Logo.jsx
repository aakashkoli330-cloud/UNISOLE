import { useId } from "react";

const markSizes = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
};

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export default function Logo({
  size = "md",
  showText = true,
  className = "",
  markClassName = "",
}) {
  const gradId = useId();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className={`${markSizes[size]} shrink-0 drop-shadow-sm ${markClassName}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradId})`} />
        <path
          d="M6.8 21.4C12.4 20.6 17.6 17 22 10.2"
          fill="none"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="25" cy="23" r="2.1" fill="#facc15" />
      </svg>
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight text-gray-900`}>
          UNI<span className="text-brand-600">SOLE</span>
        </span>
      )}
    </span>
  );
}
