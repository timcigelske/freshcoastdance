import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import {
  announcementFromRow,
  attendanceFromRow,
  dancerFromRow,
  eventFromRow,
  householdFromRow,
  readReceiptFromRow,
  userFromRow,
  type Dancer,
  type Priority,
  type Role,
  type RsvpStatus,
} from "./types";

/** The signed-in person's `users` row (role, household, etc.). Empty until invited by an admin. */
export function useCurrentUser(authUserId: string | undefined) {
  return useQuery({
    queryKey: ["current-user", authUserId],
    enabled: !!authUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .maybeSingle();
      if (error) throw error;
      return data ? userFromRow(data) : null;
    },
  });
}

export function useHousehold(householdId: string | null | undefined) {
  return useQuery({
    queryKey: ["household", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .eq("id", householdId)
        .single();
      if (error) throw error;
      return householdFromRow(data);
    },
  });
}

export function useDancers(householdId: string | null | undefined) {
  return useQuery({
    queryKey: ["dancers", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dancers")
        .select("*")
        .eq("household_id", householdId)
        .order("name");
      if (error) throw error;
      return data.map(dancerFromRow);
    },
  });
}

/** Upcoming events visible to the signed-in user (RLS already scopes rows to their access). */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .eq("canceled", false)
        .order("date")
        .order("start_time")
        .limit(30);
      if (error) throw error;
      return data.map(eventFromRow);
    },
  });
}

export function useRecentAnnouncements() {
  return useQuery({
    queryKey: ["recent-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("draft", false)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(announcementFromRow);
    },
  });
}

export function useAttendanceForDancers(dancerIds: string[]) {
  return useQuery({
    queryKey: ["attendance", dancerIds],
    enabled: dancerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_responses")
        .select("*")
        .in("dancer_id", dancerIds);
      if (error) throw error;
      return data.map(attendanceFromRow);
    },
  });
}

/** All announcements visible to the signed-in user (RLS scopes rows). */
export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("draft", false)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data.map(announcementFromRow);
    },
  });
}

/** The signed-in user's own read/acknowledge receipts (RLS returns only their rows). */
export function useMyReadReceipts() {
  return useQuery({
    queryKey: ["read-receipts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("read_receipts").select("*");
      if (error) throw error;
      return data.map(readReceiptFromRow);
    },
  });
}

/** Record that the current user has opened an announcement (no-op if already recorded). */
export function useMarkAnnouncementRead(authUserId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!authUserId) return;
      const { error } = await supabase.from("read_receipts").upsert(
        { announcement_id: announcementId, user_id: authUserId, read_at: new Date().toISOString() },
        { onConflict: "announcement_id,user_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["read-receipts"] }),
  });
}

/** Acknowledge an announcement that requires it. */
export function useAcknowledgeAnnouncement(authUserId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!authUserId) throw new Error("Not signed in.");
      const now = new Date().toISOString();
      const { error } = await supabase.from("read_receipts").upsert(
        { announcement_id: announcementId, user_id: authUserId, read_at: now, acknowledged_at: now },
        { onConflict: "announcement_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["read-receipts"] }),
  });
}

/** Set (or change) a dancer's RSVP for an event. */
export function useSetRsvp(authUserId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { eventId: string; dancerId: string; status: RsvpStatus }) => {
      const { error } = await supabase.from("attendance_responses").upsert(
        {
          event_id: input.eventId,
          dancer_id: input.dancerId,
          status: input.status,
          responded_by: authUserId ?? null,
          responded_at: new Date().toISOString(),
        },
        { onConflict: "event_id,dancer_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ── Admin ──────────────────────────────────────────────────────────────

/** Publish a studio-wide announcement (staff/admin only — enforced by RLS). */
export function useCreateAnnouncement(authUserId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      body: string;
      priority: Priority;
      pinned: boolean;
      requiresAck: boolean;
    }) => {
      const { data, error } = await supabase
        .from("announcements")
        .insert([
          {
            title: input.title,
            body: input.body || null,
            priority: input.priority,
            pinned: input.pinned,
            requires_ack: input.requiresAck,
            audience_scope: "studio",
            author_id: authUserId ?? null,
            published_at: new Date().toISOString(),
            draft: false,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return announcementFromRow(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["recent-announcements"] });
    },
  });
}

export interface RosterRow {
  household: string;
  first: string;
  last: string;
}

export interface ImportSummary {
  householdsCreated: number;
  householdsReused: number;
  dancersCreated: number;
}

/**
 * Seed households + dancers from parsed CSV rows (admin only — enforced by RLS).
 * Reuses households that already exist by name so re-imports don't duplicate them.
 */
export function useImportRoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: RosterRow[]): Promise<ImportSummary> => {
      const uniqueNames = [...new Set(rows.map((r) => r.household))];

      // Look up households that already exist so we map to them instead of duplicating.
      const { data: existing, error: exErr } = await supabase
        .from("households")
        .select("id,name")
        .in("name", uniqueNames);
      if (exErr) throw exErr;

      const idByName = new Map<string, string>();
      (existing ?? []).forEach((h: { id: string; name: string }) => idByName.set(h.name, h.id));
      const reused = idByName.size;

      const toCreate = uniqueNames.filter((n) => !idByName.has(n));
      if (toCreate.length > 0) {
        const { data: created, error: cErr } = await supabase
          .from("households")
          .insert(toCreate.map((name) => ({ name })))
          .select("id,name");
        if (cErr) throw cErr;
        (created ?? []).forEach((h: { id: string; name: string }) => idByName.set(h.name, h.id));
      }

      const dancerRows = rows.map((r) => ({
        household_id: idByName.get(r.household)!,
        name: `${r.first} ${r.last}`.replace(/\s+/g, " ").trim(),
      }));
      const { error: dErr } = await supabase.from("dancers").insert(dancerRows);
      if (dErr) throw dErr;

      return {
        householdsCreated: toCreate.length,
        householdsReused: reused,
        dancersCreated: dancerRows.length,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dancers"] });
      qc.invalidateQueries({ queryKey: ["households"] });
    },
  });
}

