import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "authed" : "guest");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authed" : "guest");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-body text-paper/60">Checking session…</p>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/owner/login" replace />;
  }

  return children;
}
