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
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo.jpg"
        alt="UNISOLE"
        className={`${markSizes[size]} shrink-0 rounded object-cover ${markClassName}`}
      />
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight text-gray-900`}>
          UNI<span className="text-brand-600">SOLE</span>
        </span>
      )}
    </span>
  );
}
