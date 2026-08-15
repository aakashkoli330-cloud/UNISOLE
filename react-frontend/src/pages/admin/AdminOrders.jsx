import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import { formatDate, formatOrderId, formatPrice } from "../../utils/format";
import Badge, { statusColor } from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const statuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const { push } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    ordersApi
      .adminGetAll()
      .then(({ data }) => setOrders(data || []))
      .catch(() => push("error", "Failed to load orders", "Please try again"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersApi.adminUpdateStatus(id, status);
      push("success", "Order updated", `Status set to ${status}`);
      setOrders((list) =>
        list.map((o) => (o._id === id ? { ...o, status } : o)),
      );
    } catch (err) {
      push("error", "Update failed", getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="fa-solid fa-receipt"
        title="No orders yet"
        message="Customer orders will appear here."
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">Orders</h2>
      <p className="mt-1 text-sm text-gray-500">{orders.length} orders</p>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    #{formatOrderId(order._id)}
                  </span>
                  <Badge color={statusColor(order.status)}>{order.status}</Badge>
                  <Badge color={statusColor(order.paymentStatus)}>
                    {order.paymentMethod === "cod" ? "COD" : order.paymentStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {order.user?.name || "Unknown"} · {order.user?.email || "—"} ·{" "}
                  {formatDate(order.createdAt)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {order.items?.length} item(s) · {formatPrice(order.totalAmount)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  View
                </Link>
                <select
                  className="input !w-auto !py-2 text-xs"
                  value={order.status}
                  disabled={updatingId === order._id}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
