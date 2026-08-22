import { isRestaurantOpen, formatTime } from "../lib/hours";

export default function WelcomeScreen({ restaurantInfo, onEnter }) {
  const open = isRestaurantOpen(restaurantInfo.opens_at, restaurantInfo.closes_at);
  const hasHours = restaurantInfo.opens_at && restaurantInfo.closes_at;
  const mapsUrl = restaurantInfo.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantInfo.address)}`
    : null;

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
      {restaurantInfo.logo_url ? (
        <img
          src={restaurantInfo.logo_url}
          alt={restaurantInfo.name}
          className="w-24 h-24 rounded-full object-cover mb-5 border-2 border-turmeric/40"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-paper/10 border-2 border-turmeric/40 flex items-center justify-center mb-5">
          <span className="font-display text-3xl text-turmeric">{restaurantInfo.name?.charAt(0)}</span>
        </div>
      )}

      <p className="font-ticket text-xs text-turmeric tracking-[0.2em] uppercase mb-3">Welcome to</p>
      <h1 className="font-display text-4xl font-semibold text-paper mb-2">{restaurantInfo.name}</h1>
      {restaurantInfo.tagline && (
        <p className="font-body text-paper/60 text-sm mb-2">{restaurantInfo.tagline}</p>
      )}

      {hasHours && (
        <p className="font-body text-paper/40 text-xs mb-6">
          {open ? "Open now" : "Closed"} · {formatTime(restaurantInfo.opens_at)} – {formatTime(restaurantInfo.closes_at)}
        </p>
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
          <p className="font-body font-semibold text-chili">We're currently closed</p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        {restaurantInfo.contact_phone && (
          
           href={`tel:${restaurantInfo.contact_phone}`}
            className="font-body text-xs text-paper/50 underline underline-offset-2"
          >
            Call {restaurantInfo.contact_phone}
          </a>
        )}
        {mapsUrl && (
          
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="font-body text-xs text-paper/50 underline underline-offset-2"
          >
            Get Directions
          </a>
        )}
      </div>
    </div>
  );
}
