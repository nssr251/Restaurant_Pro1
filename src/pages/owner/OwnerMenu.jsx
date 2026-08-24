import { useState, useEffect, useCallback } from "react";
import { fetchAllMenuItems, deleteMenuItem } from "../../lib/ownerMenu";
import MenuItemForm from "../../components/owner/MenuItemForm";

export default function OwnerMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllMenuItems();
      setItems(data);
    } catch (err) {
      setError(err.message || "Could not load menu items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openAddForm() {
    setEditingItem(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingItem(item);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  async function handleSaved() {
    closeForm();
    await loadItems();
  }

  async function handleDelete(item) {
    const confirmed = window.confirm('Delete "' + item.name + '"? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteMenuItem(item.id);
      await loadItems();
    } catch (err) {
      alert(err.message || "Could not delete the item.");
    }
  }

  if (loading) return <p className="font-body text-ink/60">Loading menu…</p>;
  if (error) return <p className="font-body text-chili">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Menu</h1>
        <button
          onClick={openAddForm}
          className="bg-turmeric text-ink font-body font-semibold text-sm px-4 py-2 rounded-lg hover:bg-turmeric-dark transition-colors"
        >
          + Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-ink/5">
            <div className="flex gap-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-paper-dim flex items-center justify-center text-ink/30 font-display text-xl">
                  {item.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-ink text-sm">{item.name}</p>
                <p className="font-ticket text-xs text-ink/50">
                  ₹{item.price} · {item.category || "Uncategorized"}
                </p>
                <span
                  className={
                    "inline-block font-body text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 " +
                    (item.is_available ? "bg-leaf/10 text-leaf" : "bg-chili/10 text-chili")
                  }
                >
                  {item.is_available ? "Available" : "Hidden"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-ink/10">
              <button
                onClick={() => openEditForm(item)}
                className="flex-1 font-body text-xs font-semibold text-ink border border-ink/20 rounded-lg py-1.5 hover:bg-paper-dim transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="flex-1 font-body text-xs font-semibold text-chili border border-chili/20 rounded-lg py-1.5 hover:bg-chili/5 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="font-body text-ink/40 text-center py-10">No menu items yet. Add your first one.</p>
      )}

      {showForm && <MenuItemForm existingItem={editingItem} onClose={closeForm} onSaved={handleSaved} />}
    </div>
  );
}
