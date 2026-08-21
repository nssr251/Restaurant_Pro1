import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "restaurant_cart_v1";

export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((menuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) => (i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }, []);

  const decrementItem = useCallback((menuItemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setCart((prev) => prev.filter((i) => i.id !== menuItemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const itemCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  return { cart, addItem, decrementItem, removeItem, clearCart, itemCount, total };
}
