export default function MenuSearchBar({ value, onChange }) {
  return (
    <div className="px-5 pb-3 bg-ink">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search menu items…"
          className="w-full bg-paper/10 border border-paper/20 rounded-full pl-4 pr-9 py-2.5 font-body text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-turmeric/50"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/50 text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
