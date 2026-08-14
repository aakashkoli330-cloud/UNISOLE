export default function QtyStepper({ value, onChange, min = 1, max = 99 }) {
  const step = (delta) => {
    const next = value + delta;
    if (next >= min && next <= max) onChange(next);
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= min}
        className="px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <i className="fa-solid fa-minus" aria-hidden="true" />
      </button>
      <span className="w-10 border-x border-gray-200 py-1.5 text-center text-sm font-semibold text-gray-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= max}
        className="px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <i className="fa-solid fa-plus" aria-hidden="true" />
      </button>
    </div>
  );
}
