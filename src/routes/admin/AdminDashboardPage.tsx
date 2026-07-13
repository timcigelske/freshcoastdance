import * as React from "react";
import { useEventRsvps, type EventRsvpSummary } from "../../lib/queries";
import type { RsvpStatus } from "../../lib/types";
import { formatDate, formatTimeRange } from "../../lib/format";

const STATUS_LABEL: Record<RsvpStatus, string> = {
  going: "Going",
  not_going: "Can’t",
  unsure: "Maybe",
  late: "Late",
  leaving_early: "Leaving early",
};

// Roll individual statuses into the three headline buckets studios care about.
function buckets(responses: EventRsvpSummary["responses"]) {
  let going = 0;
  let maybe = 0;
  let cant = 0;
  for (const r of responses) {
    if (r.status === "not_going") cant++;
    else if (r.status === "unsure") maybe++;
    else going++; // going, late, leaving_early all mean "attending"
  }
  return { going, maybe, cant };
}

export function AdminDashboardPage() {
  const { data: events = [], isLoading } = useEventRsvps();

  if (isLoading) return <p className="text-sm text-muted">Loading…</p>;
  if (events.length === 0)
    return <p className="text-sm text-muted">No upcoming events to track.</p>;

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventCard({ event }: { event: EventRsvpSummary }) {
  const [open, setOpen] = React.useState(false);
  const b = buckets(event.responses);
  const total = event.responses.length;

  return (
    <div className="rounded-md border border-line bg-bg">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex-1">
          <div className="font-medium text-fg">{event.title}</div>
          <div className="text-sm text-muted">
            {formatDate(event.date)}
            {event.startTime ? ` · ${formatTimeRange(event.startTime)}` : ""}
          </div>
        </div>
        <div className="flex flex-none items-center gap-2 text-xs font-semibold">
          <Count n={b.going} label="Going" className="bg-green-100 text-green-800" />
          <Count n={b.maybe} label="Maybe" className="bg-amber-100 text-amber-800" />
          <Count n={b.cant} label="Can’t" className="bg-red-100 text-red-800" />
        </div>
        <span className="flex-none text-muted">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="border-t border-line px-4 py-3">
          {total === 0 ? (
            <p className="text-sm text-muted">No responses yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {event.responses
                .slice()
                .sort((a, b2) => a.dancerName.localeCompare(b2.dancerName))
                .map((r, i) => (
                  <li
                    key={`${r.dancerName}-${i}`}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="text-fg">{r.dancerName}</span>
                    <span className="text-muted">{STATUS_LABEL[r.status]}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Count({ n, label, className }: { n: number; label: string; className: string }) {
  return (
    <span className={`rounded-sm px-2 py-0.5 ${className}`}>
      {n} {label}
    </span>
  );
}
