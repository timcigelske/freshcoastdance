import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useCurrentUser } from "../../lib/queries";

const ADMIN_ROLES = new Set(["owner", "admin"]);

const TABS = [
  { to: "/admin/dashboard", label: "RSVP Monitor" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/roster", label: "Roster" },
  { to: "/admin/people", label: "People" },
];

/** Blocks the admin area for anyone whose profile role is not owner/admin. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const { data: user, isLoading } = useCurrentUser(session?.user.id);

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (!user || !ADMIN_ROLES.has(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted">Manage announcements, rosters, and attendance.</p>
        </div>
        <nav className="flex gap-1 border-b border-line">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-accent font-semibold text-accent"
                    : "border-transparent text-fg/60 hover:text-fg"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
