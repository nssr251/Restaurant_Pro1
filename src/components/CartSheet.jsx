export function CartPill({ itemCount, total, onOpen }) {
  if (itemCount === 0) return null;
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-5 left-5 right-5 z-30 bg-chili text-paper rounded-2xl px-5 py-4 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.35)] font-body font-semibold"
    >
      <span>{itemCount} item{itemCount > 1 ? "s" : ""} in cart</span>
      <span className="font-ticket">₹{total} · View cart</span>
    </button>
  );
}

export default function CartSheet({ cart, total, onClose, onAdd, onDecrement, onCheckout }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-paper rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-ink/10">
          <h2 className="font-display text-xl font-semibold text-ink">Your order</h2>
          <button onClick={onClose} className="text-ink/50 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {cart.length === 0 ? (
            <p className="font-body text-ink/50 text-center py-8">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{item.name}</p>
                  <p className="font-ticket text-xs text-ink/50">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2 bg-ink rounded-full px-1 py-1">
                  <button
                    onClick={() => onDecrement(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-paper font-bold rounded-full"
                  >
                    −
                  </button>
                  <span className="font-ticket text-paper text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-6 h-6 flex items-center justify-center text-paper font-bold rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-ink/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body font-semibold text-ink">Total</span>
              <span className="font-ticket font-bold text-ink text-lg">₹{total}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-turmeric text-ink font-body font-bold py-3 rounded-xl hover:bg-turmeric-dark transition-colors"
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
