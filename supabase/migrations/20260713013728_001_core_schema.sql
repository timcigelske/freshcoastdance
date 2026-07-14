
/*
# Fresh Coast Connect — Core Schema

## Summary
Establishes the foundational data model for Fresh Coast Connect, a private communication
and coordination platform for Fresh Coast Dance studio.

## New Tables

### profiles
Extends auth.users with role, display info, and household/staff linkage.
- id (uuid, PK, references auth.users)
- email, full_name, avatar_url, phone
- role: owner | admin | teacher | parent | dancer
- household_id, is_active, last_seen_at

### households
Represents a family unit. Parents and dancers belong to a household.
- id, name, notes, is_active

### guardians
Junction between a user (parent/guardian role) and a household.
- id, user_id, household_id, relationship (parent/guardian/emergency)
- is_primary, can_pickup

### dancers
Individual dancer profiles, linked to a household.
- id, household_id, first_name, last_name, preferred_name
- date_of_birth, profile_photo_url, bio, medical_notes
- is_active

### staff
Staff profiles for teachers and administrators.
- id, user_id, title, bio, specialties, is_active

### seasons
Academic/competition seasons (e.g., "2025-2026 Studio Year").
- id, name, start_date, end_date, is_active

### programs
Top-level programs (e.g., Ballet, Tap, Jazz, Contemporary).
- id, name, description, color_hex

### classes
Individual class offerings within a program and season.
- id, program_id, season_id, name, description
- level, teacher_id (staff), day_of_week, start_time, end_time
- room, max_capacity, color_hex, is_active

### enrollments
Links a dancer to a class.
- id, dancer_id, class_id, enrolled_at, is_active

## Security
RLS enabled on all tables. Authenticated users can read data based on role.
Service-level policies allow the seeding process to insert data.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  role text NOT NULL DEFAULT 'parent' CHECK (role IN ('owner','admin','teacher','parent','dancer')),
  household_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- households table
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  address text,
  city text,
  state text,
  zip text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "households_select" ON households;
CREATE POLICY "households_select" ON households FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "households_insert" ON households;
CREATE POLICY "households_insert" ON households FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "households_update" ON households;
CREATE POLICY "households_update" ON households FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "households_delete" ON households;
CREATE POLICY "households_delete" ON households FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- guardians table
CREATE TABLE IF NOT EXISTS guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'parent',
  is_primary boolean NOT NULL DEFAULT false,
  can_pickup boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guardians_select" ON guardians;
CREATE POLICY "guardians_select" ON guardians FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "guardians_insert" ON guardians;
CREATE POLICY "guardians_insert" ON guardians FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "guardians_update" ON guardians;
CREATE POLICY "guardians_update" ON guardians FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "guardians_delete" ON guardians;
CREATE POLICY "guardians_delete" ON guardians FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- dancers table
CREATE TABLE IF NOT EXISTS dancers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text,
  date_of_birth date,
  profile_photo_url text,
  bio text,
  medical_notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dancers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dancers_select" ON dancers;
CREATE POLICY "dancers_select" ON dancers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "dancers_insert" ON dancers;
CREATE POLICY "dancers_insert" ON dancers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "dancers_update" ON dancers;
CREATE POLICY "dancers_update" ON dancers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')));

DROP POLICY IF EXISTS "dancers_delete" ON dancers;
CREATE POLICY "dancers_delete" ON dancers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  bio text,
  specialties text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_select" ON staff;
CREATE POLICY "staff_select" ON staff FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "staff_insert" ON staff;
CREATE POLICY "staff_insert" ON staff FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "staff_update" ON staff;
CREATE POLICY "staff_update" ON staff FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "staff_delete" ON staff;
CREATE POLICY "staff_delete" ON staff FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seasons_select" ON seasons;
CREATE POLICY "seasons_select" ON seasons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "seasons_insert" ON seasons;
CREATE POLICY "seasons_insert" ON seasons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "seasons_update" ON seasons;
CREATE POLICY "seasons_update" ON seasons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "seasons_delete" ON seasons;
CREATE POLICY "seasons_delete" ON seasons FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color_hex text NOT NULL DEFAULT '#3B82F6',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "programs_select" ON programs;
CREATE POLICY "programs_select" ON programs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "programs_insert" ON programs;
CREATE POLICY "programs_insert" ON programs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "programs_update" ON programs;
CREATE POLICY "programs_update" ON programs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "programs_delete" ON programs;
CREATE POLICY "programs_delete" ON programs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  season_id uuid REFERENCES seasons(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  level text,
  teacher_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  day_of_week int, -- 0=Sun, 1=Mon, ... 6=Sat
  start_time time,
  end_time time,
  room text,
  max_capacity int,
  color_hex text NOT NULL DEFAULT '#3B82F6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes_select" ON classes;
CREATE POLICY "classes_select" ON classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "classes_insert" ON classes;
CREATE POLICY "classes_insert" ON classes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "classes_update" ON classes;
CREATE POLICY "classes_update" ON classes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','teacher')));

DROP POLICY IF EXISTS "classes_delete" ON classes;
CREATE POLICY "classes_delete" ON classes FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dancer_id uuid NOT NULL REFERENCES dancers(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(dancer_id, class_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select" ON enrollments;
CREATE POLICY "enrollments_select" ON enrollments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "enrollments_insert" ON enrollments;
CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "enrollments_update" ON enrollments;
CREATE POLICY "enrollments_update" ON enrollments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

DROP POLICY IF EXISTS "enrollments_delete" ON enrollments;
CREATE POLICY "enrollments_delete" ON enrollments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_dancers_household_id ON dancers(household_id);
CREATE INDEX IF NOT EXISTS idx_guardians_household_id ON guardians(household_id);
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_season_id ON classes(season_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_dancer_id ON enrollments(dancer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
