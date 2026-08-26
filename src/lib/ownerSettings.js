import { supabase } from "./supabaseClient";

export async function fetchAcceptingOrders() {
  const { data, error } = await supabase
    .from("restaurant_info")
    .select("accepting_orders")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data.accepting_orders !== false; // treat null as accepting, same as the DB default
}

export async function setAcceptingOrders(value) {
  const { error } = await supabase
    .from("restaurant_info")
    .update({ accepting_orders: value })
    .eq("id", 1);
  if (error) throw error;
}
