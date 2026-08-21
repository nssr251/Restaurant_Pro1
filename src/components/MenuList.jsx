import MenuItemCard from "./MenuItemCard";

export default function MenuList({ menuByCategory, cart, onAdd, onDecrement }) {
  const quantityFor = (itemId) => cart.find((i) => i.id === itemId)?.quantity || 0;

  return (
    <div className="px-5 py-4 space-y-8 pb-28">
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
