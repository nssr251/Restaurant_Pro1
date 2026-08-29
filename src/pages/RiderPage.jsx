import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  fetchRiderById,
  fetchRiderActiveOrders,
  fetchRiderDeliveryHistory,
  subscribeToRiderOrders,
  updateRiderLocation,
  riderAdvanceOrder,
} from "../lib/rider";
import { playAlertSound, unlockAlerts, getNotificationPermission, showNotification } from "../lib/sound";
import { useRouteInfo } from "../hooks/useRouteInfo";
import DeliveryMap from "../components/DeliveryMap";

function buildNavigationUrl(order) {
  if (order.delivery_lat && order.delivery_lng) {
    return "https://www.google.com/maps/dir/?api=1&destination=" + order.delivery_lat + "," + order.delivery_lng;
  }
  if (order.delivery_address) {
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(order.delivery_address);
  }
  return null;
}

function RiderOrderCard({ order, riderLat, riderLng, onStartDelivery, onMarkDelivered }) {
  const { info: routeInfo } = useRouteInfo(riderLat, riderLng, order.delivery_lat, order.delivery_lng);
  const navUrl = buildNavigationUrl(order);

  return (
    <div className="bg-paper rounded-2xl p-4">
      <p className="font-ticket text-xs text-ink/50 mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
      <p className="font-body font-semibold text-ink">{order.customer_name}</p>
      <p className="font-ticket text-sm text-ink/60 mb-2">{order.customer_phone}</p>
      {order.delivery_address && (
        <p className="font-body text-sm text-ink/70 mb-1 line-clamp-2">{order.delivery_address}</p>
      )}

      {routeInfo && (
        <p className="font-body text-xs text-leaf font-semibold mb-2">
          {routeInfo.distanceKm.toFixed(1)} km · ~{Math.round(routeInfo.durationMin)} min away
        </p>
      )}

      {order.delivery_lat && order.delivery_lng && (
        <div className="mb-3">
          <DeliveryMap
            lat={order.delivery_lat}
            lng={order.delivery_lng}
            riderName="Customer's location"
            height={160}
          />
        </div>
      )}

      {navUrl && (
        <a
          href={navUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-body text-xs font-semibold text-ink border border-ink/20 rounded-lg px-3 py-1.5 mb-3"
        >
          🧭 Navigate to customer
        </a>
      )}

      <ul className="font-body text-xs text-ink/60 space-y-0.5 mb-3">
        {(order.order_items || []).map((it, i) => (
          <li key={i}>
            {it.quantity} × {it.menu_items?.name || "Item"}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between pt-2 border-t border-ink/10 mb-3">
        <span className="font-body text-xs text-ink/50 uppercase tracking-wide">
          {order.status.replace(/_/g, " ")}
        </span>
        <span className="font-ticket font-bold text-ink">₹{order.total_amount}</span>
      </div>

      {order.status === "ready" && (
        <button
          onClick={() => onStartDelivery(order)}
          className="w-full bg-turmeric text-ink font-body font-bold py-2.5 rounded-xl"
        >
          Start Delivery
        </button>
      )}
      {order.status === "out_for_delivery" && (
        <button
          onClick={() => onMarkDelivered(order)}
          className="w-full bg-leaf text-paper font-body font-bold py-2.5 rounded-xl"
        >
          Mark Delivered
        </button>
      )}
    </div>
  );
}

function formatDuration(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  const mins = Math.round((new Date(toIso) - new Date(fromIso)) / 60000);
  if (mins < 1) return "under a minute";
  if (mins < 60) return mins + " min";
  return Math.floor(mins / 60) + " hr " + (mins % 60) + " min";
}

function DeliveryHistory({ history }) {
  if (history.length === 0) {
    return <p className="font-body text-paper/40 text-sm py-4">No completed deliveries yet.</p>;
  }
  return (
    <div className="space-y-2">
      {history.map((order) => {
        const duration = formatDuration(order.ready_at || order.created_at, order.delivered_at);
        return (
          <div key={order.id} className="bg-paper rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-ink">{order.customer_name}</p>
              <p className="font-body text-xs text-ink/50">
                {new Date(order.delivered_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              {duration && (
                <p className="font-ticket text-xs font-semibold text-leaf">{duration}</p>
              )}
              <p className="font-ticket text-xs text-ink/50">₹{order.total_amount}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RiderPage() {
  const { riderId } = useParams();
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [riderPosition, setRiderPosition] = useState({ lat: null, lng: null });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [alertPermission, setAlertPermission] = useState(getNotificationPermission());
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);
  const knownOrderIdsRef = useRef(new Set());

  const load = useCallback(async () => {
    try {
      const [r, o] = await Promise.all([fetchRiderById(riderId), fetchRiderActiveOrders(riderId)]);
      setRider(r);

      // Detect newly-assigned orders (weren't in the list before) to alert the rider
      const newOnes = o.filter((order) => !knownOrderIdsRef.current.has(order.id));
      if (knownOrderIdsRef.current.size > 0 && newOnes.length > 0) {
        playAlertSound();
        newOnes.forEach((order) => {
          showNotification(
            "New delivery assigned",
            (order.customer_name || "A customer") + " · ₹" + order.total_amount,
            "rider-order-" + order.id
          );
        });
      }
      knownOrderIdsRef.current = new Set(o.map((order) => order.id));

      setOrders(o);
    } catch (err) {
      setError(err.message || "Could not load your deliveries.");
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeToRiderOrders(riderId, () => load());
    return unsubscribe;
  }, [riderId, load]);

  // Start/stop GPS sharing based on whether any order is actively out for delivery
  useEffect(() => {
    const hasActiveDelivery = orders.some((o) => o.status === "out_for_delivery");

    if (hasActiveDelivery && !watchIdRef.current) {
      if (!navigator.geolocation) {
        setLocationError("Location isn't supported on this device/browser.");
        return;
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setRiderPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          const now = Date.now();
          if (now - lastSentRef.current < 8000) return; // throttle to roughly every 8s
          lastSentRef.current = now;
          updateRiderLocation(riderId, pos.coords.latitude, pos.coords.longitude).catch((err) => {
            setLocationError(
              "Location isn't saving (" + (err.message || "unknown error") + "). Tell the restaurant."
            );
          });
        },
        () => setLocationError("Couldn't get your location. Please allow location access and reload."),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      setTracking(true);
    }

    if (!hasActiveDelivery && watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setTracking(false);
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [orders, riderId]);

  async function loadHistory() {
    if (historyLoaded) {
      setShowHistory((v) => !v);
      return;
    }
    try {
      const data = await fetchRiderDeliveryHistory(riderId);
      setHistory(data);
      setHistoryLoaded(true);
      setShowHistory(true);
    } catch {
      alert("Could not load delivery history.");
    }
  }

  async function handleEnableAlerts() {
    const result = await unlockAlerts();
    setAlertPermission(result);
  }

  async function handleStartDelivery(order) {
    try {
      await riderAdvanceOrder(order.id, riderId, "out_for_delivery");
      await load();
    } catch (err) {
      alert(err.message || "Could not start delivery.");
    }
  }

  async function handleMarkDelivered(order) {
    try {
      await riderAdvanceOrder(order.id, riderId, "delivered");
      await load();
    } catch (err) {
      alert(err.message || "Could not mark as delivered.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-body text-paper/60">Loading…</p>
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6 text-center">
        <p className="font-body text-paper/60">{error || "Rider not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-5 py-8">
      <h1 className="font-display text-2xl font-semibold text-paper mb-1">Hi, {rider.name}</h1>
      <p className="font-body text-sm text-paper/50 mb-4">
        {tracking ? "Sharing your location live" : "Not currently sharing location"}
      </p>

      {alertPermission !== "granted" && alertPermission !== "unsupported" && (
        <button
          onClick={handleEnableAlerts}
          className="w-full mb-4 font-body text-sm font-semibold bg-turmeric/20 text-turmeric border border-turmeric/30 rounded-xl py-2.5"
        >
          {alertPermission === "denied"
            ? "Notifications blocked — check browser site settings"
            : "🔔 Enable sound & notifications for new orders"}
        </button>
      )}

      {locationError && (
        <p className="font-body text-xs text-chili bg-chili/10 rounded-lg px-3 py-2 mb-4">
          {locationError}
        </p>
      )}

      {orders.length === 0 && (
        <p className="font-body text-paper/40 text-center py-10">No deliveries assigned right now.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <RiderOrderCard
            key={order.id}
            order={order}
            riderLat={riderPosition.lat}
            riderLng={riderPosition.lng}
            onStartDelivery={handleStartDelivery}
            onMarkDelivered={handleMarkDelivered}
          />
        ))}
      </div>

      <button
        onClick={loadHistory}
        className="w-full mt-8 font-body text-sm text-paper/60 underline underline-offset-2"
      >
        {showHistory ? "Hide" : "View"} my delivery history
      </button>

      {showHistory && (
        <div className="mt-4">
          <DeliveryHistory history={history} />
        </div>
      )}
    </div>
  );
}
