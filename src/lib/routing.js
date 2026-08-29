// Uses OSRM's free public demo server — fine at small scale (a handful of
// concurrent deliveries, checked every ~25s), but it's a best-effort demo
// service with no uptime guarantee. If it's ever unreachable, callers should
// just hide the distance/ETA line rather than break anything else.
export async function getRouteInfo(fromLat, fromLng, toLat, toLng) {
  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    fromLng + "," + fromLat + ";" + toLng + "," + toLat +
    "?overview=false";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing service unavailable");
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error("No route found");

  const route = data.routes[0];
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}
