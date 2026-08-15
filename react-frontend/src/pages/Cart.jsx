import { useCart } from "../context/CartContext";
import { getImageSrc } from "../utils/getImageSrc";
import { formatPrice } from "../utils/format";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

export default function Cart() {
  const { cart, loading, subtotal, updateQty, removeItem } = useCart();
  const items = cart.items || [];

  if (loading) {
    return (
      <div className="container-app py-10">
        <Skeleton className="h-9 w-48" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon="fa-solid fa-bag-shopping"
          title="Your cart is empty"
          message="Browse the latest drops and add something you love."
          action={
            <Button to="/shop" variant="primary">
              Start Shopping
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-gray-900">
        Shopping Cart <span className="text-base font-semibold text-gray-400">({items.length} items)</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const sizeEntry = item.size
              ? product.sizes?.find((s) => String(s.size) === String(item.size))
              : null;
            const itemMax = sizeEntry
              ? sizeEntry.stock || 0
              : product.stock || 0;
            return (
              <div
                key={item._id || product._id}
                className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={getImageSrc(product.image)}
                  alt={product.name}
                  className="h-24 w-24 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {product.category}
                  </p>
                  <h3 className="mt-0.5 truncate text-sm font-bold text-gray-900">
                    {product.name}
                  </h3>
                  {item.size && (
                    <p className="mt-0.5 text-xs font-medium text-gray-500">
                      Size: <span className="font-semibold text-gray-700">{item.size}</span>
                    </p>
                  )}
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQty(product._id, item.size || "", -1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-brand-600 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <i className="fa-solid fa-minus" />
                    </button>
                    <span className="w-10 border-x border-gray-200 py-1.5 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(product._id, item.size || "", 1)}
                      disabled={item.quantity >= itemMax}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-brand-600 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(product.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(product._id, item.size || "")}
                      className="text-gray-400 transition-colors hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit card p-6">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <Button to="/checkout" variant="primary" fullWidth size="lg" className="mt-6">
            Proceed to Checkout
          </Button>
          <Button to="/shop" variant="secondary" fullWidth className="mt-3">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
