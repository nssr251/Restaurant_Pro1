import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth";
import { useOwnerOrders } from "../../hooks/useOwnerOrders";
import { requestNotificationPermission } from "../../lib/sound";
import { fetchAcceptingOrders, setAcceptingOrders } from "../../lib/ownerSettings";
import { FEATURES } from "../../config";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const ownerOrdersState = useOwnerOrders();
  const { orders, notificationPermission, setNotificationPermission } = ownerOrdersState;
  const newOrdersCount = orders.filter((o) => o.status === "received").length;

  const [accepting, setAccepting] = useState(true);
  const [togglingAccepting, setTogglingAccepting] = useState(false);
  const [acceptingLoaded, setAcceptingLoaded] = useState(false);

  useEffect(() => {
    fetchAcceptingOrders()
      .then((value) => {
        setAccepting(value);
        setAcceptingLoaded(true);
      })
      .catch(() => setAcceptingLoaded(true));
  }, []);

  // Reliable indicator that doesn't depend on notification permission at all —
  // shows the unread count right in the browser tab, visible even on another tab/app
  useEffect(() => {
    document.title = newOrdersCount > 0 ? "(" + newOrdersCount + ") Owner Panel" : "Owner Panel";
  }, [newOrdersCount]);

  const NAV_ITEMS = [
    { to: "/owner", label: "Dashboard", end: true, badge: null },
    { to: "/owner/orders", label: "Orders", badge: newOrdersCount > 0 ? newOrdersCount : null },
    FEATURES.menuManagement && { to: "/owner/menu", label: "Menu", badge: null },
    FEATURES.riderTracking && { to: "/owner/riders", label: "Riders", badge: null },
  ].filter(Boolean);

  async function handleLogout() {
    await signOut();
    navigate("/owner/login", { replace: true });
  }

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
  }

  async function handleToggleAccepting() {
    const next = !accepting;
    setTogglingAccepting(true);
    setAccepting(next); // optimistic — feels instant on a one-tap control
    try {
      await setAcceptingOrders(next);
    } catch (err) {
      setAccepting(!next); // revert on failure
      alert(err.message || "Could not update this. Please try again.");
    } finally {
      setTogglingAccepting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-dim flex">
      <aside className="w-56 bg-ink text-paper flex flex-col shrink-0">
        <div className="px-5 py-6">
          <p className="font-display text-lg font-semibold">Owner Panel</p>
        </div>

        {acceptingLoaded && (
          <button
            onClick={handleToggleAccepting}
            disabled={togglingAccepting}
            className={
              "mx-3 mb-4 px-3 py-3 rounded-xl font-body text-sm font-semibold text-left transition-colors disabled:opacity-60 " +
              (accepting ? "bg-leaf/20 text-leaf" : "bg-chili/20 text-chili")
            }
          >
            <div className="flex items-center justify-between">
              <span>{accepting ? "Accepting Orders" : "Orders Paused"}</span>
              <span
                className={
                  "inline-block w-9 h-5 rounded-full relative transition-colors " +
                  (accepting ? "bg-leaf" : "bg-ink/30")
                }
              >
                <span
                  className={
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform " +
                    (accepting ? "translate-x-4" : "translate-x-0.5")
                  }
                />
              </span>
            </div>
            <p className="font-body text-[11px] font-normal mt-1 opacity-80">
              {accepting ? "Tap to pause new orders" : "Customers see \"not taking orders\""}
            </p>
          </button>
        )}

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "flex items-center justify-between px-3 py-2 rounded-lg font-body text-sm " +
                (isActive ? "bg-turmeric text-ink font-semibold" : "text-paper/70 hover:bg-ink-light")
              }
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-chili text-paper text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
          <button
            onClick={handleEnableNotifications}
            className="m-3 px-3 py-2 rounded-lg font-body text-xs bg-turmeric/20 text-turmeric hover:bg-turmeric/30 transition-colors text-left"
          >
            {notificationPermission === "denied"
              ? "Notifications blocked — check browser site settings"
              : "🔔 Enable order notifications"}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="m-3 px-3 py-2 rounded-lg font-body text-sm text-paper/70 hover:bg-ink-light text-left"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 p-6">
        <Outlet context={ownerOrdersState} />
      </main>
    </div>
  );
}
