
/*
# Fresh Coast Connect — Seed Profiles, Households, Dancers, Staff, Classes

## Summary
Populates profiles, households, dancers, staff, programs, seasons, and classes
with realistic fictional Fresh Coast Dance data.
*/

DO $$
DECLARE
  uid_owner uuid := '11111111-0000-0000-0000-000000000001';
  uid_admin1 uuid := '11111111-0000-0000-0000-000000000002';
  uid_admin2 uuid := '11111111-0000-0000-0000-000000000003';
  uid_t1 uuid := '11111111-0000-0000-0000-000000000004';
  uid_t2 uuid := '11111111-0000-0000-0000-000000000005';
  uid_t3 uuid := '11111111-0000-0000-0000-000000000006';
  uid_t4 uuid := '11111111-0000-0000-0000-000000000007';
  uid_t5 uuid := '11111111-0000-0000-0000-000000000008';
  uid_p1 uuid := '22222222-0000-0000-0000-000000000001';
  uid_p2 uuid := '22222222-0000-0000-0000-000000000002';
  uid_p3 uuid := '22222222-0000-0000-0000-000000000003';
  uid_p4 uuid := '22222222-0000-0000-0000-000000000004';
  uid_p5 uuid := '22222222-0000-0000-0000-000000000005';
  uid_p6 uuid := '22222222-0000-0000-0000-000000000006';
  uid_p7 uuid := '22222222-0000-0000-0000-000000000007';
  uid_p8 uuid := '22222222-0000-0000-0000-000000000008';
  uid_p9 uuid := '22222222-0000-0000-0000-000000000009';
  uid_p10 uuid := '22222222-0000-0000-0000-000000000010';
  uid_p11 uuid := '22222222-0000-0000-0000-000000000011';
  uid_p12 uuid := '22222222-0000-0000-0000-000000000012';

  -- Households
  hh1 uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  hh2 uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  hh3 uuid := 'aaaaaaaa-0000-0000-0000-000000000003';
  hh4 uuid := 'aaaaaaaa-0000-0000-0000-000000000004';
  hh5 uuid := 'aaaaaaaa-0000-0000-0000-000000000005';
  hh6 uuid := 'aaaaaaaa-0000-0000-0000-000000000006';
  hh7 uuid := 'aaaaaaaa-0000-0000-0000-000000000007';
  hh8 uuid := 'aaaaaaaa-0000-0000-0000-000000000008';
  hh9 uuid := 'aaaaaaaa-0000-0000-0000-000000000009';
  hh10 uuid := 'aaaaaaaa-0000-0000-0000-000000000010';
  hh11 uuid := 'aaaaaaaa-0000-0000-0000-000000000011';
  hh12 uuid := 'aaaaaaaa-0000-0000-0000-000000000012';

  -- Staff IDs
  staff_t1 uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  staff_t2 uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  staff_t3 uuid := 'bbbbbbbb-0000-0000-0000-000000000003';
  staff_t4 uuid := 'bbbbbbbb-0000-0000-0000-000000000004';
  staff_t5 uuid := 'bbbbbbbb-0000-0000-0000-000000000005';

  -- Season and Programs
  season_id uuid := 'cccccccc-0000-0000-0000-000000000001';
  prog_ballet uuid := 'dddddddd-0000-0000-0000-000000000001';
  prog_tap uuid := 'dddddddd-0000-0000-0000-000000000002';
  prog_jazz uuid := 'dddddddd-0000-0000-0000-000000000003';
  prog_contemp uuid := 'dddddddd-0000-0000-0000-000000000004';
  prog_acro uuid := 'dddddddd-0000-0000-0000-000000000005';
  prog_leaps uuid := 'dddddddd-0000-0000-0000-000000000006';

  -- Classes
  cls_ballet3 uuid := 'eeeeeeee-0000-0000-0000-000000000001';
  cls_ballet4 uuid := 'eeeeeeee-0000-0000-0000-000000000002';
  cls_ballet5 uuid := 'eeeeeeee-0000-0000-0000-000000000003';
  cls_tap3 uuid := 'eeeeeeee-0000-0000-0000-000000000004';
  cls_tap4 uuid := 'eeeeeeee-0000-0000-0000-000000000005';
  cls_jazz34 uuid := 'eeeeeeee-0000-0000-0000-000000000006';
  cls_contemp5 uuid := 'eeeeeeee-0000-0000-0000-000000000007';
  cls_acro345 uuid := 'eeeeeeee-0000-0000-0000-000000000008';
  cls_leaps5 uuid := 'eeeeeeee-0000-0000-0000-000000000009';

  -- Dancers (18 fictional)
  d1 uuid := 'ffffffff-0000-0000-0000-000000000001';
  d2 uuid := 'ffffffff-0000-0000-0000-000000000002';
  d3 uuid := 'ffffffff-0000-0000-0000-000000000003';
  d4 uuid := 'ffffffff-0000-0000-0000-000000000004';
  d5 uuid := 'ffffffff-0000-0000-0000-000000000005';
  d6 uuid := 'ffffffff-0000-0000-0000-000000000006';
  d7 uuid := 'ffffffff-0000-0000-0000-000000000007';
  d8 uuid := 'ffffffff-0000-0000-0000-000000000008';
  d9 uuid := 'ffffffff-0000-0000-0000-000000000009';
  d10 uuid := 'ffffffff-0000-0000-0000-000000000010';
  d11 uuid := 'ffffffff-0000-0000-0000-000000000011';
  d12 uuid := 'ffffffff-0000-0000-0000-000000000012';
  d13 uuid := 'ffffffff-0000-0000-0000-000000000013';
  d14 uuid := 'ffffffff-0000-0000-0000-000000000014';
  d15 uuid := 'ffffffff-0000-0000-0000-000000000015';
  d16 uuid := 'ffffffff-0000-0000-0000-000000000016';
  d17 uuid := 'ffffffff-0000-0000-0000-000000000017';
  d18 uuid := 'ffffffff-0000-0000-0000-000000000018';

