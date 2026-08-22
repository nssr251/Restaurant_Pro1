import { supabase } from "./supabaseClient";
import { ORDER_STAGES } from "./orders";

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price_at_order, menu_items(name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchOrderWithItems(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price_at_order, menu_items(name))")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToAllOrders(onInsert, onUpdate) {
  const channel = supabase
    .channel("owner-orders")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) =>
      onInsert(payload.new)
    )
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) =>
      onUpdate(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function advanceOrderStatus(order) {
  const stages = ORDER_STAGES[order.order_type] || ORDER_STAGES.pickup;
  const currentIndex = stages.indexOf(order.status);
  const nextStatus = stages[currentIndex + 1];
  if (!nextStatus) return null;

  const extraFields = {};
  if (nextStatus === "ready") extraFields.ready_at = new Date().toISOString();
  if (nextStatus === "delivered" || nextStatus === "completed") {
    extraFields.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus, ...extraFields })
    .eq("id", order.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
