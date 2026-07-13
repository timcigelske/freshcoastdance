import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { signOut } from "../lib/auth";
import { useCurrentUser } from "../lib/queries";
import { Wordmark } from "../components/Wordmark";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/announcements", label: "Announcements" },
  { to: "/calendar", label: "Calendar" },
];

export function AppShell() {
  const { session } = useAuth();
  const { data: user } = useCurrentUser(session?.user.id);
  const isAdmin = user?.role === "owner" || user?.role === "admin";
  const navItems = isAdmin ? [...NAV_ITEMS, { to: "/admin", label: "Admin" }] : NAV_ITEMS;

  return (
    <div className="flex h-full">
      <aside className="flex w-60 flex-none flex-col border-r border-line bg-bg-secondary p-4">
        <div className="mb-8 px-2 pt-2">
          <Wordmark />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-fg/70 hover:bg-fg/[0.04] hover:text-fg"
                }`
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line pt-3">
          <div className="mb-2 text-sm">
            <div className="font-medium">{user?.name ?? session?.user.email}</div>
            <div className="text-xs uppercase tracking-wide text-muted">
              {user?.role ?? "pending invite"}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-muted hover:text-fg hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-bg p-6">
        <Outlet />
      </main>
    </div>
  );
}
