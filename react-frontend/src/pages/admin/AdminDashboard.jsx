import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../../api/products";
import { ordersApi } from "../../api/orders";
import { formatPrice } from "../../utils/format";
import Skeleton from "../../components/ui/Skeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
    inStock: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([productsApi.getAll(), ordersApi.adminGetAll()])
      .then(([{ data: products }, { data: orders }]) => {
        if (!mounted) return;
        const revenue = orders
          .filter((o) => o.status !== "Cancelled")
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
          pending: orders.filter((o) => o.paymentStatus === "pending").length,
          inStock: products.filter((p) => p.stock > 0).length,
          lowStock: products.filter((p) => p.stock > 0 && p.stock <= 3).length,
        });
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: "fa-solid fa-box", color: "bg-brand-50 text-brand-600" },
    { label: "Total Orders", value: stats.orders, icon: "fa-solid fa-receipt", color: "bg-purple-50 text-purple-600" },
    { label: "Revenue (excl. cancelled)", value: formatPrice(stats.revenue), icon: "fa-solid fa-indian-rupee-sign", color: "bg-green-50 text-green-600" },
    { label: "Pending Payments", value: stats.pending, icon: "fa-solid fa-hourglass-half", color: "bg-yellow-50 text-yellow-600" },
    { label: "In Stock", value: stats.inStock, icon: "fa-solid fa-boxes-stacked", color: "bg-blue-50 text-blue-600" },
    { label: "Low Stock (≤3)", value: stats.lowStock, icon: "fa-solid fa-triangle-exclamation", color: "bg-red-50 text-red-600" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-1 text-sm text-gray-500">Store overview at a glance</p>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="card p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <i className={card.icon} aria-hidden="true" />
              </div>
              <p className="mt-4 text-2xl font-black text-gray-900">{card.value}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/admin/products" className="card flex items-center justify-between p-6 transition-shadow hover:shadow-card-hover">
          <div>
            <h3 className="font-bold text-gray-900">Manage Products</h3>
            <p className="mt-1 text-sm text-gray-500">Add, edit or delete products</p>
          </div>
          <i className="fa-solid fa-arrow-right text-brand-600" aria-hidden="true" />
        </Link>
        <Link to="/admin/orders" className="card flex items-center justify-between p-6 transition-shadow hover:shadow-card-hover">
          <div>
            <h3 className="font-bold text-gray-900">Manage Orders</h3>
            <p className="mt-1 text-sm text-gray-500">Update order statuses</p>
          </div>
          <i className="fa-solid fa-arrow-right text-brand-600" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
