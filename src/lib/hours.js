export function isRestaurantOpen(opensAt, closesAt) {
  if (!opensAt || !closesAt) return true; // hours not configured yet — assume open

  const [oh, om] = opensAt.split(":").map(Number);
  const [ch, cm] = closesAt.split(":").map(Number);
  const opens = oh * 60 + om;
  const closes = ch * 60 + cm;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (opens === closes) return true; // open 24 hours
  if (opens < closes) {
    return nowMins >= opens && nowMins < closes;
  }
  // overnight window, e.g. 18:00 – 02:00
  return nowMins >= opens || nowMins < closes;
}

export function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
