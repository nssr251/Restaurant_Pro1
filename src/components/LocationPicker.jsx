import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export default function LocationPicker({ lat, lng, onChange }) {
  const [fallbackCenter, setFallbackCenter] = useState(DEFAULT_CENTER);

  useEffect(() => {
    if (lat && lng) return; // already have a pin — don't override it with GPS
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setFallbackCenter([newLat, newLng]);
        onChange(newLat, newLng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = lat && lng ? [lat, lng] : fallbackCenter;

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-ink/15" style={{ height: "220px" }}>
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
      </div>
      <p className="font-body text-xs text-ink/40 mt-1.5">
        Tap anywhere on the map or drag the pin to your exact delivery spot.
      </p>
    </div>
  );
}
