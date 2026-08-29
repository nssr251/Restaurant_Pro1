import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { fetchAllRiders, createRider, deleteRider } from "../../lib/ownerRiders";

export default function OwnerRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [qrOpenId, setQrOpenId] = useState(null);
  const [qrDataUrls, setQrDataUrls] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllRiders();
      setRiders(data);
    } catch (err) {
      setError(err.message || "Could not load riders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createRider({ name: name.trim(), phone: phone.trim() });
      setName("");
      setPhone("");
      await load();
    } catch (err) {
      alert(err.message || "Could not add rider.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rider) {
    const confirmed = window.confirm('Remove "' + rider.name + '" from riders?');
    if (!confirmed) return;
    try {
      await deleteRider(rider.id);
      await load();
    } catch (err) {
      alert(err.message || "Could not remove rider.");
    }
  }

  function riderLink(rider) {
    return window.location.origin + "/rider/" + rider.id;
  }

  function copyLink(rider) {
    navigator.clipboard.writeText(riderLink(rider));
    setCopiedId(rider.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleQr(rider) {
    if (qrOpenId === rider.id) {
      setQrOpenId(null);
      return;
    }
    setQrOpenId(rider.id);
    if (!qrDataUrls[rider.id]) {
      try {
        const dataUrl = await QRCode.toDataURL(riderLink(rider), { width: 200, margin: 1 });
        setQrDataUrls((prev) => ({ ...prev, [rider.id]: dataUrl }));
      } catch {
        // QR generation failed — the copy-link button still works as a fallback
      }
    }
  }

  if (loading) return <p className="font-body text-ink/60">Loading riders…</p>;
  if (error) return <p className="font-body text-chili">{error}</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Riders</h1>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl p-4 shadow-sm border border-ink/5 mb-6 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rider name"
          required
          className="flex-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="flex-1 border border-ink/15 rounded-lg px-3 py-2 font-body text-ink text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-turmeric text-ink font-body font-semibold text-sm px-4 py-2 rounded-lg disabled:opacity-40"
        >
          {saving ? "Adding…" : "+ Add Rider"}
        </button>
      </form>

      <div className="space-y-3">
        {riders.map((rider) => (
          <div key={rider.id} className="bg-white rounded-xl p-4 shadow-sm border border-ink/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-body font-semibold text-ink text-sm">{rider.name}</p>
                <p className="font-ticket text-xs text-ink/50">{rider.phone}</p>
                <span
                  className={
                    "inline-block font-body text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 " +
                    (rider.status === "available" ? "bg-leaf/10 text-leaf" : "bg-ink/10 text-ink/50")
                  }
                >
                  {rider.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleQr(rider)}
                  className="font-body text-xs font-semibold text-ink border border-ink/20 rounded-lg px-3 py-1.5 hover:bg-paper-dim transition-colors"
                >
                  {qrOpenId === rider.id ? "Hide QR" : "📱 Show QR"}
                </button>
                <button
                  onClick={() => copyLink(rider)}
                  className="font-body text-xs font-semibold text-ink border border-ink/20 rounded-lg px-3 py-1.5 hover:bg-paper-dim transition-colors"
                >
                  {copiedId === rider.id ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => handleDelete(rider)}
                  className="font-body text-xs font-semibold text-chili border border-chili/20 rounded-lg px-3 py-1.5 hover:bg-chili/5 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {qrOpenId === rider.id && (
              <div className="mt-4 pt-4 border-t border-ink/10 text-center">
                {qrDataUrls[rider.id] ? (
                  <img
                    src={qrDataUrls[rider.id]}
                    alt={rider.name + "'s rider link QR code"}
                    className="mx-auto rounded-lg"
                  />
                ) : (
                  <p className="font-body text-xs text-ink/40">Generating QR…</p>
                )}
                <p className="font-body text-xs text-ink/50 mt-2">
                  Have {rider.name} scan this once with their phone's camera to open their page.
                </p>
              </div>
            )}
          </div>
        ))}
        {riders.length === 0 && (
          <p className="font-body text-ink/40 text-center py-10">No riders yet. Add your first one above.</p>
        )}
      </div>
    </div>
  );
}
