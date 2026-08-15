import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ordersApi } from "../api/orders";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/helpers";
import { getImageSrc } from "../utils/getImageSrc";
import { formatPrice, formatOrderId } from "../utils/format";
import { INDIAN_STATES, RAZORPAY_KEY_ID } from "../config";
import {
  validateAddress,
  validateFullName,
  validatePhone,
  validatePincode,
} from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const initialForm = {
  fullName: "",
  phone: "",
  state: "",
  district: "",
  pincode: "",
  address: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const { push } = useToast();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState("razorpay");
  const [placing, setPlacing] = useState(false);
  const placingRef = useRef(false);

  const items = cart.items || [];

  useEffect(() => {
    if (user?.name && !form.fullName) {
      setForm((f) => ({ ...f, fullName: user.name }));
    }
    if (user?.phone && !form.phone) {
      setForm((f) => ({ ...f, phone: user.phone }));
    }
    if (user?.address?.state && !form.state) {
      setForm((f) => ({
        ...f,
        state: user.address.state,
        district: user.address.city || f.district,
        pincode: user.address.pincode || f.pincode,
        address: user.address.street || f.address,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!validateFullName(form.fullName))
      next.fullName = "Enter a valid full name (letters only)";
    if (!validatePhone(form.phone)) next.phone = "Enter a valid 10-digit mobile number";
    if (!form.state) next.state = "Please select your state";
    if (!form.district.trim()) next.district = "Please enter your district";
    if (!validatePincode(form.pincode)) next.pincode = "Enter a valid 6-digit pincode";
    if (!validateAddress(form.address)) next.address = "Enter a complete address (min 10 characters)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openRazorpay = async (orderData) => {
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Could not load payment gateway");

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "UNISOLE",
        description: `Order #${formatOrderId(orderData.order._id)}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: orderData.order.shipping?.fullName || form.fullName,
          email: user?.email || "",
          contact: orderData.order.shipping?.phone || form.phone,
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const { data } = await ordersApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve(data);
          } catch (err) {
            reject(err);
          }
        },
        modal: { ondismiss: () => reject(new Error("Payment window closed")) },
      });
      rzp.on("payment.failed", (resp) =>
        reject(new Error(resp.error?.description || "Payment failed")),
      );
      rzp.open();
    });
  };

  const placeOrder = async () => {
    if (placingRef.current) return;
    if (!validate()) {
      push("error", "Check your details", "Some fields need attention");
      return;
    }

    const shipping = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      state: form.state,
      district: form.district.trim(),
      pincode: form.pincode.trim(),
      address: form.address.trim(),
    };

    placingRef.current = true;
    setPlacing(true);

    try {
      if (payment === "cod") {
        await ordersApi.checkout(shipping);
        clearCart();
        push("success", "Order placed!", "Pay on delivery. Thank you!");
        navigate("/orders");
      } else {
        const { data } = await ordersApi.createRazorpayOrder(shipping);
        try {
          await openRazorpay(data);
          clearCart();
          push("success", "Payment successful!", "Your order has been placed");
          navigate("/orders");
        } catch (rzErr) {
          push("error", "Payment not completed", getErrorMessage(rzErr, "Please try again"));
        }
      }
    } catch (err) {
      push("error", "Could not place order", getErrorMessage(err));
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon="fa-solid fa-bag-shopping"
          title="Your cart is empty"
          message="Add some shoes before checking out."
          action={
            <Button to="/shop" variant="primary">
              Start Shopping
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-black text-gray-900">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
              Shipping Address
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                error={errors.fullName}
              />
              <Input
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value.replace(/\D/g, ""))}
                error={errors.phone}
              />
              <div>
                <label className="label">State</label>
                <select
                  className={`input ${errors.state ? "border-red-400" : ""}`}
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.state}</p>
                )}
              </div>
              <Input
                label="District"
                placeholder="Enter your district"
                value={form.district}
                onChange={(e) => setField("district", e.target.value)}
                error={errors.district}
              />
              <Input
                label="Pincode"
                placeholder="6-digit pincode"
                value={form.pincode}
                onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, ""))}
                error={errors.pincode}
                maxLength={6}
              />
              <Input
                as="textarea"
                label="Address"
                placeholder="House no, street, area, landmark"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                error={errors.address}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
              Payment Method
            </h2>
            <div className="mt-5 space-y-3">
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                  payment === "razorpay"
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={payment === "razorpay"}
                  onChange={() => setPayment("razorpay")}
                  className="accent-brand-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Card / UPI / Net Banking</p>
                  <p className="text-xs text-gray-500">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
                <i className="fa-solid fa-credit-card text-xl text-gray-400" />
              </label>

              <label
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                  payment === "cod"
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  className="accent-brand-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when your order arrives</p>
                </div>
                <i className="fa-solid fa-money-bill-wave text-xl text-gray-400" />
              </label>
            </div>
          </section>
        </div>

        <div className="h-fit card p-6">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item._id || product._id} className="flex items-center gap-3">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity} ×{" "}
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            className="mt-6"
            loading={placing}
            disabled={placing}
            onClick={placeOrder}
          >
            {payment === "cod" ? (
              <>
                <i className="fa-solid fa-money-bill" aria-hidden="true" />
                Place Order (COD)
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock" aria-hidden="true" />
                Proceed to Pay
              </>
            )}
          </Button>
          <Link
            to="/cart"
            className="mt-3 block text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
