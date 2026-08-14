import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { getImageSrc } from "../utils/getImageSrc";
import { formatPrice } from "../utils/format";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

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

  const handleAdd = async (buyNow = false) => {
    setAdding(true);
    try {
      for (let i = 0; i < qty; i++) {
        await addToCart(product._id);
      }
      if (buyNow) navigate("/checkout");
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

  const outOfStock = product.stock <= 0;

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
            ) : product.stock <= 5 ? (
              <Badge color="yellow">Only {product.stock} left</Badge>
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
            <span className="label">Quantity</span>
            <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white">
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
                onClick={() => setQty((v) => Math.min(product.stock, v + 1))}
                disabled={qty >= product.stock || outOfStock}
                className="px-3 py-2 text-sm text-gray-600 hover:text-brand-600 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <i className="fa-solid fa-plus" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={adding}
              disabled={outOfStock}
              onClick={() => handleAdd(false)}
            >
              <i className="fa-solid fa-cart-plus" aria-hidden="true" />
              {outOfStock ? "Sold Out" : "Add to Cart"}
            </Button>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              disabled={outOfStock}
              onClick={() => handleAdd(true)}
            >
              <i className="fa-solid fa-bolt" aria-hidden="true" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
