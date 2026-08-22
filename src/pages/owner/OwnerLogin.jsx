import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../lib/auth";

export default function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate("/owner", { replace: true });
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-paper rounded-2xl p-6 space-y-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Owner Login</h1>

        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
            required
          />
        </div>

        <div>
          <label className="font-body text-xs font-semibold text-ink/60 uppercase tracking-wide">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 bg-white border border-ink/15 rounded-xl px-4 py-3 font-body text-ink"
            required
          />
        </div>

        {error && <p className="font-body text-sm text-chili">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-turmeric text-ink font-body font-bold py-3 rounded-xl disabled:opacity-40 hover:bg-turmeric-dark transition-colors"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
