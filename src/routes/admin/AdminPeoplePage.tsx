import * as React from "react";
import { useAllUsers, useInviteParent, useRoster } from "../../lib/queries";
import type { Role } from "../../lib/types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
  dancer: "Dancer",
};

const label = "text-sm font-medium text-fg";
const inputBase =
  "rounded-sm border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent";

const NEW_HOUSEHOLD = "__new__";

export function AdminPeoplePage() {
  const invite = useInviteParent();
  const { data: households = [] } = useRoster();
  const { data: users = [] } = useAllUsers();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("parent");
  const [householdChoice, setHouseholdChoice] = React.useState(""); // "" = none, id, or NEW_HOUSEHOLD
  const [newHousehold, setNewHousehold] = React.useState("");

  const householdName = React.useMemo(() => {
    const map = new Map(households.map((h) => [h.id, h.name]));
    return (id?: string | null) => (id ? (map.get(id) ?? "—") : "—");
  }, [households]);

  function reset() {
    setName("");
    setEmail("");
    setRole("parent");
    setHouseholdChoice("");
    setNewHousehold("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const isNew = householdChoice === NEW_HOUSEHOLD;
    invite.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        role,
        householdId: isNew || !householdChoice ? null : householdChoice,
        householdName: isNew ? newHousehold.trim() : null,
      },
      { onSuccess: reset },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-sm text-muted">
          Invite a family or staff member. They get an email with a secure sign-in link and are
          linked to the household you choose — no SQL needed. If they’ve already signed in, this
          just links their existing account.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dana Rivera"
              className={inputBase}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dana@example.com"
              className={inputBase}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={inputBase}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="household">
              Household
            </label>
            <select
              id="household"
              value={householdChoice}
              onChange={(e) => setHouseholdChoice(e.target.value)}
              className={inputBase}
            >
              <option value="">— None (staff) —</option>
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
              <option value={NEW_HOUSEHOLD}>+ New household…</option>
            </select>
          </div>
        </div>

        {householdChoice === NEW_HOUSEHOLD && (
          <div className="flex flex-col gap-1.5">
            <label className={label} htmlFor="new-household">
              New household name
            </label>
            <input
              id="new-household"
              value={newHousehold}
              onChange={(e) => setNewHousehold(e.target.value)}
              placeholder="The Rivera Family"
              className={inputBase}
              required
            />
          </div>
        )}

        {invite.isError && (
          <p className="text-sm text-red-600">
            Couldn’t send — {(invite.error as Error).message}
          </p>
        )}
        {invite.isSuccess && (
          <p className="text-sm text-green-700">
            {invite.data.invited
              ? "✓ Invitation email sent and account linked."
              : "✓ Existing account linked."}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={invite.isPending || !name.trim() || !email.trim()}
            className="rounded-sm bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {invite.isPending ? "Sending…" : "Send invitation"}
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
          People ({users.length})
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-muted">No linked accounts yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-fg">{u.name}</div>
                  <div className="truncate text-xs text-muted">{u.email}</div>
                </div>
                <span className="flex-none rounded-sm bg-fg/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                  {ROLE_LABEL[u.role]}
                </span>
                <span className="hidden flex-none text-xs text-muted sm:block">
                  {householdName(u.householdId)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
