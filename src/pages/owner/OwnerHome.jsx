import { useState } from "react";
import { useOwnerOrders } from "../../hooks/useOwnerOrders";

function toLocalDateStr(dateInput) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr() {
  return toLocalDateStr(new Date());
}

export default function OwnerHome() {
  const { orders, loading } = useOwnerOrders();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const isViewingToday = selectedDate === todayStr();
  const dayOrders = orders.filter((o) => toLocalDateStr(o.created_at) === selectedDate);
  const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const activeCount = orders.filter((o) => !["delivered", "completed"].includes(o.status)).length;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label={isViewingToday ? "Orders today" : "Orders that day"} value={dayOrders.length} />
          <StatCard label={isViewingToday ? "Revenue today" : "Revenue that day"} value={`₹${dayRevenue}`} />
          <StatCard label="Active orders (now)" value={activeCount} />
        </div>
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
