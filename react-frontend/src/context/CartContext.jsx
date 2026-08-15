import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";
import { getErrorMessage } from "../utils/helpers";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const { push } = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [] });
      setCount(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      const items = data?.items || [];
      setCart({ items });
      setCount(items.reduce((sum, it) => sum + (it.quantity || 0), 0));
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId, size = "") => {
      if (!token) {
        push("info", "Please login to continue", "Redirecting to login...");
        window.location.href = "/login";
        return;
      }
      try {
        await cartApi.add(productId, size);
        await refreshCart();
        push("success", "Added to cart", "Product added successfully");
      } catch (err) {
        push("error", "Could not add to cart", getErrorMessage(err));
      }
    },
    [token, refreshCart, push],
  );

  const updateQty = useCallback(
    async (productId, size, change) => {
      try {
        await cartApi.updateQty(productId, size, change);
        await refreshCart();
      } catch (err) {
        push("error", "Update failed", getErrorMessage(err));
      }
    },
    [refreshCart, push],
  );

  const removeItem = useCallback(
    async (productId, size) => {
      try {
        await cartApi.remove(productId, size);
        await refreshCart();
        push("info", "Item removed", "Removed from cart");
      } catch (err) {
        push("error", "Remove failed", getErrorMessage(err));
      }
    },
    [refreshCart, push],
  );

  const clearCart = useCallback(() => {
    setCart({ items: [] });
    setCount(0);
  }, []);

  const subtotal = cart.items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ cart, count, loading, subtotal, refreshCart, addToCart, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
