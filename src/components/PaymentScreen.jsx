import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { switchOrderToCOD } from "../lib/orders";

export default function PaymentScreen({ order, restaurantName, upiId, onContinue }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [switching, setSwitching] = useState(false);

  // Include the customer's name alongside the order number in the payment note —
  // this is what lets the owner tell apart two same-amount orders in their bank app
  const noteText = "Order " + order.id.slice(0, 8).toUpperCase() + " - " + (order.customer_name || "");

  const upiUri =
    "upi://pay?pa=" + encodeURIComponent(upiId) +
    "&pn=" + encodeURIComponent(restaurantName) +
    "&am=" + order.total_amount +
    "&cu=INR" +
    "&tn=" + encodeURIComponent(noteText);

  useEffect(() => {
    QRCode.toDataURL(upiUri, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [upiUri]);

  async function handleSwitchToCOD() {
    setSwitching(true);
    try {
      await switchOrderToCOD(order.id);
      onContinue();
    } catch (err) {
      alert(err.message || "Could not switch to cash. Please try again.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-sm bg-paper rounded-2xl p-6 text-center">
        <p className="font-ticket text-xs text-ink/50 uppercase tracking-widest mb-1">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Pay ₹{order.total_amount}</h2>
        <p className="font-body text-sm text-ink/60 mb-6">via any UPI app</p>

        {qrDataUrl && (
          <img src={qrDataUrl} alt="UPI payment QR code" className="mx-auto rounded-xl mb-4" />
        )}

        <a
          href={upiUri}
          className="block w-full bg-turmeric text-ink font-body font-bold py-3 rounded-xl mb-3 hover:bg-turmeric-dark transition-colors"
        >
          Pay with UPI app
        </a>
        <p className="font-body text-xs text-ink/40 mb-6">
          On this phone: tap "Pay with UPI app" above. On another device: scan the QR code with any
          UPI app.
        </p>

        <button
          onClick={onContinue}
          className="w-full bg-leaf text-paper font-body font-bold py-3 rounded-xl hover:bg-leaf-dark transition-colors mb-3"
        >
          I've Paid — Continue
        </button>

        <button
          onClick={handleSwitchToCOD}
          disabled={switching}
          className="w-full font-body text-sm text-ink/50 underline underline-offset-2 disabled:opacity-50"
        >
          {switching ? "Switching…" : "Having trouble paying? Pay with cash instead"}
        </button>

        <p className="font-body text-xs text-ink/40 mt-3">
          The restaurant will confirm your payment shortly.
        </p>
      </div>
    </div>
  );
}
