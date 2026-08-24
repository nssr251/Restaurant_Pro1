import { ORDER_STAGES, STAGE_LABELS } from "../lib/orders";
import DeliveryMap from "./DeliveryMap";

export default function OrderTicket({ order, rider, onNewOrder }) {
  const stages = ORDER_STAGES[order.order_type] || ORDER_STAGES.pickup;
  const currentIndex = stages.indexOf(order.status);
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm bg-paper rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
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
          <p className="font-body text-xs text-ink/50 uppercase tracking-wide mb-4">
            {order.order_type === "delivery" ? "Delivery order" : "Pickup order"}
          </p>

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
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between">
            <span className="font-body text-sm text-ink/60">Total</span>
            <span className="font-ticket font-bold text-ink">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {(order.status === "delivered" || order.status === "completed") && (
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
