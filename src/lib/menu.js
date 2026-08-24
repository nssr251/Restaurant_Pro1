import { supabase } from "./supabaseClient";
import { isWithinWindow } from "./timeWindow";

export async function fetchMenu() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  // Manual "is_available" toggle is the master switch (already filtered above).
  // auto_schedule then applies an additional time-of-day filter on top.
  const visibleNow = data.filter((item) => {
    if (!item.auto_schedule) return true;
    return isWithinWindow(item.available_from, item.available_until);
  });

  const byCategory = {};
  for (const item of visibleNow) {
    const cat = item.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }
  return byCategory;
}

export async function fetchRestaurantInfo() {
  const { data, error } = await supabase
    .from("restaurant_info")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data;
}
