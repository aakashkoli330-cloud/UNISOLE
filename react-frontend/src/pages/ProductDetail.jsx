import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { getImageSrc } from "../utils/getImageSrc";
import { formatPrice } from "../utils/format";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

function sizeStock(product, size) {
  if (!product.sizes || product.sizes.length === 0) {
    return product.stock || 0;
  }
  const match = product.sizes.find((s) => String(s.size) === String(size));
  return match ? match.stock || 0 : 0;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    productsApi
      .getById(id)
      .then(({ data }) => mounted && setProduct(data))
      .catch(() => mounted && setError("Product not found"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setQty(1);
    const hasSizes = product.sizes && product.sizes.length > 0;
    if (hasSizes) {
      const first = product.sizes.find((s) => (s.stock || 0) > 0);
      setSelectedSize(first ? String(first.size) : "");
    } else {
      setSelectedSize("");
    }
  }, [product]);

  const handleAdd = async () => {
    if (!selectedSize) {
      return;
    }
    setAdding(true);
    try {
      for (let i = 0; i < qty; i++) {
        await addToCart(product._id, selectedSize);
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon="fa-solid fa-circle-exclamation"
          title={error || "Product not found"}
          action={
            <Button to="/shop" variant="primary">
              Back to Shop
            </Button>
          }
        />
      </div>
    );
  }

  const hasSizes = product.sizes && product.sizes.length > 0;
  const availableStock = hasSizes
    ? product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
    : product.stock || 0;
  const outOfStock = availableStock <= 0;
  const maxQty = selectedSize ? sizeStock(product, selectedSize) : availableStock;

  return (
    <div className="container-app py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/shop" className="hover:text-brand-600">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${product.category}`}
          className="capitalize hover:text-brand-600"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Badge color="blue" className="capitalize">
              {product.category}
            </Badge>
            {outOfStock ? (
              <Badge color="red">Out of Stock</Badge>
            ) : availableStock <= 5 ? (
              <Badge color="yellow">Only {availableStock} left</Badge>
            ) : (
              <Badge color="green">In Stock</Badge>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-black text-gray-900">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Inclusive of all taxes · Free shipping
          </p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <span className="label">Size (UK)</span>
            {hasSizes ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const stock = s.stock || 0;
                  const selected = String(s.size) === String(selectedSize);
                  return (
                    <button
                      key={s.size}
                      type="button"
                      disabled={stock <= 0 || outOfStock}
                      onClick={() => setSelectedSize(String(s.size))}
                      className={
                        "min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold transition " +
                        (selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : stock <= 0
                            ? "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                            : "border-gray-300 text-gray-700 hover:border-brand-600 hover:text-brand-600")
                      }
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                disabled={outOfStock}
                className="mt-3 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Free Size
              </button>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <span className="label">Quantity</span>
            <div className="mt-3 inline-flex items-center rounded-lg border border-gray-300 bg-white">
              <button
                type="button"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                disabled={qty <= 1 || outOfStock}
                className="px-3 py-2 text-sm text-gray-600 hover:text-brand-600 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <i className="fa-solid fa-minus" />
              </button>
              <span className="w-12 border-x border-gray-200 py-2 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((v) => Math.min(maxQty, v + 1))}
                disabled={qty >= maxQty || outOfStock}
                className="px-3 py-2 text-sm text-gray-600 hover:text-brand-600 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <i className="fa-solid fa-plus" />
              </button>
            </div>
            {selectedSize && (
              <p className="mt-2 text-xs text-gray-500">
                {sizeStock(product, selectedSize)} available in UK {selectedSize}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={adding}
              disabled={outOfStock || !selectedSize}
              onClick={() => handleAdd(false)}
            >
              <i className="fa-solid fa-cart-plus" aria-hidden="true" />
              {outOfStock ? "Sold Out" : !selectedSize ? "Select Size" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
