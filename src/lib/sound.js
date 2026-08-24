export function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [660, 880, 660];
    const repeats = 3;

    for (let r = 0; r < repeats; r++) {
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "square"; // sharper/buzzier than sine — reads as louder at same volume
        oscillator.frequency.value = freq;

        const start = ctx.currentTime + r * 0.7 + i * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.9, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.35);
      });
    }
  } catch {
    // Audio blocked or unavailable — the visual badge/title count still works
  }

  // Bonus: vibrate on devices that support it (phones/tablets)
  if (navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // ignore
    }
  }
}

export function requestNotificationPermission() {
  if (typeof Notification === "undefined") return Promise.resolve("unsupported");
  if (Notification.permission !== "default") return Promise.resolve(Notification.permission);
  return Notification.requestPermission();
}

export function getNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
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
    // Notifications blocked by the OS/browser — sound + title badge still work
  }
}
