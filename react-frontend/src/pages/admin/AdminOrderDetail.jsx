import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/helpers";
import { formatDate, formatOrderId, formatPrice } from "../../utils/format";
import { getImageSrc } from "../../utils/getImageSrc";
import Badge, { statusColor } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const statuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { push } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    ordersApi
      .adminGetById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Order not found"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await ordersApi.adminUpdateStatus(id, status);
      push("success", "Order updated", `Status set to ${status}`);
      setOrder((o) => ({ ...o, status }));
    } catch (err) {
      push("error", "Update failed", getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        icon="fa-solid fa-circle-exclamation"
        title={error || "Order not found"}
        action={
          <Button to="/admin/orders" variant="primary">
            Back to Orders
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-sm font-semibold text-brand-600 hover:underline"
      >
        <i className="fa-solid fa-arrow-left mr-1" /> Back to orders
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Order <span className="font-mono">#{formatOrderId(order._id)}</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={statusColor(order.paymentStatus)}>
            {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentStatus}
          </Badge>
          <select
            className="input !w-auto !py-2 text-xs"
            value={order.status}
            disabled={updating}
            onChange={(e) => updateStatus(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900">
              Items ({order.items?.length || 0})
            </h3>
            <div className="mt-4 space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm font-bold text-gray-900 hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity} ×{" "}
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900">Shipping Address</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{order.shipping?.fullName}</p>
              <p>{order.shipping?.address}</p>
              <p>
                {order.shipping?.district}, {order.shipping?.state} -{" "}
                {order.shipping?.pincode}
              </p>
              <p>Phone: {order.shipping?.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900">Customer</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                {order.user?.name || "Unknown"}
              </p>
              <p>{order.user?.email || "—"}</p>
              <p>{order.user?.phone || "—"}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-900">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {order.transactionId && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900">Payment</h3>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p className="break-all font-mono text-xs">{order.transactionId}</p>
                {order.paidAt && <p>Paid on {formatDate(order.paidAt)}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
