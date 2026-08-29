import MenuItemCard from "./MenuItemCard";

export default function MenuList({ menuByCategory, cart, onAdd, onDecrement }) {
  const quantityFor = (itemId) => cart.find((i) => i.id === itemId)?.quantity || 0;
  const hasItems = Object.keys(menuByCategory).length > 0;

  return (
    <div className="px-5 py-4 space-y-8 pb-28">
      {!hasItems && (
        <p className="font-body text-paper/40 text-center py-10">No items match your search.</p>
      )}
      {Object.entries(menuByCategory).map(([category, items]) => (
        <section key={category} id={`cat-${category}`}>
          <h2 className="font-display text-lg font-semibold text-paper mb-3">{category}</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={quantityFor(item.id)}
                onAdd={onAdd}
                onDecrement={onDecrement}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
