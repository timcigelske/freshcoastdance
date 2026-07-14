export type UserRole = 'owner' | 'admin' | 'teacher' | 'parent' | 'dancer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  household_id: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  notes: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Guardian {
  id: string;
  user_id: string | null;
  household_id: string;
  relationship: string;
  is_primary: boolean;
  can_pickup: boolean;
  created_at: string;
  profile?: Profile;
  household?: Household;
}

export interface Dancer {
  id: string;
  household_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  household?: Household;
  enrollments?: Enrollment[];
}

export interface Staff {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  specialties: string[];
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Season {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  description: string | null;
  color_hex: string;
  sort_order: number;
  created_at: string;
}

export interface Class {
  id: string;
  program_id: string | null;
  season_id: string | null;
  name: string;
  description: string | null;
  level: string | null;
  teacher_id: string | null;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  max_capacity: number | null;
  color_hex: string;
  is_active: boolean;
  created_at: string;
  program?: Program;
  teacher?: Staff & { profile: Profile };
}

export interface Enrollment {
  id: string;
  dancer_id: string;
  class_id: string;
  enrolled_at: string;
  is_active: boolean;
  class?: Class;
  dancer?: Dancer;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  type: string;
  cover_image_url: string | null;
  color_hex: string;
  class_id: string | null;
  season_id: string | null;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string | null;
  dancer_id: string | null;
  role: 'member' | 'admin';
  is_active: boolean;
  created_at: string;
  profile?: Profile;
  dancer?: Dancer;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location: string | null;
  room: string | null;
  arrival_time: string | null;
  dismissal_time: string | null;
  teacher_id: string | null;
  class_id: string | null;
  group_ids: string[] | null;
  requires_rsvp: boolean;
  rsvp_deadline: string | null;
  capacity: number | null;
  dress_code: string | null;
  what_to_bring: string | null;
  notes: string | null;
  is_cancelled: boolean;
  is_modified: boolean;
  cancellation_note: string | null;
  modification_note: string | null;
  created_by: string | null;
  visibility: string;
  color_hex: string;
  is_recurring: boolean;
  created_at: string;
  teacher?: Staff & { profile: Profile };
  class?: Class;
  attendance_responses?: AttendanceResponse[];
}

export interface AttendanceResponse {
  id: string;
  event_id: string;
  dancer_id: string | null;
  user_id: string | null;
  rsvp_status: 'going' | 'not_going' | 'unsure' | 'late' | 'leaving_early' | null;
  rsvp_note: string | null;
  rsvp_at: string | null;
  actual_status: 'present' | 'absent' | 'late' | 'left_early' | null;
  actual_note: string | null;
  checked_in_at: string | null;
  created_at: string;
  dancer?: Dancer;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author_id: string | null;
  audience_type: string;
  group_ids: string[] | null;
  household_ids: string[] | null;
  dancer_ids: string[] | null;
  priority: 'routine' | 'important' | 'urgent' | 'emergency';
  publish_at: string;
  expires_at: string | null;
  is_pinned: boolean;
  is_published: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  requires_acknowledgment: boolean;
  related_event_id: string | null;
  attachment_urls: string[] | null;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  read?: boolean;
  acknowledged?: boolean;
  comment_count?: number;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface AnnouncementAcknowledgment {
  id: string;
  announcement_id: string;
  user_id: string;
  dancer_id: string | null;
  acknowledged_at: string;
  note: string | null;
}

export interface Comment {
  id: string;
  announcement_id: string;
  author_id: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
  author?: Profile;
}

export interface Folder {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  audience_type: string;
  season_id: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  file_count?: number;
}

export interface FileRecord {
  id: string;
  name: string;
  description: string | null;
  file_type: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  folder_id: string | null;
  uploaded_by: string | null;
  audience_type: string;
  is_pinned: boolean;
  tags: string[] | null;
  season_id: string | null;
  created_at: string;
  folder?: Folder;
  uploader?: Profile;
}

export interface Conversation {
  id: string;
  type: string;
  title: string | null;
  created_by: string | null;
  group_id: string | null;
  class_id: string | null;
  last_message_at: string | null;
  is_archived: boolean;
  created_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  is_muted: boolean;
  last_read_at: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  attachment_name: string | null;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  sender?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  audience_type: string;
  group_ids: string[] | null;
  household_ids: string[] | null;
  dancer_ids: string[] | null;
  due_at: string | null;
  related_event_id: string | null;
  related_file_id: string | null;
  allows_file_upload: boolean;
  requires_signature: boolean;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  completed?: boolean;
  completions?: TaskCompletion[];
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  dancer_id: string | null;
  completed_at: string;
  notes: string | null;
  file_url: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
