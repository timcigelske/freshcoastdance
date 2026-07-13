import * as React from "react";
import { useAuth } from "../../lib/auth";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "../../lib/queries";
import type { Announcement, Priority } from "../../lib/types";
import { formatDateTime } from "../../lib/format";

// Priority values map to the schema enum; labels match the family-facing chips
// (routine shows as "Update").
const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "routine", label: "Update" },
  { value: "important", label: "Important" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" },
];

const PRIORITY_LABEL: Record<Priority, string> = {
  routine: "Update",
  important: "Important",
  urgent: "Urgent",
  emergency: "Emergency",
};

const label = "text-sm font-medium text-fg";
const inputBase =
  "rounded-sm border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent";

interface FormState {
  title: string;
  body: string;
  priority: Priority;
  pinned: boolean;
  requiresAck: boolean;
}

const EMPTY: FormState = {
  title: "",
  body: "",
  priority: "routine",
  pinned: false,
  requiresAck: false,
};

export function AdminAnnouncementsPage() {
  const { session } = useAuth();
  const create = useCreateAnnouncement(session?.user.id);
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();
  const { data: announcements = [] } = useAnnouncements();

  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pending = create.isPending || update.isPending;

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body ?? "",
      priority: a.priority,
      pinned: a.pinned,
      requiresAck: a.requiresAck,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, title: form.title.trim(), body: form.body.trim() };
    if (editingId) {
      update.mutate({ id: editingId, ...payload }, { onSuccess: cancelEdit });
    } else {
      create.mutate(payload, { onSuccess: () => setForm(EMPTY) });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-sm text-muted">
          {editingId
            ? "Editing a published announcement. Families will see the update immediately."
            : "Posts a studio-wide announcement families see immediately — no SQL required."}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className={label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Recital dress rehearsal moved to Friday"
            className={inputBase}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label} htmlFor="body">
            Content
          </label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            rows={6}
            placeholder="Share the details families need…"
            className={`${inputBase} resize-y leading-relaxed`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label} htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => set("priority", e.target.value as Priority)}
            className={inputBase}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-line bg-bg-secondary p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => set("pinned", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--accent,#173540)]"
            />
            <span className="text-sm">
              <span className="font-medium text-fg">Pin announcement</span>
              <span className="block text-muted">Keeps it at the top of the list.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.requiresAck}
              onChange={(e) => set("requiresAck", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--accent,#173540)]"
            />
            <span className="text-sm">
              <span className="font-medium text-fg">Require acknowledgment</span>
              <span className="block text-muted">
                Families must tap “Acknowledge” — you can track who has.
              </span>
            </span>
          </label>
        </div>

        {(create.isError || update.isError) && (
          <p className="text-sm text-red-600">
            Couldn’t save — {((create.error ?? update.error) as Error).message}
          </p>
        )}
        {create.isSuccess && !editingId && (
          <p className="text-sm text-green-700">✓ Published. It’s live for families now.</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || !form.title.trim()}
            className="rounded-sm bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Publish announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-muted hover:text-fg hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
          Published ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted">Nothing published yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {announcements.map((a) => (
              <li key={a.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {a.pinned && <span className="text-xs">📌</span>}
                    <span className="truncate font-medium text-fg">{a.title}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {PRIORITY_LABEL[a.priority]} · {formatDateTime(a.publishedAt)}
                    {a.requiresAck ? " · needs ack" : ""}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(a)}
                  className="flex-none rounded-sm border border-line px-3 py-1 text-xs text-fg transition-colors hover:bg-fg/[0.04]"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete “${a.title}”? This can’t be undone.`)) {
                      remove.mutate(a.id);
                      if (editingId === a.id) cancelEdit();
                    }
                  }}
                  className="flex-none rounded-sm px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        {remove.isError && (
          <p className="text-sm text-red-600">
            Couldn’t delete — {(remove.error as Error).message}
          </p>
        )}
      </section>
    </div>
  );
}
