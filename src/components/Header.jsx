import { parsePhoneNumbers } from "../lib/phone";

export default function Header({ name, tagline, phone, address }) {
  const numbers = parsePhoneNumbers(phone);

  return (
    <header className="sticky top-0 z-20 bg-ink text-paper px-5 pt-6 pb-4 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{name}</h1>
        {numbers.length > 0 && (
          <span className="font-body text-xs text-paper/70 bg-paper/10 rounded-full px-3 py-1">
            📞 {numbers.join("  •  ")}
          </span>
        )}
      </div>
      {tagline && <p className="font-body text-sm text-paper/60 mt-0.5">{tagline}</p>}
      {address && <p className="font-body text-xs text-paper/35 mt-0.5">{address}</p>}
    </header>
  );
}
