import { useState } from "react";

export default function CheckoutForm({ total, onBack, onSubmit, submitting }) {
  const [orderType, setOrderType] = useState("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const isValid =
    customerName.trim().length > 1 &&
    customerPhone.trim().length >= 10 &&
    (orderType === "pickup" || deliveryAddress.trim().length > 4);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ customerName, customerPhone, orderType, deliveryAddress });
  }

  return (
    <div className="min-h-screen bg-paper px-5 pt-6 pb-10">
      <button onClick={onBack} className="font-body text-ink/60 text-sm mb-4">
        ← Back to menu
      </button>
      <h2 className="font-display text-2xl font-semibold text-ink mb-6">Checkout</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            How would you like your order?
          </label>
          <div className="flex gap-2 mt-2">
            {["pickup", "delivery"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2.5 rounded-xl font-body font-semibold capitalize border transition-colors ${
                  orderType === type
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink border-ink/20"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            Your name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            Phone number
          </label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            type="tel"
            className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
            placeholder="10-digit mobile number"
          />
        </div>

        {orderType === "delivery" && (
          <div>
            <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
              rows={3}
              placeholder="House/flat no., street, landmark"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-ink/10">
          <span className="font-body font-semibold text-ink">Total to pay</span>
          <span className="font-ticket font-bold text-ink text-lg">₹{total}</span>
        </div>
        <p className="font-body text-xs text-ink/50 -mt-3">
          Pay at {orderType === "pickup" ? "counter" : "delivery"} for now — online payment coming soon.
        </p>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full bg-turmeric text-ink font-body font-bold py-3.5 rounded-xl disabled:opacity-40 hover:bg-turmeric-dark transition-colors"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
