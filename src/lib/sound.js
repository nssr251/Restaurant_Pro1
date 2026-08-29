// ── Pick your alert sound here ──────────────────────────────────────
// Options: "chime" (default, pleasant), "buzzer" (urgent/loud),
// "bell" (classic two-tone), "doorbell" (soft ding-dong)
export const ALERT_SOUND = "buzzer";

const PRESETS = {
  chime: { notes: [880, 1108, 1320], wave: "sine", repeats: 2, gap: 0.6 },
  buzzer: { notes: [660, 880, 660], wave: "square", repeats: 5, gap: 0.7 },
  bell: { notes: [523, 784], wave: "triangle", repeats: 2, gap: 0.8 },
  doorbell: { notes: [784, 659], wave: "sine", repeats: 1, gap: 0 },
};

export function playAlertSound(presetName) {
  const preset = PRESETS[presetName || ALERT_SOUND] || PRESETS.chime;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    for (let r = 0; r < preset.repeats; r++) {
      preset.notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = preset.wave;
        oscillator.frequency.value = freq;

        const start = ctx.currentTime + r * preset.gap + i * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.7, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.35);
      });
    }
  } catch {
    // Audio blocked or unavailable — visual/title indicators still work
  }

  if (navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // ignore
    }
  }
}

// Kept for existing call sites — now just plays the configured preset
export function playNewOrderChime() {
  playAlertSound();
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

export function showNotification(title, body, tag) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag });
  } catch {
    // Notifications blocked by the OS/browser — sound still works
  }
}

export function showNewOrderNotification(order) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  showNotification(
    "New order #" + shortId,
    (order.customer_name || "A customer") + " · ₹" + order.total_amount,
    "order-" + order.id
  );
}
