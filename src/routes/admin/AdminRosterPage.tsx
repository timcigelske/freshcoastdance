import * as React from "react";
import {
  useDeleteDancer,
  useDeleteHousehold,
  useRenameDancer,
  useRenameHousehold,
  useRoster,
  type HouseholdWithDancers,
} from "../../lib/queries";
import type { Dancer } from "../../lib/types";
import { AdminImportPage } from "./AdminImportPage";

export function AdminRosterPage() {
  const { data: households = [], isLoading } = useRoster();
  const dancerCount = households.reduce((n, h) => n + h.dancers.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <details className="rounded-md border border-line bg-bg-secondary">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-fg">
          Import from CSV
        </summary>
        <div className="border-t border-line p-4">
          <AdminImportPage />
        </div>
      </details>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
          Current roster
          {!isLoading && ` · ${households.length} households · ${dancerCount} dancers`}
        </h2>

        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : households.length === 0 ? (
          <p className="text-sm text-muted">No households yet — import a roster above.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {households.map((h) => (
              <HouseholdCard key={h.id} household={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HouseholdCard({ household: h }: { household: HouseholdWithDancers }) {
  const rename = useRenameHousehold();
  const remove = useDeleteHousehold();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(h.name);

  function save() {
    const next = name.trim();
    if (next && next !== h.name) rename.mutate({ id: h.id, name: next });
    setEditing(false);
  }

  return (
    <div className="rounded-md border border-line bg-bg p-4">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            className="flex-1 rounded-sm border border-line bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
          />
        ) : (
          <span className="flex-1 font-medium text-fg">{h.name}</span>
        )}
        {editing ? (
          <button
            onClick={save}
            className="rounded-sm border border-line px-3 py-1 text-xs text-fg hover:bg-fg/[0.04]"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => {
              setName(h.name);
              setEditing(true);
            }}
            className="rounded-sm border border-line px-3 py-1 text-xs text-fg hover:bg-fg/[0.04]"
          >
            Rename
          </button>
        )}
        <button
          onClick={() => {
            if (
              window.confirm(
                `Delete “${h.name}” and its ${h.dancers.length} dancer(s)? This can’t be undone.`,
              )
            ) {
              remove.mutate(h.id);
            }
          }}
          className="rounded-sm px-3 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {h.dancers.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-line border-t border-line">
          {h.dancers.map((d) => (
            <DancerRow key={d.id} dancer={d} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DancerRow({ dancer: d }: { dancer: Dancer }) {
  const rename = useRenameDancer();
  const remove = useDeleteDancer();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(d.name);

  function save() {
    const next = name.trim();
    if (next && next !== d.name) rename.mutate({ id: d.id, name: next });
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-2 py-2 pl-2">
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          autoFocus
          className="flex-1 rounded-sm border border-line bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
        />
      ) : (
        <span className="flex-1 text-sm text-fg">{d.name}</span>
      )}
      {editing ? (
        <button onClick={save} className="px-2 py-1 text-xs text-accent hover:underline">
          Save
        </button>
      ) : (
        <button
          onClick={() => {
            setName(d.name);
            setEditing(true);
          }}
          className="px-2 py-1 text-xs text-muted hover:text-fg hover:underline"
        >
          Rename
        </button>
      )}
      <button
        onClick={() => {
          if (window.confirm(`Remove ${d.name}? This can’t be undone.`)) remove.mutate(d.id);
        }}
        className="px-2 py-1 text-xs text-red-600 hover:underline"
      >
        Remove
      </button>
    </li>
  );
}
