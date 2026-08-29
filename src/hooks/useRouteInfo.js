import { useState, useEffect, useRef } from "react";
import { getRouteInfo } from "../lib/routing";

const MIN_INTERVAL_MS = 25000; // never call the routing API more than once per ~25s

export function useRouteInfo(fromLat, fromLng, toLat, toLng) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    if (fromLat == null || fromLng == null || toLat == null || toLng == null) {
      setInfo(null);
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < MIN_INTERVAL_MS) return;
    lastFetchRef.current = now;

    let cancelled = false;
    getRouteInfo(fromLat, fromLng, toLat, toLng)
      .then((result) => {
        if (!cancelled) {
          setInfo(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [fromLat, fromLng, toLat, toLng]);

  return { info, error };
}
