export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start) return "";
  const label = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hour12}:${String(m).padStart(2, "0")} ${period}` : `${hour12} ${period}`;
  };
  return end ? `${label(start)} – ${label(end)}` : label(start);
}

/** Format a timestamptz (ISO with time) as a short calendar date. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isToday(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return iso === today;
}
