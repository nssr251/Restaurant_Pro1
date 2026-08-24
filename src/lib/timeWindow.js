export function isWithinWindow(fromTime, toTime) {
  if (!fromTime || !toTime) return true;

  const [fh, fm] = fromTime.split(":").map(Number);
  const [th, tm] = toTime.split(":").map(Number);
  const from = fh * 60 + fm;
  const to = th * 60 + tm;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (from === to) return true; // full 24 hours
  if (from < to) {
    return nowMins >= from && nowMins < to;
  }
  // overnight window, e.g. 22:00 – 02:00
  return nowMins >= from || nowMins < to;
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return hour12 + ":" + String(m).padStart(2, "0") + " " + period;
}
