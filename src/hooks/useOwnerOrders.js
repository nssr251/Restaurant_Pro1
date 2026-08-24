import { useState, useEffect, useCallback } from "react";
import { fetchAllOrders, fetchOrderWithItems, subscribeToAllOrders } from "../lib/ownerOrders";
import {
  playNewOrderChime,
  showNewOrderNotification,
  getNotificationPermission,
} from "../lib/sound";

export function useOwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

  const upsertOrder = useCallback((updated) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      if (exists) {
        return prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
      }
      return [updated, ...prev];
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Could not load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(
      async (newOrderStub) => {
        playNewOrderChime();
        showNewOrderNotification(newOrderStub);
        try {
          // Realtime payloads don't include joined order_items — fetch the full row
          const full = await fetchOrderWithItems(newOrderStub.id);
          upsertOrder(full);
        } catch {
          upsertOrder(newOrderStub);
        }
      },
      (updatedOrder) => upsertOrder(updatedOrder)
    );
    return unsubscribe;
  }, [upsertOrder]);

  return { orders, loading, error, notificationPermission, setNotificationPermission };
}
