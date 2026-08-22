import { isRestaurantOpen, formatTime } from "../lib/hours";

export default function WelcomeScreen({ restaurantInfo, onEnter }) {
  const open = isRestaurantOpen(restaurantInfo.opens_at, restaurantInfo.closes_at);

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
      <p className="font-ticket text-xs text-turmeric tracking-[0.2em] uppercase mb-3">Welcome to</p>
      <h1 className="font-display text-4xl font-semibold text-paper mb-2">{restaurantInfo.name}</h1>
      {restaurantInfo.tagline && (
        <p className="font-body text-paper/60 text-sm mb-8">{restaurantInfo.tagline}</p>
      )}

      {open ? (
        <button
          onClick={onEnter}
          className="bg-turmeric text-ink font-body font-bold px-8 py-3.5 rounded-xl hover:bg-turmeric-dark transition-colors"
        >
          Order Now
        </button>
      ) : (
        <div className="bg-paper/10 border border-paper/20 rounded-xl px-6 py-4 max-w-xs">
          <p className="font-body font-semibold text-chili mb-1">We're currently closed</p>
          {restaurantInfo.opens_at && restaurantInfo.closes_at && (
            <p className="font-body text-paper/60 text-sm">
              Open {formatTime(restaurantInfo.opens_at)} – {formatTime(restaurantInfo.closes_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
