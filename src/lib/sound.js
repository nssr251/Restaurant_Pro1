export function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Louder, three-note chime, repeated twice so it's hard to miss
    const notes = [880, 1108, 1320];
    const repeats = 2;

    for (let r = 0; r < repeats; r++) {
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = freq;

        const start = ctx.currentTime + r * 0.6 + i * 0.15;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.35);
      });
    }
  } catch {
    // Audio blocked or unavailable — the visual badge/list update still happens
  }
}

export function requestNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

export function showNewOrderNotification(order) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    const shortId = order.id.slice(0, 8).toUpperCase();
    new Notification("New order #" + shortId, {
      body: (order.customer_name || "A customer") + " · ₹" + order.total_amount,
      tag: "order-" + order.id,
    });
  } catch {
    // Notifications blocked by the OS/browser — sound + in-app badge still work
  }
}
