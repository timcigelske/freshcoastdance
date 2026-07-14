
/*
# Fresh Coast Connect — Groups, Events, and Attendance

## Summary
Adds group management, calendar events with attendance responses, and group memberships.
*/

-- groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'general' CHECK (type IN (
    'studio','staff','company','recreational','competition','recital','parent','special','general'
  )),
  cover_image_url text,
  color_hex text NOT NULL DEFAULT '#1E3A5F',
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  season_id uuid REFERENCES seasons(id) ON DELETE SET NULL,
  is_private boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "groups_select" ON groups;
CREATE POLICY "groups_select" ON groups FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "groups_insert" ON groups;
CREATE POLICY "groups_insert" ON groups FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "groups_update" ON groups;
CREATE POLICY "groups_update" ON groups FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "groups_delete" ON groups;
CREATE POLICY "groups_delete" ON groups FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- group_memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  dancer_id uuid REFERENCES dancers(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_member CHECK (user_id IS NOT NULL OR dancer_id IS NOT NULL)
);

ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_memberships_select" ON group_memberships;
CREATE POLICY "group_memberships_select" ON group_memberships FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "group_memberships_insert" ON group_memberships;
CREATE POLICY "group_memberships_insert" ON group_memberships FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "group_memberships_update" ON group_memberships;
CREATE POLICY "group_memberships_update" ON group_memberships FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "group_memberships_delete" ON group_memberships;
CREATE POLICY "group_memberships_delete" ON group_memberships FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'class' CHECK (event_type IN (
    'class','rehearsal','competition','recital','special','meeting','other'
  )),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  location text,
  room text,
  arrival_time timestamptz,
  dismissal_time timestamptz,
  teacher_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  group_ids uuid[],
  requires_rsvp boolean NOT NULL DEFAULT false,
  rsvp_deadline timestamptz,
  capacity int,
  dress_code text,
  what_to_bring text,
  notes text,
  related_file_ids uuid[],
  is_cancelled boolean NOT NULL DEFAULT false,
  is_modified boolean NOT NULL DEFAULT false,
  cancellation_note text,
  modification_note text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility IN ('all','staff','group','private')),
  color_hex text NOT NULL DEFAULT '#2563EB',
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  parent_event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')));

DROP POLICY IF EXISTS "events_update" ON events;
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')));

DROP POLICY IF EXISTS "events_delete" ON events;
CREATE POLICY "events_delete" ON events FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- attendance_responses table
CREATE TABLE IF NOT EXISTS attendance_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  dancer_id uuid REFERENCES dancers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rsvp_status text CHECK (rsvp_status IN ('going','not_going','unsure','late','leaving_early')),
  rsvp_note text,
  rsvp_at timestamptz,
  actual_status text CHECK (actual_status IN ('present','absent','late','left_early')),
  actual_note text,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, dancer_id)
);

ALTER TABLE attendance_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select" ON attendance_responses;
CREATE POLICY "attendance_select" ON attendance_responses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "attendance_insert" ON attendance_responses;
CREATE POLICY "attendance_insert" ON attendance_responses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "attendance_update" ON attendance_responses;
CREATE POLICY "attendance_update" ON attendance_responses FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "attendance_delete" ON attendance_responses;
CREATE POLICY "attendance_delete" ON attendance_responses FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')));

CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_class_id ON events(class_id);
CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON events(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_dancer_id ON attendance_responses(dancer_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
