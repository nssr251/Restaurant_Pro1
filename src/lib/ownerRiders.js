import { supabase } from "./supabaseClient";

export async function fetchAllRiders() {
  const { data, error } = await supabase.from("riders").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createRider({ name, phone }) {
  const { data, error } = await supabase
    .from("riders")
    .insert({ name, phone, status: "available" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRider(id) {
  const { error } = await supabase.from("riders").delete().eq("id", id);
  if (error) throw error;
}
