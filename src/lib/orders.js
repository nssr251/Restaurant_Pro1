import { supabase } from "./supabaseClient";

export const ORDER_STAGES = {
  pickup: ["received", "preparing", "ready", "completed"],
  delivery: ["received", "preparing", "ready", "out_for_delivery", "delivered"],
};

export const STAGE_LABELS = {
  received: "Order received",
  preparing: "Preparing your food",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed — enjoy!",
};

export async function createOrder({ customerName, customerPhone, orderType, deliveryAddress, cart }) {
  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      delivery_address: orderType === "delivery" ? deliveryAddress : null,
      total_amount: totalAmount,
      status: "received",
      payment_status: "pay_later",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItemsPayload = cart.map((item) => ({
    order_id: order.id,
    menu_item_id: item.id,
    quantity: item.quantity,
    price_at_order: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) throw itemsError;

  return order;
}

export async function fetchOrdersByPhone(phone) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, riders(name, phone, current_lat, current_lng)")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
}

export async function fetchOrder(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, riders(name, phone, current_lat, current_lng)")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

// Subscribe to live updates for a single order (status changes, rider assignment)
export function subscribeToOrder(orderId, onChange) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Subscribe to a rider's live location while an order is out for delivery
export function subscribeToRider(riderId, onChange) {
  if (!riderId) return () => {};
  const channel = supabase
    .channel(`rider-${riderId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "riders", filter: `id=eq.${riderId}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
