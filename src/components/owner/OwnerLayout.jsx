import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth";
import { useOwnerOrders } from "../../hooks/useOwnerOrders";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const ownerOrdersState = useOwnerOrders();
  const newOrdersCount = ownerOrdersState.orders.filter((o) => o.status === "received").length;

  const NAV_ITEMS = [
    { to: "/owner", label: "Dashboard", end: true, badge: null },
    { to: "/owner/orders", label: "Orders", badge: newOrdersCount > 0 ? newOrdersCount : null },
    { to: "/owner/menu", label: "Menu", badge: null },
    { to: "/owner/riders", label: "Riders", badge: null },
  ];

  async function handleLogout() {
    await signOut();
    navigate("/owner/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper-dim flex">
      <aside className="w-56 bg-ink text-paper flex flex-col shrink-0">
        <div className="px-5 py-6">
          <p className="font-display text-lg font-semibold">Owner Panel</p>
        </div>

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
