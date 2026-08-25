export const SUPABASE_URL = "https://opuqgrrmakligzytkgnd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdXFncnJtYWtsaWd6eXRrZ25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjA2MDEsImV4cCI6MjEwMjg5NjYwMX0.Tw1LQH_Fl_8kZ2JppzmtZCIOyxnkHqlv1-JsYJiFAW4";

// Restaurant display defaults (also editable live from the owner dashboard
// once that's built — these are just first-load fallbacks)
export const RESTAURANT_DEFAULTS = {
  name: "My Restaurant",
  tagline: "Fresh, fast, made to order",
};
 
// ── Feature flags for staged release ───────────────────────────────
// Flip these to `true` and redeploy whenever you're ready to turn a
// feature on — nothing else needs to change in the code.
export const FEATURES = {
  menuManagement: true, // Owner's "Menu" tab (add/edit/delete items in-app)
  riderTracking: false, // Rider assignment + live delivery map
};
 
