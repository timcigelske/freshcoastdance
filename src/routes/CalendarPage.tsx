import { useAuth } from "../lib/auth";
import {
  useAttendanceForDancers,
  useCurrentUser,
  useDancers,
  useSetRsvp,
  useUpcomingEvents,
} from "../lib/queries";
import type { AttendanceResponse, Dancer, RsvpStatus, StudioEvent } from "../lib/types";
import { formatDate, formatTimeRange } from "../lib/format";

const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "unsure", label: "Maybe" },
  { value: "not_going", label: "Can't" },
];

const TYPE_LABEL: Record<StudioEvent["type"], string> = {
  class: "Class",
  rehearsal: "Rehearsal",
  competition: "Competition",
  recital: "Recital",
  parade: "Parade",
  special: "Special",
};

export function CalendarPage() {
  const { session } = useAuth();
  const authUserId = session?.user.id;
  const { data: user } = useCurrentUser(authUserId);
  const { data: dancers = [] } = useDancers(user?.householdId);
  const { data: events = [], isLoading } = useUpcomingEvents();
  const { data: attendance = [] } = useAttendanceForDancers(dancers.map((d) => d.id));
  const setRsvp = useSetRsvp(authUserId);

  // Group events by date so the agenda reads like a schedule.
  const byDate = new Map<string, StudioEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  const dates = [...byDate.keys()].sort();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Calendar</h1>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : dates.length === 0 ? (
        <p className="text-sm text-muted">Nothing coming up.</p>
      ) : (
        dates.map((date) => (
          <section key={date} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {formatDate(date)}
            </h2>
            {byDate.get(date)!.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                dancers={dancers}
                attendance={attendance}
                onRsvp={(dancerId, status) =>
                  setRsvp.mutate({ eventId: e.id, dancerId, status })
                }
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function EventCard({
  event: e,
  dancers,
  attendance,
  onRsvp,
}: {
  event: StudioEvent;
  dancers: Dancer[];
  attendance: AttendanceResponse[];
  onRsvp: (dancerId: string, status: RsvpStatus) => void;
}) {
  const details = [
    e.arrivalTime ? `Arrive ${e.arrivalTime}` : null,
    e.bring ? `Bring: ${e.bring}` : null,
    e.dressCode ? `Dress: ${e.dressCode}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-bg p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-fg">{e.title}</div>
          <div className="text-sm text-muted">
            {formatTimeRange(e.startTime, e.endTime)}
            {e.location ? ` · ${e.location}` : ""}
            {e.room ? ` · ${e.room}` : ""}
          </div>
        </div>
        <span className="flex-none rounded-sm bg-fg/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
          {TYPE_LABEL[e.type]}
        </span>
      </div>

      {details.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-sm text-fg/70">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}

      {e.requiredAttendance && (
        <div className="flex flex-col gap-2 rounded-sm bg-bg-secondary p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">
              RSVP required
            </span>
            {e.rsvpDeadline && (
              <span className="text-xs text-muted">by {formatDate(e.rsvpDeadline)}</span>
            )}
          </div>
          {dancers.length === 0 ? (
            <p className="text-sm text-muted">No dancers linked to your household yet.</p>
          ) : (
            dancers.map((d) => {
              const current = attendance.find((r) => r.eventId === e.id && r.dancerId === d.id);
              return (
                <div key={d.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-fg">{d.name}</span>
                  <div className="flex overflow-hidden rounded-sm border border-line">
                    {RSVP_OPTIONS.map((opt) => {
                      const active = current?.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => onRsvp(d.id, opt.value)}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "bg-accent text-white"
                              : "bg-bg text-fg/70 hover:bg-fg/[0.04]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
