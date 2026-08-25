import { STAGE_LABELS } from "../../lib/orders";
import { timeAgo } from "../../lib/time";
import { FEATURES } from "../../config";

const ACTION_LABELS = {
  preparing: "Start preparing",
  ready: "Mark ready",
  out_for_delivery: "Send for delivery",
  delivered: "Mark delivered",
  completed: "Mark completed",
};

export default function OrderCard({ order, nextStatus, onAdvance, advancing, riders, onAssignRider }) {
  const items = order.order_items || [];
  const assignedRider = riders?.find((r) => r.id === order.rider_id);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-ink/5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-ticket text-sm font-bold text-ink">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
        <span className="font-body text-xs text-ink/40">{timeAgo(order.created_at)}</span>
      </div>

      <p className="font-body text-sm font-semibold text-ink">{order.customer_name}</p>
      <p className="font-ticket text-xs text-ink/50 mb-2">{order.customer_phone}</p>

      <span
        className={`inline-block font-body text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full mb-2 ${
          order.order_type === "delivery" ? "bg-chili/10 text-chili" : "bg-leaf/10 text-leaf"
        }`}
      >
        {order.order_type}
      </span>

      <ul className="font-body text-xs text-ink/70 space-y-0.5 mb-3">
        {items.map((it, i) => (
          <li key={i}>
            {it.quantity} × {it.menu_items?.name || "Item"}
          </li>
        ))}
      </ul>

      {FEATURES.riderTracking &&
        order.order_type === "delivery" &&
        !["delivered", "completed"].includes(order.status) && (
        <div className="mb-3">
          {assignedRider ? (
            <p className="font-body text-xs text-ink/60">
              Rider: <span className="font-semibold">{assignedRider.name}</span>
            </p>
          ) : (
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onAssignRider(order, e.target.value);
              }}
              className="w-full font-body text-xs border border-ink/15 rounded-lg px-2 py-1.5 text-ink"
            >
              <option value="" disabled>
                Assign rider…
              </option>
              {(riders || []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.status})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-ink/10">
        <span className="font-ticket text-sm font-bold text-ink">₹{order.total_amount}</span>
        {nextStatus && (
          <button
            onClick={() => onAdvance(order)}
            disabled={advancing}
            className="font-body text-xs font-semibold bg-turmeric text-ink px-3 py-1.5 rounded-full disabled:opacity-40 hover:bg-turmeric-dark transition-colors"
          >
            {advancing ? "Updating…" : ACTION_LABELS[nextStatus] || `Mark ${STAGE_LABELS[nextStatus]}`}
          </button>
        )}
      </div>
    </div>
  );
}