export interface EventRsvpSummary {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  responses: { status: RsvpStatus; dancerName: string }[];
}

/** Upcoming events with every dancer RSVP attached (staff/admin see all rows via RLS). */
export function useEventRsvps() {
  return useQuery({
    queryKey: ["admin-event-rsvps"],
    queryFn: async (): Promise<EventRsvpSummary[]> => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("events")
        .select("id,title,date,start_time,attendance_responses(status,dancers(name))")
        .gte("date", today)
        .eq("canceled", false)
        .order("date")
        .order("start_time");
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        startTime: e.start_time,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: (e.attendance_responses ?? []).map((r: any) => ({
          status: r.status as RsvpStatus,
          dancerName: r.dancers?.name ?? "Unknown dancer",
        })),
      }));
    },
  });
}

/** Edit an existing announcement (staff/admin only — enforced by RLS). */
export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      title: string;
      body: string;
      priority: Priority;
      pinned: boolean;
      requiresAck: boolean;
    }) => {
      const { error } = await supabase
        .from("announcements")
        .update({
          title: input.title,
          body: input.body || null,
          priority: input.priority,
          pinned: input.pinned,
          requires_ack: input.requiresAck,
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["recent-announcements"] });
    },
  });
}

/** Delete an announcement (cascades its read receipts, comments, reactions). */
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["recent-announcements"] });
    },
  });
}

export interface HouseholdWithDancers {
  id: string;
  name: string;
  dancers: Dancer[];
}

/** Every household with its dancers (staff/admin see all rows via RLS). */
export function useRoster() {
  return useQuery({
    queryKey: ["admin-roster"],
    queryFn: async (): Promise<HouseholdWithDancers[]> => {
      const { data, error } = await supabase
        .from("households")
        .select("id,name,dancers(id,household_id,name,program,birth_year)")
        .order("name");
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((h: any) => ({
        id: h.id,
        name: h.name,
        dancers: (h.dancers ?? [])
          .map(dancerFromRow)
          .sort((a: Dancer, b: Dancer) => a.name.localeCompare(b.name)),
      }));
    },
  });
}

function useRosterMutation<T>(fn: (input: T) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roster"] });
      qc.invalidateQueries({ queryKey: ["dancers"] });
      qc.invalidateQueries({ queryKey: ["household"] });
    },
  });
}

/** Rename a household (admin only — enforced by RLS). */
export function useRenameHousehold() {
  return useRosterMutation<{ id: string; name: string }>(async ({ id, name }) => {
    const { error } = await supabase.from("households").update({ name }).eq("id", id);
    if (error) throw error;
  });
}

/** Delete a household and its dancers (cascades via FK). */
export function useDeleteHousehold() {
  return useRosterMutation<string>(async (id) => {
    const { error } = await supabase.from("households").delete().eq("id", id);
    if (error) throw error;
  });
}

/** Rename a dancer (admin only — enforced by RLS). */
export function useRenameDancer() {
  return useRosterMutation<{ id: string; name: string }>(async ({ id, name }) => {
    const { error } = await supabase.from("dancers").update({ name }).eq("id", id);
    if (error) throw error;
  });
}

/** Delete a dancer (cascades their attendance responses). */
export function useDeleteDancer() {
  return useRosterMutation<string>(async (id) => {
    const { error } = await supabase.from("dancers").delete().eq("id", id);
    if (error) throw error;
  });
}

/** Everyone with a linked account (staff/admin see all rows via RLS). */
export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*").order("name");
      if (error) throw error;
      return data.map(userFromRow);
    },
  });
}

export interface InviteInput {
  email: string;
  name: string;
  role: Role;
  householdId?: string | null;
  householdName?: string | null;
}

/**
 * Invite (or link) a family login via the `invite-parent` Edge Function.
 * Sends the invitation email and writes their `users` row with the service-role
 * key server-side — auth users can't be created from the browser with the anon key.
 */
export function useInviteParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InviteInput) => {
      const { data, error } = await supabase.functions.invoke("invite-parent", {
        body: { ...input, redirectTo: window.location.origin },
      });
      if (error) {
        // Surface the function's JSON { error } body when present (it rides on .context).
        let detail = error.message;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = (error as any).context;
        if (ctx && typeof ctx.json === "function") {
          try {
            const b = await ctx.json();
            if (b?.error) detail = b.error;
          } catch {
            /* keep generic message */
          }
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      return data as { ok: boolean; invited: boolean; userId: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-users"] });
      qc.invalidateQueries({ queryKey: ["admin-roster"] });
    },
  });
}
