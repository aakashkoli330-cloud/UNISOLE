import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/products";
import ProductCard from "../components/ui/ProductCard";
import Skeleton from "../components/ui/Skeleton";
import { getImageSrc } from "../utils/getImageSrc";
import { formatPrice } from "../utils/format";

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
  const heroProduct = products[0];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-8 h-96 w-96 rounded-full bg-accent-100/70 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="container-app relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-in text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
              </span>
              New Season 2026 — Drop 02
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Walk Beyond{" "}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-transparent">
                Limits
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 sm:text-lg lg:mx-0">
              Premium sneakers engineered for comfort, performance and bold
              everyday style. Step into the drop.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/shop?category=men"
                className="btn-primary px-7 py-3.5 text-base shadow-lg shadow-brand-600/20"
              >
                Shop Men
                <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
              </Link>
              <Link to="/shop" className="btn-secondary px-7 py-3.5 text-base">
                <i className="fa-solid fa-bolt mr-1 text-accent-500" aria-hidden="true" />
                Shop All
              </Link>
            </div>

            <dl className="mt-10 flex items-center justify-center gap-7 lg:justify-start">
              <div>
                <dt className="text-2xl font-black text-gray-900">30K+</dt>
                <dd className="mt-0.5 text-xs font-medium text-gray-500">
                  Happy customers
                </dd>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <dt className="text-2xl font-black text-gray-900">
                  4.8
                  <i
                    className="fa-solid fa-star ml-1 text-sm text-accent-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="mt-0.5 text-xs font-medium text-gray-500">
                  Average rating
                </dd>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <dt className="text-2xl font-black text-gray-900">100%</dt>
                <dd className="mt-0.5 text-xs font-medium text-gray-500">Authentic</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-4 -rotate-6 rounded-[2rem] bg-gradient-to-br from-brand-500 to-brand-800 opacity-90" />
            <div className="relative rotate-2 rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-card-hover backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-50 to-accent-50">
                {heroProduct?.image ? (
                  <img
                    src={getImageSrc(heroProduct.image)}
                    alt={heroProduct.name}
                    className="h-72 w-full object-cover sm:h-80"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center sm:h-80">
                    <svg
                      viewBox="0 0 120 60"
                      className="h-24 w-44 text-brand-600/70"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 34C28 30 46 22 58 10"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-2 pb-1 pt-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {heroProduct ? heroProduct.name : "Premium Drop"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {heroProduct ? heroProduct.category : "UNISOLE Collection"}
                  </p>
                </div>
                <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                  {heroProduct ? formatPrice(heroProduct.price) : "New"}
                </span>
              </div>
            </div>

            <div
              className="absolute -left-3 top-8 animate-fade-in rounded-2xl bg-white px-4 py-3 shadow-card-hover sm:-left-6"
              style={{ animationDelay: "150ms" }}
            >
              <p className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <i className="fa-solid fa-truck-fast text-brand-600" aria-hidden="true" />
                Free Shipping
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">On orders above ₹999</p>
            </div>
            <div
              className="absolute -right-2 bottom-16 animate-fade-in rounded-2xl bg-white px-4 py-3 shadow-card-hover sm:-right-5"
              style={{ animationDelay: "300ms" }}
            >
              <p className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <i className="fa-solid fa-bolt text-accent-500" aria-hidden="true" />
                New Season
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">2026 collection live</p>
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
