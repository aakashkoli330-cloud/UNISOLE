import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/products";
import ProductCard from "../components/ui/ProductCard";
import Skeleton from "../components/ui/Skeleton";

const trustBadges = [
  { icon: "fa-solid fa-truck-fast", title: "Free Shipping", text: "On all orders above ₹999" },
  { icon: "fa-solid fa-money-bill-wave", title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: "fa-solid fa-rotate-left", title: "Easy Returns", text: "7-day hassle-free returns" },
  { icon: "fa-solid fa-lock", title: "Secure Payments", text: "Razorpay encrypted checkout" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productsApi
      .getAll()
      .then(({ data }) => mounted && setProducts(data || []))
      .catch(() => mounted && setProducts([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="container-app py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700">
              <i className="fa-solid fa-fire text-accent-400" aria-hidden="true" />
              New Season 2026
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl">
              Walk Beyond{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                Limits
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg">
              Premium sneakers engineered for comfort, performance and bold
              everyday style.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/shop?category=men" className="btn-primary px-6 py-3 text-base">
                Shop Men
              </Link>
              <Link to="/shop?category=women" className="btn-secondary px-6 py-3 text-base">
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            to="/shop?category=men"
            className="group relative overflow-hidden rounded-2xl bg-brand-600 p-8 text-white transition-transform hover:scale-[1.01]"
          >
            <i className="fa-solid fa-person absolute -bottom-4 -right-4 text-[120px] text-white/10 transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-100">
              Collection
            </span>
            <h3 className="mt-2 text-3xl font-black">Men's Sneakers</h3>
            <p className="mt-2 text-sm text-brand-100">Explore the drop</p>
          </Link>
          <Link
            to="/shop?category=women"
            className="group relative overflow-hidden rounded-2xl bg-accent-400 p-8 text-gray-900 transition-transform hover:scale-[1.01]"
          >
            <i className="fa-solid fa-person-dress absolute -bottom-4 -right-4 text-[120px] text-gray-900/10 transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
              Collection
            </span>
            <h3 className="mt-2 text-3xl font-black">Women's Sneakers</h3>
            <p className="mt-2 text-sm text-gray-600">Explore the drop</p>
          </Link>
        </div>
      </section>

      <section className="container-app py-12 sm:py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Drops</h2>
          <Link
            to="/shop"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            View all <i className="fa-solid fa-arrow-right ml-1 text-xs" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden p-0">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="container-app pb-16 sm:pb-24">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 lg:grid-cols-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <i className={b.icon} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{b.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
