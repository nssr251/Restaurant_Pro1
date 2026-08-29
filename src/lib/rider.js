import { supabase } from "./supabaseClient";

export async function fetchRiderById(riderId) {
  const { data, error } = await supabase.from("riders").select("*").eq("id", riderId).single();
  if (error) throw error;
  return data;
}

export async function fetchRiderActiveOrders(riderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price_at_order, menu_items(name))")
    .eq("rider_id", riderId)
    .in("status", ["ready", "out_for_delivery"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export function subscribeToRiderOrders(riderId, onChange) {
  const channel = supabase
    .channel("rider-orders-" + riderId)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders", filter: "rider_id=eq." + riderId },
      () => onChange()
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function fetchRiderDeliveryHistory(riderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, total_amount, ready_at, delivered_at, created_at")
    .eq("rider_id", riderId)
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function updateRiderLocation(riderId, lat, lng) {
  const { error } = await supabase.rpc("update_rider_location", {
    p_rider_id: riderId,
    p_lat: lat,
    p_lng: lng,
  });
  if (error) throw error;
}

export async function riderAdvanceOrder(orderId, riderId, newStatus) {
  const { error } = await supabase.rpc("rider_advance_order", {
    p_order_id: orderId,
    p_rider_id: riderId,
    p_new_status: newStatus,
  });
  if (error) throw error;
}
