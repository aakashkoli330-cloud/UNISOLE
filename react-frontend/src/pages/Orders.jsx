import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { formatDate, formatOrderId, formatPrice } from "../utils/format";
import { getImageSrc } from "../utils/getImageSrc";
import Badge, { statusColor } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    ordersApi
      .getMyOrders()
      .then(({ data }) => mounted && setOrders(data || []))
      .catch(() => mounted && setOrders([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container-app py-10">
        <Skeleton className="h-9 w-40" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon="fa-solid fa-box-open"
          title="No orders yet"
          message="When you place an order, it will show up here."
          action={
            <Button to="/shop" variant="primary">
              Shop Now
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        {orders.length} order{orders.length > 1 ? "s" : ""} placed
      </p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="card block p-5 transition-shadow hover:shadow-card-hover"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex -space-x-3">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <img
                    key={idx}
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl border-2 border-white object-cover shadow-sm"
                  />
                ))}
                {order.items?.length > 3 && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-xs font-bold text-gray-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    #{formatOrderId(order._id)}
                  </span>
                  <Badge color={statusColor(order.status)}>{order.status}</Badge>
                  <Badge color={statusColor(order.paymentStatus)}>
                    {order.paymentMethod === "cod" ? "COD" : order.paymentStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {order.items?.length} item{order.items?.length > 1 ? "s" : ""} · Placed on{" "}
                  {formatDate(order.createdAt)}
                </p>
                {order.items?.map((item, idx) => (
                  <p key={idx} className="mt-0.5 truncate text-xs text-gray-500">
                    {item.name}
                    {item.size ? ` — ${item.size}` : ""}
                    {" × "}
                    {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                  View details <i className="fa-solid fa-arrow-right" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
