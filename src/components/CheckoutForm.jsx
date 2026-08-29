import { useState } from "react";
import LocationPicker from "./LocationPicker";

export default function CheckoutForm({ total, onBack, onSubmit, submitting, upiAvailable }) {
  const [orderType, setOrderType] = useState("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState(null);
  const [deliveryLng, setDeliveryLng] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const isValid =
    customerName.trim().length > 1 &&
    customerPhone.trim().length >= 10 &&
    (orderType === "pickup" || deliveryAddress.trim().length > 4);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      customerName,
      customerPhone,
      orderType,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      paymentMethod,
    });
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
                className={
                  "flex-1 py-2.5 rounded-xl font-body font-semibold capitalize border transition-colors " +
                  (orderType === type
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink border-ink/20")
                }
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
              Delivery address (for reference)
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
              rows={2}
              placeholder="House/flat no., street, landmark"
            />

            <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide mt-4 block mb-1.5">
              Pin your exact delivery spot
            </label>
            <LocationPicker
              lat={deliveryLat}
              lng={deliveryLng}
              onChange={(lat, lng) => {
                setDeliveryLat(lat);
                setDeliveryLng(lng);
              }}
            />
          </div>
        )}

        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            Payment
          </label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={
                "flex-1 py-2.5 rounded-xl font-body font-semibold border transition-colors " +
                (paymentMethod === "cod"
                  ? "bg-ink text-paper border-ink"
                  : "bg-transparent text-ink border-ink/20")
              }
            >
              Cash {orderType === "pickup" ? "at counter" : "on delivery"}
            </button>
            {upiAvailable && (
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={
                  "flex-1 py-2.5 rounded-xl font-body font-semibold border transition-colors " +
                  (paymentMethod === "upi"
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink border-ink/20")
                }
              >
                Pay Now (UPI)
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-ink/10">
          <span className="font-body font-semibold text-ink">Total</span>
          <span className="font-ticket font-bold text-ink text-lg">₹{total}</span>
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full bg-turmeric text-ink font-body font-bold py-3.5 rounded-xl disabled:opacity-40 hover:bg-turmeric-dark transition-colors"
        >
          {submitting
            ? "Placing order…"
            : paymentMethod === "upi"
            ? "Continue to Payment"
            : "Place Order"}
        </button>
      </form>
    </div>
  );
}
