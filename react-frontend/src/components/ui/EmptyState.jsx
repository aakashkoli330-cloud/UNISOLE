export default function EmptyState({
  icon = "fa-solid fa-box-open",
  title,
  message,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
        <i className={icon} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
