export default function Header({ name, tagline }) {
  return (
    <header className="sticky top-0 z-20 bg-ink text-paper px-5 pt-6 pb-4 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{name}</h1>
      <p className="font-body text-sm text-paper/60 mt-0.5">{tagline}</p>
    </header>
  );
}
