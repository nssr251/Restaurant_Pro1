export default function MenuItemCard({ item, quantity, onAdd, onDecrement }) {
  return (
    <div className="flex gap-3 bg-paper rounded-2xl p-3 shadow-sm">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-paper-dim shrink-0 flex items-center justify-center text-ink/30 font-display text-2xl">
          {item.name.charAt(0)}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-ink text-base leading-tight">{item.name}</h3>
          {item.description && (
            <p className="font-body text-xs text-ink/60 mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-ticket text-sm font-bold text-ink">₹{item.price}</span>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-ink rounded-full px-1 py-1">
              <button
                onClick={() => onDecrement(item.id)}
                className="w-6 h-6 flex items-center justify-center text-paper font-bold rounded-full hover:bg-ink-light"
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
              <span className="font-ticket text-paper text-sm w-4 text-center">{quantity}</span>
              <button
                onClick={() => onAdd(item)}
                className="w-6 h-6 flex items-center justify-center text-paper font-bold rounded-full hover:bg-ink-light"
                aria-label={`Add one more ${item.name}`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="font-body text-xs font-semibold bg-turmeric text-ink px-3 py-1.5 rounded-full hover:bg-turmeric-dark transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
