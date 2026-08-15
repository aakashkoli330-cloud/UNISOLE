import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import { getImageSrc } from "../../utils/getImageSrc";
import Badge from "./Badge";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  if (!product) return null;

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group card overflow-hidden transition-shadow duration-300 hover:shadow-card-hover">
      <Link
        to={`/products/${product._id}`}
        className="relative block aspect-square w-full overflow-hidden bg-gray-100"
      >
        <img
          src={getImageSrc(product.image)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Badge color="red" className="text-sm">
              Out of Stock
            </Badge>
          </span>
        )}
        {lowStock && !outOfStock && (
          <span className="absolute left-2 top-2">
            <Badge color="yellow">Only {product.stock} left</Badge>
          </span>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {product.category}
          </span>
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        <Link to={`/products/${product._id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-brand-600">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {product.description}
          </p>
        )}

        <div className="mt-3">
          <button
            type="button"
            onClick={() => navigate(`/products/${product._id}`)}
            disabled={outOfStock}
            className={`btn w-full ${
              outOfStock
                ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
                : "border border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
            }`}
          >
            <i className="fa-solid fa-cart-plus" aria-hidden="true" />
            {outOfStock ? "Sold Out" : "Select Size"}
          </button>
        </div>
      </div>
    </div>
  );
}
