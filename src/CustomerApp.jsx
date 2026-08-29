import { useState, useEffect } from "react";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import CategoryTabs from "./components/CategoryTabs";
import MenuList from "./components/MenuList";
import CartSheet, { CartPill } from "./components/CartSheet";
import CheckoutForm from "./components/CheckoutForm";
import OrderTicket from "./components/OrderTicket";
import TrackOrderSearch from "./components/TrackOrderSearch";
import PaymentScreen from "./components/PaymentScreen";
import { fetchMenu, fetchRestaurantInfo } from "./lib/menu";
import { createOrder, fetchOrder, subscribeToOrder, subscribeToRider } from "./lib/orders";
import { useCart } from "./hooks/useCart";
import { RESTAURANT_DEFAULTS } from "./config";

const ACTIVE_ORDER_KEY = "restaurant_active_order_id";

export default function CustomerApp() {
  const [view, setView] = useState("welcome");
  const [menuByCategory, setMenuByCategory] = useState({});
  const [restaurantInfo, setRestaurantInfo] = useState(RESTAURANT_DEFAULTS);

  useEffect(() => {
    if (restaurantInfo.name) {
      document.title = restaurantInfo.name;
    }
  }, [restaurantInfo.name]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [rider, setRider] = useState(null);

  const { cart, addItem, decrementItem, itemCount, total, clearCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [menu, info] = await Promise.all([fetchMenu(), fetchRestaurantInfo()]);
        setMenuByCategory(menu);
        setRestaurantInfo({ ...info, tagline: info.tagline || RESTAURANT_DEFAULTS.tagline });
        setActiveCategory(Object.keys(menu)[0] || null);
      } catch (err) {
        setLoadError(err.message || "Could not load the menu. Check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const savedOrderId = localStorage.getItem(ACTIVE_ORDER_KEY);
    if (!savedOrderId) return;
    (async () => {
      try {
        const existing = await fetchOrder(savedOrderId);
        if (existing && !["delivered", "completed"].includes(existing.status)) {
          setOrder(existing);
          setView("tracking");
        } else {
          localStorage.removeItem(ACTIVE_ORDER_KEY);
        }
      } catch {
        localStorage.removeItem(ACTIVE_ORDER_KEY);
      }
    })();
  }, []);

  useEffect(() => {
    if (!order?.id) return;
    const unsubscribe = subscribeToOrder(order.id, (updated) => {
      setOrder((prev) => ({ ...prev, ...updated }));
    });
    return unsubscribe;
  }, [order?.id]);

  useEffect(() => {
    if (!order?.rider_id) return;
    // Realtime UPDATE payloads only carry raw changed columns — not the joined
    // rider name/phone/location — so refetch once to pick those up immediately.
    fetchOrder(order.id)
      .then((fresh) => setOrder((prev) => ({ ...prev, ...fresh })))
      .catch(() => {});
    const unsubscribe = subscribeToRider(order.rider_id, (updated) => setRider(updated));
    return unsubscribe;
  }, [order?.rider_id]);

  async function handlePlaceOrder(customerDetails) {
    setSubmitting(true);
    try {
      const newOrder = await createOrder({ ...customerDetails, cart });
      localStorage.setItem(ACTIVE_ORDER_KEY, newOrder.id);
      setOrder(newOrder);
      clearCart();
      setView(customerDetails.paymentMethod === "upi" ? "payment" : "tracking");
    } catch (err) {
      alert(err.message || "Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewOrder() {
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    setOrder(null);
    setRider(null);
    setView("menu");
  }

  if (view === "tracking" && order) {
    return <OrderTicket order={order} rider={order.riders || rider} onNewOrder={handleNewOrder} />;
  }

  if (view === "checkout") {
    return (
      <CheckoutForm
        total={total}
        submitting={submitting}
        onBack={() => setView("cart")}
        onSubmit={handlePlaceOrder}
        upiAvailable={!!restaurantInfo.upi_id}
      />
    );
  }

  if (view === "payment" && order) {
    return (
      <PaymentScreen
        order={order}
        restaurantName={restaurantInfo.name}
        upiId={restaurantInfo.upi_id}
        onContinue={() => setView("tracking")}
      />
    );
  }

  if (view === "welcome") {
    return (
      <WelcomeScreen
        restaurantInfo={restaurantInfo}
        onEnter={() => setView("menu")}
        onTrack={() => setView("trackSearch")}
      />
    );
  }

  if (view === "trackSearch") {
    return (
      <TrackOrderSearch
        onBack={() => setView("welcome")}
        onSelectOrder={(found) => {
          localStorage.setItem(ACTIVE_ORDER_KEY, found.id);
          setOrder(found);
          setView("tracking");
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-body text-paper/60">Loading menu…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center gap-2">
        <p className="font-display text-paper text-lg">Couldn't load the menu</p>
        <p className="font-body text-paper/50 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <Header name={restaurantInfo.name} tagline={restaurantInfo.tagline} />
      <CategoryTabs
        categories={Object.keys(menuByCategory)}
        active={activeCategory}
        onSelect={(cat) => {
          setActiveCategory(cat);
          document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
      <MenuList menuByCategory={menuByCategory} cart={cart} onAdd={addItem} onDecrement={decrementItem} />

      <CartPill itemCount={itemCount} total={total} onOpen={() => setView("cart")} />

      {view === "cart" && (
        <CartSheet
          cart={cart}
          total={total}
          onClose={() => setView("menu")}
          onAdd={addItem}
          onDecrement={decrementItem}
          onCheckout={() => setView("checkout")}
        />
      )}
    </div>
  );
}
