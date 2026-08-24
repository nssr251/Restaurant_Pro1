import { useState } from "react";
import { createMenuItem, updateMenuItem, uploadMenuImage } from "../../lib/ownerMenu";

export default function MenuItemForm({ existingItem, onClose, onSaved }) {
  const [name, setName] = useState(existingItem?.name || "");
  const [description, setDescription] = useState(existingItem?.description || "");
  const [price, setPrice] = useState(existingItem?.price ?? "");
  const [category, setCategory] = useState(existingItem?.category || "");
  const [isAvailable, setIsAvailable] = useState(existingItem?.is_available ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingItem?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let imageUrl = existingItem?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadMenuImage(imageFile);
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        category: category.trim() || null,
        is_available: isAvailable,
        image_url: imageUrl,
      };

      if (existingItem) {
        await updateMenuItem(existingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Could not save the item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {existingItem ? "Edit Item" : "Add New Item"}
          </h2>
          <button onClick={onClose} className="text-ink/40 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
                Price (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="1"
                className="w-full mt-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink"
              />
            </div>
            <div className="flex-1">
              <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Main Course"
                className="w-full mt-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full mt-1 font-body text-sm"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover mt-2" />
            )}
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            Available to customers
          </label>

          {error && <p className="font-body text-sm text-chili">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-turmeric text-ink font-body font-bold py-3 rounded-xl disabled:opacity-40"
          >
            {saving ? "Saving…" : existingItem ? "Save Changes" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
