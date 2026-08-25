import { useState } from "react";
import { fetchOrdersByPhone } from "../lib/orders";

export default function TrackOrderSearch({ onBack, onSelectOrder }) {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersByPhone(phone.trim());
      setResults(data);
    } catch (err) {
      setError(err.message || "Could not search for orders.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink px-5 py-8">
      <button onClick={onBack} className="font-body text-paper/60 text-sm mb-4">
        ← Back
      </button>
      <h1 className="font-display text-2xl font-semibold text-paper mb-2">Track Your Order</h1>
      <p className="font-body text-paper/50 text-sm mb-6">
        Enter the phone number you used when ordering.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile number"
          required
          className="flex-1 bg-paper border border-paper/20 rounded-xl px-4 py-3 font-body text-ink"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-turmeric text-ink font-body font-bold px-5 rounded-xl disabled:opacity-40"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {error && <p className="font-body text-chili text-sm mb-4">{error}</p>}

      {results && results.length === 0 && (
        <p className="font-body text-paper/40 text-center py-8">No orders found for that number.</p>
      )}

      <div className="space-y-3">
        {results &&
          results.map((order) => (
            <button
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="w-full text-left bg-paper rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-ticket text-sm font-bold text-ink">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="font-body text-xs text-ink/40 capitalize">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="font-body text-xs text-ink/50">
                {new Date(order.created_at).toLocaleString()} · ₹{order.total_amount}
              </p>
            </button>
          ))}
      </div>
    </div>
  );
}
