export function parsePhoneNumbers(raw) {
  if (!raw) return [];
  return raw
    .split(/[/,]/)
    .map((p) => p.trim())
    .filter(Boolean);
}
