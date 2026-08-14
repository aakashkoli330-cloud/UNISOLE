import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi } from "../api/products";
import ProductCard from "../components/ui/ProductCard";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

const tabs = [
  { key: "all", label: "All" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const q = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTab = tabs.some((t) => t.key === category) ? category : "all";

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetcher = () => {
      if (q.trim()) return productsApi.search(q.trim());
      if (activeTab === "men") return productsApi.getByCategory("men");
      if (activeTab === "women") return productsApi.getByCategory("women");
      return productsApi.getAll();
    };

    fetcher()
      .then(({ data }) => mounted && setProducts(data || []))
      .catch(() => mounted && setProducts([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [activeTab, q]);

  const switchTab = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === "all") next.delete("category");
    else next.set("category", key);
    setSearchParams(next, { replace: true });
  };

  const title = useMemo(() => {
    if (q.trim()) return `Results for "${q.trim()}"`;
    if (activeTab === "men") return "Men's Collection";
    if (activeTab === "women") return "Women's Collection";
    return "All Shoes";
  }, [activeTab, q]);

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{title}</h1>
          {q && (
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="mt-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="inline-flex w-fit rounded-lg bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchTab(tab.key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
      ) : products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={q ? "No products found" : "No products in this collection"}
            message={
              q
                ? `We couldn't find anything matching "${q}". Try a different keyword.`
                : "Products will appear here soon."
            }
            action={
              q ? (
                <Button
                  variant="primary"
                  onClick={() => setSearchParams({}, { replace: true })}
                >
                  Browse all shoes
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
