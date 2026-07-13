import { useAuth } from "../lib/auth";
import {
  useAttendanceForDancers,
  useCurrentUser,
  useDancers,
  useHousehold,
  useRecentAnnouncements,
  useUpcomingEvents,
} from "../lib/queries";
import { formatDate, formatTimeRange, isToday } from "../lib/format";

export function DashboardPage() {
  const { session } = useAuth();
  const { data: user, isLoading: userLoading } = useCurrentUser(session?.user.id);
  const { data: household } = useHousehold(user?.householdId);
  const { data: dancers = [] } = useDancers(user?.householdId);
  const { data: events = [], isLoading: eventsLoading } = useUpcomingEvents();
  const { data: announcements = [] } = useRecentAnnouncements();
  const { data: attendance = [] } = useAttendanceForDancers(dancers.map((d) => d.id));

  if (userLoading) {
    return <p className="text-sm opacity-60">Loading your dashboard…</p>;
  }

  if (!user) {
    return (
      <div className="max-w-md rounded-md border border-line bg-bg-secondary p-6 text-sm">
        <p className="mb-2 font-medium">You're signed in, but not linked to a household yet.</p>
        <p className="opacity-70">
          Ask your studio admin to invite <strong>{session?.user.email}</strong> so you can see
          your dancers' schedule.
        </p>
      </div>
    );
  }

  const todayEvents = events.filter((e) => isToday(e.date));
  const upcoming = events.filter((e) => !isToday(e.date)).slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {user.name.split(" ")[0]}</h1>
        {household && <p className="text-sm opacity-60">{household.name}</p>}
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Today</h2>
        {eventsLoading ? (
          <p className="text-sm opacity-60">Loading…</p>
        ) : todayEvents.length === 0 ? (
          <p className="text-sm opacity-60">Nothing on the schedule today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayEvents.map((e) => (
              <div key={e.id} className="rounded-md border border-line bg-bg-secondary p-3 text-sm">
                <div className="font-medium">{e.title}</div>
                <div className="opacity-60">
                  {formatTimeRange(e.startTime, e.endTime)}
                  {e.room ? ` · ${e.room}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm opacity-60">Nothing else coming up.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-md border border-line bg-bg-secondary p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="opacity-60">
                    {formatDate(e.date)} · {formatTimeRange(e.startTime, e.endTime)}
                  </div>
                </div>
                {e.requiredAttendance && (
                  <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
                    RSVP required
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Recent announcements
        </h2>
        {announcements.length === 0 ? (
          <p className="text-sm opacity-60">No announcements yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-md border border-line bg-bg-secondary p-3 text-sm">
                <div className="font-medium">{a.title}</div>
                {a.body && <div className="opacity-70">{a.body}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          My dancers
        </h2>
        {dancers.length === 0 ? (
          <p className="text-sm opacity-60">No dancers linked to your household yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dancers.map((d) => {
              const responses = attendance.filter((r) => r.dancerId === d.id);
              return (
                <div key={d.id} className="rounded-md border border-line bg-bg-secondary p-3 text-sm">
                  <div className="font-medium">{d.name}</div>
                  <div className="opacity-60">
                    {d.program} · {responses.length} RSVP{responses.length === 1 ? "" : "s"} on
                    file
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
