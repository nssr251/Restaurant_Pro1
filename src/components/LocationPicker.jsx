import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Search } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // used only if GPS is unavailable/denied

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Free OpenStreetMap geocoding — light usage only (no key needed), fine at
// small scale but not for heavy/commercial-volume lookups
async function searchAddress(query) {
  const res = await fetch(
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(query)
  );
  const results = await res.json();
  if (results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), name: results[0].display_name };
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng
  );
  const result = await res.json();
  return result.display_name || null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const [fallbackCenter, setFallbackCenter] = useState(DEFAULT_CENTER);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [resolvingName, setResolvingName] = useState(false);
  const lastResolvedRef = useRef(null);

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setFallbackCenter([newLat, newLng]);
        onChange(newLat, newLng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const result = await searchAddress(searchQuery);
      if (!result) {
        setSearchError("Couldn't find that place. Try a more specific search.");
      } else {
        onChange(result.lat, result.lng);
      }
    } catch {
      setSearchError("Search failed. You can still tap the map directly.");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (lat && lng) return; // already have a pin — don't override it with GPS
    locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve a human-readable name whenever the pin settles on a new spot
  useEffect(() => {
    if (!lat || !lng) return;
    const key = lat.toFixed(5) + "," + lng.toFixed(5);
    if (lastResolvedRef.current === key) return;
    lastResolvedRef.current = key;

    setResolvingName(true);
    reverseGeocode(lat, lng)
      .then((name) => setPlaceName(name))
      .catch(() => setPlaceName(null))
      .finally(() => setResolvingName(false));
  }, [lat, lng]);

  const position = lat && lng ? [lat, lng] : fallbackCenter;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search for your address or area…"
            className="w-full bg-white border border-ink/15 rounded-lg pl-8 pr-3 py-2 font-body text-sm text-ink"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="font-body text-xs font-semibold bg-ink text-paper px-3 rounded-lg disabled:opacity-50"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>
      {searchError && <p className="font-body text-xs text-chili mb-2">{searchError}</p>}

      <div className="relative rounded-xl overflow-hidden border border-ink/15" style={{ height: "220px" }}>
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                onChange(m.lat, m.lng);
              },
            }}
          />
          <ClickHandler onPick={onChange} />
          <Recenter lat={position[0]} lng={position[1]} />
        </MapContainer>

        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="absolute top-2.5 right-2.5 z-[1000] bg-white shadow-md rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50"
          aria-label="Use my current location"
        >
          <LocateFixed size={18} className={"text-ink " + (locating ? "animate-pulse" : "")} />
        </button>
      </div>

      <p className="font-body text-xs text-ink/40 mt-1.5">
        Tap the map, drag the pin, use the locate button, or search above.
      </p>

      {(placeName || resolvingName) && (
        <p className="font-body text-xs text-ink font-medium mt-2 bg-paper-dim rounded-lg px-3 py-2">
          📍 {resolvingName ? "Finding the address…" : placeName}
        </p>
      )}
    </div>
  );
}
