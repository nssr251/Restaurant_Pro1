export default function CategoryTabs({ categories, active, onSelect }) {
  return (
    <div className="sticky top-[88px] z-10 bg-ink px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 font-body text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              isActive
                ? "bg-turmeric text-ink border-turmeric"
                : "bg-transparent text-paper/70 border-paper/25 hover:border-paper/50"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
