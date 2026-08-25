import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { STAGE_LABELS } from "../../lib/orders";

function toLocalDateStr(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function todayStr() {
  return toLocalDateStr(new Date());
}

const STATUS_OPTIONS = ["all", "received", "preparing", "ready", "out_for_delivery", "delivered", "completed"];

export default function OwnerHome() {
  const { orders, loading } = useOutletContext();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const isViewingToday = selectedDate === todayStr();
  const dayOrders = orders.filter((o) => toLocalDateStr(o.created_at) === selectedDate);
  const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const activeCount = orders.filter((o) => !["delivered", "completed"].includes(o.status)).length;

  const filteredOrders = dayOrders
    .filter((o) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (o.customer_name || "").toLowerCase().includes(term) ||
        (o.customer_phone || "").includes(term) ||
        o.id.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <div className="flex items-center gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wide">Viewing</label>
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="font-body text-sm bg-white border border-ink/15 rounded-lg px-3 py-1.5 text-ink"
          />
        </div>
      </div>

      {loading ? (
        <p className="font-body text-ink/60">Loading numbers…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label={isViewingToday ? "Orders today" : "Orders that day"} value={dayOrders.length} />
            <StatCard label={isViewingToday ? "Revenue today" : "Revenue that day"} value={"₹" + dayRevenue} />
            <StatCard label="Active orders (now)" value={activeCount} />
          </div>

          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">
              Orders on {isViewingToday ? "today" : selectedDate}
            </h2>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, or order #"
                className="font-body text-sm bg-white border border-ink/15 rounded-lg px-3 py-1.5 text-ink w-56"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="font-body text-sm bg-white border border-ink/15 rounded-lg px-3 py-1.5 text-ink"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All statuses" : STAGE_LABELS[s] || s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-ink/5 divide-y divide-ink/5">
            {filteredOrders.length === 0 && (
              <p className="font-body text-ink/40 text-center py-10">No orders match your search.</p>
            )}
            {filteredOrders.map((order) => {
              const isOpen = expandedId === order.id;
              return (
                <div key={order.id}>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 flex-wrap hover:bg-paper-dim/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-ticket text-sm font-bold text-ink shrink-0">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="font-body text-sm text-ink truncate">{order.customer_name}</span>
                      <span
                        className={
                          "font-body text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 " +
                          (order.order_type === "delivery" ? "bg-chili/10 text-chili" : "bg-leaf/10 text-leaf")
                        }
                      >
                        {order.order_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-body text-xs text-ink/50 capitalize">
                        {STAGE_LABELS[order.status] || order.status}
                      </span>
                      <span className="font-ticket text-sm font-bold text-ink">₹{order.total_amount}</span>
                      <span className="font-body text-xs text-ink/40">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 font-body text-sm text-ink/70">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-ink/40 uppercase tracking-wide mb-0.5">Placed at</p>
                          <p>{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-ink/40 uppercase tracking-wide mb-0.5">Phone</p>
                          <p className="font-ticket">{order.customer_phone}</p>
                        </div>
                        {order.order_type === "delivery" && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-ink/40 uppercase tracking-wide mb-0.5">
                              Delivery address
                            </p>
                            <p>{order.delivery_address}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-ink/40 uppercase tracking-wide mb-1">Items</p>
                      <ul className="space-y-0.5">
                        {(order.order_items || []).map((it, i) => (
                          <li key={i}>
                            {it.quantity} × {it.menu_items?.name || "Item"} — ₹{it.price_at_order}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-ink/5">
      <p className="font-body text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
