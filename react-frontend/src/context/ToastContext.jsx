import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { registerToast } from "../utils/helpers";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  useEffect(() => {
    registerToast(push);
    return () => registerToast(null);
  }, [push]);

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
