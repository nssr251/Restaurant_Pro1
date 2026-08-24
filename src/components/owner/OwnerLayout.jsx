import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth";

// Future stages add entries here — Orders, Menu, Riders — nothing else about
// this layout needs to change when they do.
const NAV_ITEMS = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/orders", label: "Orders" },
  { to: "/owner/menu", label: "Menu" },
  { to: "/owner/riders", label: "Riders" },
];

export default function OwnerLayout() {
  const navigate = useNavigate();

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
                `block px-3 py-2 rounded-lg font-body text-sm ${
                  isActive ? "bg-turmeric text-ink font-semibold" : "text-paper/70 hover:bg-ink-light"
                }`
              }
            >
              {item.label}
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
        <Outlet />
      </main>
    </div>
  );
}
