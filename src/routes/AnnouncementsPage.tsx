import * as React from "react";
import { useAuth } from "../lib/auth";
import {
  useAcknowledgeAnnouncement,
  useAnnouncements,
  useMarkAnnouncementRead,
  useMyReadReceipts,
} from "../lib/queries";
import type { Announcement, Priority, ReadReceipt } from "../lib/types";
import { formatDateTime } from "../lib/format";

const PRIORITY_STYLE: Record<Priority, { label: string; className: string }> = {
  routine: { label: "Update", className: "bg-fg/[0.06] text-muted" },
  important: { label: "Important", className: "bg-amber-100 text-amber-800" },
  urgent: { label: "Urgent", className: "bg-orange-100 text-orange-800" },
  emergency: { label: "Emergency", className: "bg-red-100 text-red-800" },
};

function PriorityChip({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLE[priority];
  return (
    <span
      className={`rounded-sm px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function AnnouncementsPage() {
  const { session } = useAuth();
  const authUserId = session?.user.id;
  const { data: announcements = [], isLoading } = useAnnouncements();
  const { data: receipts = [] } = useMyReadReceipts();
  const markRead = useMarkAnnouncementRead(authUserId);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const receiptFor = React.useMemo(() => {
    const map = new Map<string, ReadReceipt>();
    receipts.forEach((r) => map.set(r.announcementId, r));
    return map;
  }, [receipts]);

  const open = announcements.find((a) => a.id === openId) ?? null;

  function handleOpen(a: Announcement) {
    setOpenId(a.id);
    if (!receiptFor.get(a.id)) markRead.mutate(a.id);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Announcements</h1>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-muted">No announcements yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {announcements.map((a) => {
            const receipt = receiptFor.get(a.id);
            const needsAck = a.requiresAck && !receipt?.acknowledgedAt;
            const isUnread = !receipt;
            return (
              <button
                key={a.id}
                onClick={() => handleOpen(a)}
                className={`flex flex-col gap-1 rounded-md border bg-bg p-4 text-left transition-colors hover:border-accent/40 ${
                  needsAck ? "border-orange-300" : "border-line"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isUnread && <span className="h-2 w-2 flex-none rounded-full bg-accent" />}
                  {a.pinned && <span className="text-xs text-muted">📌</span>}
                  <span className="flex-1 font-medium text-fg">{a.title}</span>
                  <PriorityChip priority={a.priority} />
                </div>
                {a.body && (
                  <p className="line-clamp-2 text-sm text-fg/70">{a.body}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{formatDateTime(a.publishedAt)}</span>
                  {a.audienceLabel && <span>· {a.audienceLabel}</span>}
                  {needsAck && (
                    <span className="ml-auto font-semibold text-orange-700">
                      Needs your acknowledgment
                    </span>
                  )}
                  {a.requiresAck && !needsAck && (
                    <span className="ml-auto text-green-700">✓ Acknowledged</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <AnnouncementDetail
          announcement={open}
          receipt={receiptFor.get(open.id) ?? null}
          authUserId={authUserId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function AnnouncementDetail({
  announcement: a,
  receipt,
  authUserId,
  onClose,
}: {
  announcement: Announcement;
  receipt: ReadReceipt | null;
  authUserId: string | undefined;
  onClose: () => void;
}) {
  const acknowledge = useAcknowledgeAnnouncement(authUserId);
  const acknowledged = !!receipt?.acknowledgedAt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-bg shadow-xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-line p-5">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <PriorityChip priority={a.priority} />
              {a.pinned && <span className="text-xs text-muted">📌 Pinned</span>}
            </div>
            <h2 className="text-lg font-semibold leading-snug">{a.title}</h2>
            <p className="mt-1 text-xs text-muted">
              {formatDateTime(a.publishedAt)}
              {a.audienceLabel ? ` · ${a.audienceLabel}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-muted hover:bg-fg/[0.06]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg/85">
            {a.body || "No additional details."}
          </p>
        </div>

        {a.requiresAck && (
          <div className="border-t border-line p-5">
            {acknowledged ? (
              <p className="text-center text-sm font-medium text-green-700">
                ✓ You acknowledged this on {formatDateTime(receipt!.acknowledgedAt!)}
              </p>
            ) : (
              <button
                onClick={() => acknowledge.mutate(a.id)}
                disabled={acknowledge.isPending}
                className="w-full rounded-sm bg-accent py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {acknowledge.isPending ? "Saving…" : "Acknowledge"}
              </button>
            )}
            {acknowledge.isError && (
              <p className="mt-2 text-center text-sm text-red-600">
                Couldn't save — please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
