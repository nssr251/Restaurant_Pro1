import { useOwnerOrders } from "../../hooks/useOwnerOrders";

function isToday(dateString) {
  const d = new Date(dateString);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export default function OwnerHome() {
  const { orders, loading } = useOwnerOrders();

  const todaysOrders = orders.filter((o) => isToday(o.created_at));
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const activeCount = orders.filter((o) => !["delivered", "completed"].includes(o.status)).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Welcome back</h1>

      {loading ? (
        <p className="font-body text-ink/60">Loading today's numbers…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Orders today" value={todaysOrders.length} />
          <StatCard label="Revenue today" value={`₹${todaysRevenue}`} />
          <StatCard label="Active orders" value={activeCount} />
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
