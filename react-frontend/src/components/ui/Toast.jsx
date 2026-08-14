import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";

const icons = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-xmark",
  info: "fa-solid fa-circle-info",
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-brand-500",
};

export default function ToastStack() {
  const { toasts, remove } = useToast();
  const [exiting, setExiting] = useState({});

  useEffect(() => {
    if (toasts.length) {
      const timer = setTimeout(() => setExiting({}), 50);
      return () => clearTimeout(timer);
    }
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto animate-toast-in flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card-hover ${
            exiting[toast.id] ? "opacity-0 transition-opacity" : ""
          }`}
        >
          <i
            className={`${icons[toast.type] || icons.info} mt-0.5 text-lg ${iconColors[toast.type] || iconColors.info}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.message && (
              <p className="mt-0.5 text-xs text-gray-500">{toast.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Dismiss"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
