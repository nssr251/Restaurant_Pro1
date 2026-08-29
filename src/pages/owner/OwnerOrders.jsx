import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { advanceOrderStatus, assignRiderToOrder, confirmPayment } from "../../lib/ownerOrders";
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
  const { orders, loading, error } = useOutletContext();
  const [advancingId, setAdvancingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [riders, setRiders] = useState([]);
  const [ridersError, setRidersError] = useState(null);

  const loadRiders = useCallback(async () => {
    try {
      const data = await fetchAllRiders();
      setRiders(data);
      setRidersError(null);
    } catch (err) {
      setRidersError(err.message || "Could not load riders.");
      console.error("Failed to load riders:", err);
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

  async function handleConfirmPayment(order) {
    setConfirmingId(order.id);
    try {
      await confirmPayment(order.id);
    } catch (err) {
      alert(err.message || "Could not confirm payment. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) return <p className="font-body text-ink/60">Loading orders…</p>;
  if (error) return <p className="font-body text-chili">{error}</p>;

  const activeOrders = orders.filter((o) => !["delivered", "completed"].includes(o.status));
  const pendingPayment = activeOrders.filter((o) => o.payment_status === "awaiting_confirmation");
  const confirmedOrders = activeOrders.filter((o) => o.payment_status !== "awaiting_confirmation");
  const completedTodayCount = orders.filter(
    (o) => ["delivered", "completed"].includes(o.status) && isToday(o.created_at)
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">Live Orders</h1>
        <span className="font-body text-sm text-ink/50">{completedTodayCount} completed today</span>
      </div>

      {ridersError && (
        <p className="font-body text-xs text-chili bg-chili/5 border border-chili/20 rounded-lg px-3 py-2 mb-4">
          Riders couldn't be loaded ({ridersError}) — rider assignment won't show until this is fixed.
        </p>
      )}

      {pendingPayment.length > 0 && (
        <div className="mb-8">
          <h2 className="font-body text-xs font-semibold text-turmeric uppercase tracking-wide mb-3">
            ⏳ Awaiting Payment Confirmation ({pendingPayment.length}) — not yet in the kitchen queue
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendingPayment.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                nextStatus={null}
                onAdvance={handleAdvance}
                advancing={advancingId === order.id}
                riders={riders}
                onAssignRider={handleAssignRider}
                onConfirmPayment={handleConfirmPayment}
                confirmingPayment={confirmingId === order.id}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colOrders = confirmedOrders.filter((o) => o.status === col.key);
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
                    onConfirmPayment={handleConfirmPayment}
                    confirmingPayment={confirmingId === order.id}
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
