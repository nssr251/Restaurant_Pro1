import { useState } from "react";
import { ORDER_STAGES, STAGE_LABELS } from "../lib/orders";
import DeliveryMap from "./DeliveryMap";
import { useRouteInfo } from "../hooks/useRouteInfo";
import { unlockAlerts, getNotificationPermission } from "../lib/sound";

export default function OrderTicket({ order, rider, onNewOrder, onCancel, restaurantInfo }) {
  const [cancelling, setCancelling] = useState(false);
  const stages = ORDER_STAGES[order.order_type] || ORDER_STAGES.pickup;
  const currentIndex = stages.indexOf(order.status);
  const shortId = order.id.slice(0, 8).toUpperCase();
  const [alertPermission, setAlertPermission] = useState(getNotificationPermission());

  async function handleEnableAlerts() {
    const result = await unlockAlerts();
    setAlertPermission(result);
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await onCancel(order.id);
    } catch (err) {
      alert(err.message || "Could not cancel the order. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  const { info: routeInfo } = useRouteInfo(
    rider?.current_lat,
    rider?.current_lng,
    order.delivery_lat,
    order.delivery_lng
  );

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm bg-paper rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
        {restaurantInfo?.name && (
          <div className="text-center px-6 pt-5 pb-3 border-b border-dashed border-ink/15">
            <p className="font-ticket text-sm font-bold text-ink">{restaurantInfo.name}</p>
            {restaurantInfo.address && (
              <p className="font-ticket text-[11px] text-ink/50 mt-0.5">{restaurantInfo.address}</p>
            )}
            {restaurantInfo.contact_phone && (
              <p className="font-ticket text-[11px] text-ink/50">{restaurantInfo.contact_phone}</p>
            )}
          </div>
        )}

        {/* Perforated header strip */}
        <div className="bg-ink text-paper px-6 py-5 relative">
          <p className="font-ticket text-xs text-paper/50 tracking-widest uppercase">Order Ticket</p>
          <p className="font-ticket text-2xl font-bold tracking-wider mt-1">#{shortId}</p>
        </div>
        <div
          className="h-3 bg-ink"
          style={{
            maskImage:
              "radial-gradient(circle 6px at 12px 0, transparent 98%, black 100%), radial-gradient(circle 6px at 36px 0, transparent 98%, black 100%), radial-gradient(circle 6px at 60px 0, transparent 98%, black 100%), radial-gradient(circle 6px at 84px 0, transparent 98%, black 100%), radial-gradient(circle 6px at 108px 0, transparent 98%, black 100%), radial-gradient(circle 6px at 132px 0, transparent 98%, black 100%)",
            maskRepeat: "repeat-x",
            maskSize: "24px 12px",
          }}
        />

        <div className="px-6 py-6">
          {alertPermission !== "granted" && alertPermission !== "unsupported" && (
            <button
              onClick={handleEnableAlerts}
              className="w-full mb-4 font-body text-xs font-semibold bg-turmeric/10 text-turmeric border border-turmeric/30 rounded-xl py-2"
            >
              {alertPermission === "denied"
                ? "Notifications blocked — check browser site settings"
                : "🔔 Get notified when your order status changes"}
            </button>
          )}

          <p className="font-body text-xs text-ink/50 uppercase tracking-wide mb-4">
            {order.order_type === "delivery" ? "Delivery order" : "Pickup order"}
          </p>

          {order.status === "cancelled" ? (
            <div className="bg-chili/10 border border-chili/20 rounded-xl px-4 py-4 text-center">
              <p className="font-body font-semibold text-chili">This order was cancelled</p>
            </div>
          ) : (
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const done = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-ticket text-xs ${
                      done ? "bg-leaf text-paper" : "bg-ink/10 text-ink/30"
                    } ${isCurrent ? "ring-2 ring-turmeric ring-offset-2 ring-offset-paper" : ""}`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span
                    className={`font-body text-sm ${
                      done ? "text-ink font-semibold" : "text-ink/40"
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
              );
            })}
          </div>
          )}

          {order.status === "out_for_delivery" && rider && (
            <div className="mt-6 pt-4 border-t border-dashed border-ink/20">
              <p className="font-body text-xs text-ink/50 uppercase tracking-wide mb-1">
                Your delivery partner
              </p>
              <p className="font-body font-semibold text-ink">{rider.name}</p>
              {rider.phone && <p className="font-ticket text-sm text-ink/60">{rider.phone}</p>}

              {rider.current_lat && rider.current_lng && (
                <div className="mt-3">
                  <DeliveryMap lat={rider.current_lat} lng={rider.current_lng} riderName={rider.name} />
                </div>
              )}

              {routeInfo && (
                <p className="font-body text-sm text-ink/70 mt-2">
                  <span className="font-semibold text-ink">{routeInfo.distanceKm.toFixed(1)} km away</span>
                  {" · ~"}
                  {Math.round(routeInfo.durationMin)} min to reach you
                </p>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between">
            <span className="font-body text-sm text-ink/60">Total</span>
            <span className="font-ticket font-bold text-ink">₹{order.total_amount}</span>
          </div>

          {!["delivered", "completed", "cancelled", "out_for_delivery"].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full mt-4 font-body text-xs text-chili/70 hover:text-chili disabled:opacity-40"
            >
              {cancelling ? "Cancelling…" : "Cancel this order"}
            </button>
          )}
        </div>
      </div>

      {(order.status === "delivered" || order.status === "completed" || order.status === "cancelled") && (
        <button
          onClick={onNewOrder}
          className="mt-6 font-body text-paper/70 text-sm underline"
        >
          Place another order
        </button>
      )}
    </div>
  );
}
