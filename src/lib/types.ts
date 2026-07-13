// Domain types for the web app. Mirrors web-app/supabase/schema.sql.
// Row types below are camelCase; `fromRow` mappers translate Supabase's snake_case rows.

export type Role = "owner" | "admin" | "teacher" | "parent" | "dancer";

export type AudienceScope =
  | "studio"
  | "staff"
  | "group"
  | "class"
  | "team"
  | "household"
  | "dancer";

export type Priority = "routine" | "important" | "urgent" | "emergency";

export type EventType = "class" | "rehearsal" | "competition" | "recital" | "parade" | "special";

export type RsvpStatus = "going" | "not_going" | "unsure" | "late" | "leaving_early";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string | null;
  householdId?: string | null;
}

export interface Household {
  id: string;
  name: string;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  emergencyRelation?: string | null;
  missingEmergencyInfo: boolean;
}

export interface Dancer {
  id: string;
  householdId: string;
  name: string;
  program?: string | null;
  birthYear?: number | null;
}

export interface StudioEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  room?: string | null;
  audienceScope: AudienceScope;
  audienceLabel?: string | null;
  requiredAttendance: boolean;
  arrivalTime?: string | null;
  bring?: string | null;
  dressCode?: string | null;
  rsvpDeadline?: string | null;
  changeNote?: string | null;
  canceled: boolean;
  color?: string | null;
}

export interface AttendanceResponse {
  id: string;
  eventId: string;
  dancerId: string;
  status: RsvpStatus;
  note?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body?: string | null;
  authorId?: string | null;
  audienceScope: AudienceScope;
  audienceLabel?: string | null;
  priority: Priority;
  publishedAt: string;
  requiresAck: boolean;
  pinned: boolean;
}

export interface ReadReceipt {
  announcementId: string;
  userId: string;
  readAt: string;
  acknowledgedAt?: string | null;
}

// ── Row → domain mappers ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function userFromRow(row: Row): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    title: row.title,
    householdId: row.household_id,
  };
}

export function householdFromRow(row: Row): Household {
  return {
    id: row.id,
    name: row.name,
    emergencyName: row.emergency_name,
    emergencyPhone: row.emergency_phone,
    emergencyRelation: row.emergency_relation,
    missingEmergencyInfo: row.missing_emergency_info,
  };
}

export function dancerFromRow(row: Row): Dancer {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    program: row.program,
    birthYear: row.birth_year,
  };
}

export function eventFromRow(row: Row): StudioEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    room: row.room,
    audienceScope: row.audience_scope,
    audienceLabel: row.audience_label,
    requiredAttendance: row.required_attendance,
    arrivalTime: row.arrival_time,
    bring: row.bring,
    dressCode: row.dress_code,
    rsvpDeadline: row.rsvp_deadline,
    changeNote: row.change_note,
    canceled: row.canceled,
    color: row.color,
  };
}

export function attendanceFromRow(row: Row): AttendanceResponse {
  return {
    id: row.id,
    eventId: row.event_id,
    dancerId: row.dancer_id,
    status: row.status,
    note: row.note,
  };
}

export function announcementFromRow(row: Row): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorId: row.author_id,
    audienceScope: row.audience_scope,
    audienceLabel: row.audience_label,
    priority: row.priority,
    publishedAt: row.published_at,
    requiresAck: row.requires_ack,
    pinned: row.pinned,
  };
}

export function readReceiptFromRow(row: Row): ReadReceipt {
  return {
    announcementId: row.announcement_id,
    userId: row.user_id,
    readAt: row.read_at,
    acknowledgedAt: row.acknowledged_at,
  };
}