BEGIN

  -- Households
  INSERT INTO households (id, name) VALUES
    (hh1, 'Thornton Family'),
    (hh2, 'Delacroix Family'),
    (hh3, 'Kingsley Family'),
    (hh4, 'Okafor Family'),
    (hh5, 'Nguyen Family'),
    (hh6, 'Whitfield Family'),
    (hh7, 'Castillo Family'),
    (hh8, 'Bernstein Family'),
    (hh9, 'Laurent Family'),
    (hh10, 'Malone Family'),
    (hh11, 'Flores Family'),
    (hh12, 'Washington Family')
  ON CONFLICT (id) DO NOTHING;

  -- Profiles
  INSERT INTO profiles (id, email, full_name, role, household_id) VALUES
    (uid_owner, 'owner@freshcoastdance.com', 'Diane Holloway', 'owner', NULL),
    (uid_admin1, 'admin@freshcoastdance.com', 'Marcus Webb', 'admin', NULL),
    (uid_admin2, 'info@freshcoastdance.com', 'Priya Nair', 'admin', NULL),
    (uid_t1, 'teacher.ballet@freshcoastdance.com', 'Sophia Reyes', 'teacher', NULL),
    (uid_t2, 'teacher.tap@freshcoastdance.com', 'Jordan Ellis', 'teacher', NULL),
    (uid_t3, 'teacher.jazz@freshcoastdance.com', 'Nia Foster', 'teacher', NULL),
    (uid_t4, 'teacher.acro@freshcoastdance.com', 'Caleb Monroe', 'teacher', NULL),
    (uid_t5, 'teacher.leaps@freshcoastdance.com', 'Hannah Park', 'teacher', NULL),
    (uid_p1, 'parent1@example.com', 'Laurel Thornton', 'parent', hh1),
    (uid_p2, 'parent2@example.com', 'Chris Delacroix', 'parent', hh2),
    (uid_p3, 'parent3@example.com', 'Tamara Kingsley', 'parent', hh3),
    (uid_p4, 'parent4@example.com', 'Ben Okafor', 'parent', hh4),
    (uid_p5, 'parent5@example.com', 'Rachel Nguyen', 'parent', hh5),
    (uid_p6, 'parent6@example.com', 'James Whitfield', 'parent', hh6),
    (uid_p7, 'parent7@example.com', 'Sofia Castillo', 'parent', hh7),
    (uid_p8, 'parent8@example.com', 'Aaron Bernstein', 'parent', hh8),
    (uid_p9, 'parent9@example.com', 'Maya Laurent', 'parent', hh9),
    (uid_p10, 'parent10@example.com', 'Derek Malone', 'parent', hh10),
    (uid_p11, 'parent11@example.com', 'Candace Flores', 'parent', hh11),
    (uid_p12, 'parent12@example.com', 'Trevor Washington', 'parent', hh12)
  ON CONFLICT (id) DO NOTHING;

  -- Guardians
  INSERT INTO guardians (user_id, household_id, relationship, is_primary) VALUES
    (uid_p1, hh1, 'parent', true),
    (uid_p2, hh2, 'parent', true),
    (uid_p3, hh3, 'parent', true),
    (uid_p4, hh4, 'parent', true),
    (uid_p5, hh5, 'parent', true),
    (uid_p6, hh6, 'parent', true),
    (uid_p7, hh7, 'parent', true),
    (uid_p8, hh8, 'parent', true),
    (uid_p9, hh9, 'parent', true),
    (uid_p10, hh10, 'parent', true),
    (uid_p11, hh11, 'parent', true),
    (uid_p12, hh12, 'parent', true)
  ON CONFLICT DO NOTHING;

  -- Staff records
  INSERT INTO staff (id, user_id, title, specialties) VALUES
    (staff_t1, uid_t1, 'Ballet Director', ARRAY['Ballet', 'Pointe', 'Contemporary']),
    (staff_t2, uid_t2, 'Tap Instructor', ARRAY['Tap', 'Jazz']),
    (staff_t3, uid_t3, 'Jazz & Contemporary Instructor', ARRAY['Jazz', 'Contemporary', 'Modern']),
    (staff_t4, uid_t4, 'Acrobatics Instructor', ARRAY['Acro', 'Gymnastics', 'Flexibility']),
    (staff_t5, uid_t5, 'Technique Specialist', ARRAY['Leaps & Turns', 'Ballet', 'Stretch'])
  ON CONFLICT (id) DO NOTHING;

  -- Season
  INSERT INTO seasons (id, name, start_date, end_date, is_active) VALUES
    (season_id, '2025–2026 Studio Year', '2025-09-01', '2026-06-30', true)
  ON CONFLICT (id) DO NOTHING;

  -- Programs
  INSERT INTO programs (id, name, description, color_hex, sort_order) VALUES
    (prog_ballet, 'Ballet', 'Classical ballet technique and artistry', '#1E3A5F', 1),
    (prog_tap, 'Tap', 'Rhythm, musicality and technical tap skills', '#2563EB', 2),
    (prog_jazz, 'Jazz', 'Jazz technique, performance quality and style', '#0891B2', 3),
    (prog_contemp, 'Contemporary', 'Contemporary technique and expressive movement', '#0D9488', 4),
    (prog_acro, 'Acrobatics', 'Safe acrobatics, flexibility and conditioning', '#7C3AED', 5),
    (prog_leaps, 'Leaps & Turns', 'Technical skill development for turns and jumps', '#DC2626', 6)
  ON CONFLICT (id) DO NOTHING;

  -- Classes (day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  INSERT INTO classes (id, program_id, season_id, name, level, teacher_id, day_of_week, start_time, end_time, room, color_hex) VALUES
    (cls_ballet3, prog_ballet, season_id, 'Ballet Level 3', '3', staff_t1, 1, '17:00', '18:30', 'Studio A', '#1E3A5F'),
    (cls_ballet4, prog_ballet, season_id, 'Ballet Level 4', '4', staff_t1, 2, '17:00', '18:30', 'Studio B', '#1E3A5F'),
    (cls_ballet5, prog_ballet, season_id, 'Ballet Level 5', '5', staff_t1, 3, '18:00', '20:00', 'Studio A', '#1E3A5F'),
    (cls_tap3, prog_tap, season_id, 'Tap Level 3', '3', staff_t2, 1, '18:30', '19:30', 'Studio B', '#2563EB'),
    (cls_tap4, prog_tap, season_id, 'Tap Level 4 & 5', '4-5', staff_t2, 4, '17:00', '18:30', 'Studio B', '#2563EB'),
    (cls_jazz34, prog_jazz, season_id, 'Jazz Levels 3 & 4', '3-4', staff_t3, 3, '17:00', '18:00', 'Studio C', '#0891B2'),
    (cls_contemp5, prog_contemp, season_id, 'Contemporary Level 5', '5', staff_t3, 5, '18:00', '19:30', 'Studio A', '#0D9488'),
    (cls_acro345, prog_acro, season_id, 'Acro Levels 3, 4 & 5', '3-5', staff_t4, 6, '10:00', '11:30', 'Studio C', '#7C3AED'),
    (cls_leaps5, prog_leaps, season_id, 'Leaps & Turns Level 5', '5', staff_t5, 5, '17:00', '18:00', 'Studio B', '#DC2626')
  ON CONFLICT (id) DO NOTHING;

  -- Dancers (18 fictional)
  INSERT INTO dancers (id, household_id, first_name, last_name, date_of_birth) VALUES
    (d1, hh1, 'Avery', 'Thornton', '2012-03-15'),
    (d2, hh1, 'Owen', 'Thornton', '2014-07-22'),
    (d3, hh2, 'Isabelle', 'Delacroix', '2011-11-08'),
    (d4, hh2, 'Mia', 'Delacroix', '2013-05-30'),
    (d5, hh3, 'Jade', 'Kingsley', '2012-09-14'),
    (d6, hh4, 'Zara', 'Okafor', '2010-02-27'),
    (d7, hh4, 'Eli', 'Okafor', '2013-12-05'),
    (d8, hh5, 'Lily', 'Nguyen', '2011-06-18'),
    (d9, hh5, 'Chloe', 'Nguyen', '2013-04-09'),
    (d10, hh6, 'Marcus Jr.', 'Whitfield', '2012-08-21'),
    (d11, hh7, 'Elena', 'Castillo', '2010-01-11'),
    (d12, hh7, 'Valentina', 'Castillo', '2012-10-03'),
    (d13, hh8, 'Noah', 'Bernstein', '2013-07-16'),
    (d14, hh9, 'Camille', 'Laurent', '2011-03-28'),
    (d15, hh10, 'Tyler', 'Malone', '2010-09-07'),
    (d16, hh11, 'Sofia', 'Flores', '2012-05-19'),
    (d17, hh12, 'Devin', 'Washington', '2011-11-30'),
    (d18, hh3, 'Piper', 'Kingsley', '2010-08-12')
  ON CONFLICT (id) DO NOTHING;

  -- Enrollments (realistic class assignments)
  INSERT INTO enrollments (dancer_id, class_id) VALUES
    -- Avery Thornton: Ballet 4, Tap 4, Contemporary 5
    (d1, cls_ballet4), (d1, cls_tap4), (d1, cls_contemp5), (d1, cls_leaps5),
    -- Owen Thornton: Ballet 3, Tap 3
    (d2, cls_ballet3), (d2, cls_tap3),
    -- Isabelle Delacroix: Ballet 5, Jazz 3-4, Contemporary 5, Leaps 5
    (d3, cls_ballet5), (d3, cls_jazz34), (d3, cls_contemp5), (d3, cls_leaps5),
    -- Mia Delacroix: Ballet 3, Tap 3
    (d4, cls_ballet3), (d4, cls_tap3),
    -- Jade Kingsley: Ballet 4, Jazz 3-4, Acro
    (d5, cls_ballet4), (d5, cls_jazz34), (d5, cls_acro345),
    -- Zara Okafor: Ballet 5, Tap 4, Leaps 5
    (d6, cls_ballet5), (d6, cls_tap4), (d6, cls_leaps5),
    -- Eli Okafor: Ballet 3, Acro
    (d7, cls_ballet3), (d7, cls_acro345),
    -- Lily Nguyen: Ballet 4, Contemporary 5, Leaps 5
    (d8, cls_ballet4), (d8, cls_contemp5), (d8, cls_leaps5),
    -- Chloe Nguyen: Ballet 3, Jazz 3-4
    (d9, cls_ballet3), (d9, cls_jazz34),
    -- Marcus Jr. Whitfield: Ballet 3, Tap 3
    (d10, cls_ballet3), (d10, cls_tap3),
    -- Elena Castillo: Ballet 5, Tap 4, Jazz 3-4, Leaps 5
    (d11, cls_ballet5), (d11, cls_tap4), (d11, cls_jazz34), (d11, cls_leaps5),
    -- Valentina Castillo: Ballet 4, Acro
    (d12, cls_ballet4), (d12, cls_acro345),
    -- Noah Bernstein: Ballet 3, Acro
    (d13, cls_ballet3), (d13, cls_acro345),
    -- Camille Laurent: Ballet 5, Contemporary 5, Leaps 5
    (d14, cls_ballet5), (d14, cls_contemp5), (d14, cls_leaps5),
    -- Tyler Malone: Tap 4, Jazz 3-4
    (d15, cls_tap4), (d15, cls_jazz34),
    -- Sofia Flores: Ballet 4, Jazz 3-4
    (d16, cls_ballet4), (d16, cls_jazz34),
    -- Devin Washington: Ballet 3, Tap 3
    (d17, cls_ballet3), (d17, cls_tap3),
    -- Piper Kingsley: Ballet 5, Contemporary 5
    (d18, cls_ballet5), (d18, cls_contemp5)
  ON CONFLICT (dancer_id, class_id) DO NOTHING;

END $$;
