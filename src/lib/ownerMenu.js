import { supabase } from "./supabaseClient";

const BUCKET = "menu-images";

export async function fetchAllMenuItems() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMenuItem(item) {
  const { data, error } = await supabase.from("menu_items").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateMenuItem(id, updates) {
  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id) {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadMenuImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = crypto.randomUUID() + "." + fileExt;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
