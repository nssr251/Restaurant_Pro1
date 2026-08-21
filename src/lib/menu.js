import { supabase } from "./supabaseClient";

export async function fetchMenu() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const byCategory = {};
  for (const item of data) {
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
