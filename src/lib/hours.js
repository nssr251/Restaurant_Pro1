import { isWithinWindow, formatTime } from "./timeWindow";

export function isRestaurantOpen(opensAt, closesAt) {
  if (!opensAt || !closesAt) return true;
  return isWithinWindow(opensAt, closesAt);
}

export { formatTime };
