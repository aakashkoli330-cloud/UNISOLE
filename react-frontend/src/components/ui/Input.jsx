import { useId } from "react";

export default function Input({
  label,
  error,
  hint,
  as: Tag = "input",
  className = "",
  ...rest
}) {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <Tag
        id={id}
        className={`${Tag === "input" ? "input" : "input min-h-[96px] resize-y"} ${
          error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
