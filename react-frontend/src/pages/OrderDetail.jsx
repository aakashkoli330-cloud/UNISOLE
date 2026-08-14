import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { formatDate, formatOrderId, formatPrice } from "../utils/format";
import { getImageSrc } from "../utils/getImageSrc";
import Badge, { statusColor } from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

const statusSteps = ["Placed", "Processing", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ordersApi
      .getById(id)
      .then(({ data }) => mounted && setOrder(data))
      .catch(() => mounted && setError("Order not found"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-10">
        <Skeleton className="h-9 w-52" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon="fa-solid fa-circle-exclamation"
          title={error || "Order not found"}
          action={
            <Button to="/orders" variant="primary">
              Back to Orders
            </Button>
          }
        />
      </div>
    );
  }

  const stepIndex = statusSteps.findIndex((s) => s === order.status);
  const cancelled = order.status === "Cancelled";

  return (
    <div className="container-app py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/orders" className="text-sm font-semibold text-brand-600 hover:underline">
            <i className="fa-solid fa-arrow-left mr-1" /> Back to orders
          </Link>
          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Order <span className="font-mono">#{formatOrderId(order._id)}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge color={statusColor(order.status)}>{order.status}</Badge>
          <Badge color={statusColor(order.paymentStatus)}>
            {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentStatus}
          </Badge>
        </div>
      </div>

      {cancelled ? (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          This order was cancelled.
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      idx <= stepIndex
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx < stepIndex ? <i className="fa-solid fa-check" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      idx <= stepIndex ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`mx-2 mb-6 h-0.5 flex-1 ${
                      idx < stepIndex ? "bg-brand-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="card flex items-center gap-4 p-4"
            >
              <img
                src={getImageSrc(item.image)}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="text-sm font-bold text-gray-900 hover:text-brand-600"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">
                  Qty {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900">Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
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
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900">Shipping To</h2>
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{order.shipping?.fullName}</p>
              <p>{order.shipping?.address}</p>
              <p>
                {order.shipping?.district}, {order.shipping?.state} -{" "}
                {order.shipping?.pincode}
              </p>
              <p>Phone: {order.shipping?.phone}</p>
            </div>
          </div>

          {order.transactionId && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900">Payment</h2>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  Transaction ID:{" "}
                  <span className="break-all font-mono text-xs">{order.transactionId}</span>
                </p>
                {order.paidAt && <p>Paid on {formatDate(order.paidAt)}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
