import { useState, useEffect, useCallback } from "react";
import { useOwnerOrders } from "../../hooks/useOwnerOrders";
import { advanceOrderStatus, assignRiderToOrder } from "../../lib/ownerOrders";
import { fetchAllRiders } from "../../lib/ownerRiders";
import { ORDER_STAGES } from "../../lib/orders";
import OrderCard from "../../components/owner/OrderCard";

const COLUMNS = [
  { key: "received", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
];

function isToday(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function nextStatusFor(order) {
  const stages = ORDER_STAGES[order.order_type] || ORDER_STAGES.pickup;
  const idx = stages.indexOf(order.status);
  return stages[idx + 1] || null;
}

export default function OwnerOrders() {
  const { orders, loading, error } = useOwnerOrders();
  const [advancingId, setAdvancingId] = useState(null);
  const [riders, setRiders] = useState([]);

  const loadRiders = useCallback(async () => {
    try {
      const data = await fetchAllRiders();
      setRiders(data);
    } catch {
      // Non-fatal — the order queue still works without the rider list loaded
    }
  }, []);

  useEffect(() => {
    loadRiders();
  }, [loadRiders]);

  async function handleAdvance(order) {
    setAdvancingId(order.id);
    try {
      await advanceOrderStatus(order);
    } catch (err) {
      alert(err.message || "Could not update the order. Please try again.");
    } finally {
      setAdvancingId(null);
    }
  }

  async function handleAssignRider(order, riderId) {
    try {
      await assignRiderToOrder(order.id, riderId);
      await loadRiders();
    } catch (err) {
      alert(err.message || "Could not assign the rider. Please try again.");
    }
  }

  if (loading) return <p className="font-body text-ink/60">Loading orders…</p>;
  if (error) return <p className="font-body text-chili">{error}</p>;

  const activeOrders = orders.filter((o) => !["delivered", "completed"].includes(o.status));
  const completedTodayCount = orders.filter(
    (o) => ["delivered", "completed"].includes(o.status) && isToday(o.created_at)
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Live Orders</h1>
        <span className="font-body text-sm text-ink/50">{completedTodayCount} completed today</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = activeOrders.filter((o) => o.status === col.key);
          return (
            <div key={col.key}>
              <h2 className="font-body text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
                {col.label} ({colOrders.length})
              </h2>
              <div className="space-y-3">
                {colOrders.length === 0 && (
                  <p className="font-body text-xs text-ink/30 italic">No orders</p>
                )}
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    nextStatus={nextStatusFor(order)}
                    onAdvance={handleAdvance}
                    advancing={advancingId === order.id}
                    riders={riders}
                    onAssignRider={handleAssignRider}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
