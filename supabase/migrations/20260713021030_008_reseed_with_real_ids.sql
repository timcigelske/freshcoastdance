
/*
# Re-seed Staff, Guardians, Group Memberships, Conversations

## Summary
Re-seeds all tables that reference profile IDs, using the actual UUIDs assigned
by Supabase Auth Admin API (not the original hardcoded IDs). Also updates
profile roles and household links. Households, dancers, classes, events,
announcements, files, tasks, and groups are already intact.
*/

DO $$
DECLARE
  -- Actual auth-assigned profile IDs
  uid_owner    uuid := (SELECT id FROM profiles WHERE email = 'owner@freshcoastdance.com');
  uid_admin1   uuid := (SELECT id FROM profiles WHERE email = 'admin@freshcoastdance.com');
  uid_admin2   uuid := (SELECT id FROM profiles WHERE email = 'info@freshcoastdance.com');
  uid_t1       uuid := (SELECT id FROM profiles WHERE email = 'teacher.ballet@freshcoastdance.com');
  uid_t2       uuid := (SELECT id FROM profiles WHERE email = 'teacher.tap@freshcoastdance.com');
  uid_t3       uuid := (SELECT id FROM profiles WHERE email = 'teacher.jazz@freshcoastdance.com');
  uid_t4       uuid := (SELECT id FROM profiles WHERE email = 'teacher.acro@freshcoastdance.com');
  uid_t5       uuid := (SELECT id FROM profiles WHERE email = 'teacher.leaps@freshcoastdance.com');
  uid_p1       uuid := (SELECT id FROM profiles WHERE email = 'parent1@example.com');
  uid_p2       uuid := (SELECT id FROM profiles WHERE email = 'parent2@example.com');
  uid_p3       uuid := (SELECT id FROM profiles WHERE email = 'parent3@example.com');
  uid_p4       uuid := (SELECT id FROM profiles WHERE email = 'parent4@example.com');
  uid_p5       uuid := (SELECT id FROM profiles WHERE email = 'parent5@example.com');
  uid_p6       uuid := (SELECT id FROM profiles WHERE email = 'parent6@example.com');
  uid_p7       uuid := (SELECT id FROM profiles WHERE email = 'parent7@example.com');
  uid_p8       uuid := (SELECT id FROM profiles WHERE email = 'parent8@example.com');
  uid_p9       uuid := (SELECT id FROM profiles WHERE email = 'parent9@example.com');
  uid_p10      uuid := (SELECT id FROM profiles WHERE email = 'parent10@example.com');
  uid_p11      uuid := (SELECT id FROM profiles WHERE email = 'parent11@example.com');
  uid_p12      uuid := (SELECT id FROM profiles WHERE email = 'parent12@example.com');

  -- Households
  hh1  uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  hh2  uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  hh3  uuid := 'aaaaaaaa-0000-0000-0000-000000000003';
  hh4  uuid := 'aaaaaaaa-0000-0000-0000-000000000004';
  hh5  uuid := 'aaaaaaaa-0000-0000-0000-000000000005';
  hh6  uuid := 'aaaaaaaa-0000-0000-0000-000000000006';
  hh7  uuid := 'aaaaaaaa-0000-0000-0000-000000000007';
  hh8  uuid := 'aaaaaaaa-0000-0000-0000-000000000008';
  hh9  uuid := 'aaaaaaaa-0000-0000-0000-000000000009';
  hh10 uuid := 'aaaaaaaa-0000-0000-0000-000000000010';
  hh11 uuid := 'aaaaaaaa-0000-0000-0000-000000000011';
  hh12 uuid := 'aaaaaaaa-0000-0000-0000-000000000012';

  -- Staff records
  staff_t1 uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  staff_t2 uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  staff_t3 uuid := 'bbbbbbbb-0000-0000-0000-000000000003';
  staff_t4 uuid := 'bbbbbbbb-0000-0000-0000-000000000004';
  staff_t5 uuid := 'bbbbbbbb-0000-0000-0000-000000000005';

  -- Groups (fetch existing)
  grp_studio   uuid := (SELECT id FROM groups WHERE name = 'Fresh Coast Dance');
  grp_staff    uuid := (SELECT id FROM groups WHERE name = 'FCD Staff');
  grp_ballet4  uuid := (SELECT id FROM groups WHERE name = 'Ballet Level 4');

  -- Conversation IDs
  conv1 uuid := gen_random_uuid();
  conv2 uuid := gen_random_uuid();
  conv3 uuid := gen_random_uuid();

BEGIN

  -- Ensure profiles have correct roles and household links
  UPDATE profiles SET role = 'owner',   household_id = NULL WHERE email = 'owner@freshcoastdance.com';
  UPDATE profiles SET role = 'admin',   household_id = NULL WHERE email = 'admin@freshcoastdance.com';
  UPDATE profiles SET role = 'admin',   household_id = NULL WHERE email = 'info@freshcoastdance.com';
  UPDATE profiles SET role = 'teacher', household_id = NULL WHERE email = 'teacher.ballet@freshcoastdance.com';
  UPDATE profiles SET role = 'teacher', household_id = NULL WHERE email = 'teacher.tap@freshcoastdance.com';
  UPDATE profiles SET role = 'teacher', household_id = NULL WHERE email = 'teacher.jazz@freshcoastdance.com';
  UPDATE profiles SET role = 'teacher', household_id = NULL WHERE email = 'teacher.acro@freshcoastdance.com';
  UPDATE profiles SET role = 'teacher', household_id = NULL WHERE email = 'teacher.leaps@freshcoastdance.com';
  UPDATE profiles SET role = 'parent', household_id = hh1  WHERE email = 'parent1@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh2  WHERE email = 'parent2@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh3  WHERE email = 'parent3@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh4  WHERE email = 'parent4@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh5  WHERE email = 'parent5@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh6  WHERE email = 'parent6@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh7  WHERE email = 'parent7@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh8  WHERE email = 'parent8@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh9  WHERE email = 'parent9@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh10 WHERE email = 'parent10@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh11 WHERE email = 'parent11@example.com';
  UPDATE profiles SET role = 'parent', household_id = hh12 WHERE email = 'parent12@example.com';

  -- Re-seed staff records
  INSERT INTO staff (id, user_id, title, specialties) VALUES
    (staff_t1, uid_t1, 'Ballet Director',         ARRAY['Ballet','Pointe','Contemporary']),
    (staff_t2, uid_t2, 'Tap Instructor',           ARRAY['Tap','Jazz']),
    (staff_t3, uid_t3, 'Jazz & Contemporary Instructor', ARRAY['Jazz','Contemporary','Modern']),
    (staff_t4, uid_t4, 'Acrobatics Instructor',    ARRAY['Acro','Gymnastics','Flexibility']),
    (staff_t5, uid_t5, 'Technique Specialist',     ARRAY['Leaps & Turns','Ballet','Stretch'])
  ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id;

  -- Re-seed guardians
  INSERT INTO guardians (user_id, household_id, relationship, is_primary) VALUES
    (uid_p1,  hh1,  'parent', true),
    (uid_p2,  hh2,  'parent', true),
    (uid_p3,  hh3,  'parent', true),
    (uid_p4,  hh4,  'parent', true),
    (uid_p5,  hh5,  'parent', true),
    (uid_p6,  hh6,  'parent', true),
    (uid_p7,  hh7,  'parent', true),
    (uid_p8,  hh8,  'parent', true),
    (uid_p9,  hh9,  'parent', true),
    (uid_p10, hh10, 'parent', true),
    (uid_p11, hh11, 'parent', true),
    (uid_p12, hh12, 'parent', true)
  ON CONFLICT DO NOTHING;

  -- Re-seed group memberships
  INSERT INTO group_memberships (group_id, user_id, role) VALUES
    (grp_studio, uid_owner,  'admin'),
    (grp_studio, uid_admin1, 'admin'),
    (grp_studio, uid_admin2, 'admin'),
    (grp_studio, uid_t1,     'member'),
    (grp_studio, uid_t2,     'member'),
    (grp_studio, uid_t3,     'member'),
    (grp_studio, uid_t4,     'member'),
    (grp_studio, uid_t5,     'member'),
    (grp_studio, uid_p1,     'member'),
    (grp_studio, uid_p2,     'member'),
    (grp_studio, uid_p3,     'member'),
    (grp_staff,  uid_owner,  'admin'),
    (grp_staff,  uid_admin1, 'admin'),
    (grp_staff,  uid_t1,     'member'),
    (grp_staff,  uid_t2,     'member'),
    (grp_staff,  uid_t3,     'member'),
    (grp_staff,  uid_t4,     'member'),
    (grp_staff,  uid_t5,     'member'),
    (grp_ballet4, uid_admin1, 'admin'),
    (grp_ballet4, uid_p1,     'member'),
    (grp_ballet4, uid_p5,     'member')
  ON CONFLICT DO NOTHING;

  -- Fix event & announcement author references
  UPDATE events       SET created_by = uid_admin1 WHERE created_by IS NULL;
  UPDATE announcements SET author_id  = uid_admin1 WHERE author_id  IS NULL;
  UPDATE tasks        SET created_by  = uid_admin1 WHERE created_by  IS NULL;
  UPDATE files        SET uploaded_by = uid_admin1 WHERE uploaded_by IS NULL;

  -- Re-seed conversations and messages
  INSERT INTO conversations (id, type, title, created_by, last_message_at) VALUES
    (conv1, 'group',  'FCD Staff',                   uid_owner,  NOW() - interval '2 hours'),
    (conv2, 'direct', NULL,                           uid_p1,     NOW() - interval '30 minutes'),
    (conv3, 'class',  'Ballet Level 4 — Parent Chat', uid_admin1, NOW() - interval '1 day')
  ON CONFLICT DO NOTHING;

  INSERT INTO conversation_participants (conversation_id, user_id) VALUES
    (conv1, uid_owner), (conv1, uid_admin1), (conv1, uid_admin2),
    (conv1, uid_t1), (conv1, uid_t2), (conv1, uid_t3), (conv1, uid_t4), (conv1, uid_t5),
    (conv2, uid_p1), (conv2, uid_t1),
    (conv3, uid_admin1), (conv3, uid_p1), (conv3, uid_p5)
  ON CONFLICT DO NOTHING;

  INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES
    (conv1, uid_owner,  'Hi team — reminder that faculty meeting is next week. Please review the end-of-year checklist I posted to the Files section.', NOW() - interval '3 hours'),
    (conv1, uid_t1,     'Thanks Diane. I''ll have the Ballet 5 show order submitted by Friday.',                                                       NOW() - interval '2 hours'),
    (conv1, uid_t2,     'Noted! Tap music files are already uploaded.',                                                                                 NOW() - interval '2 hours'),
    (conv2, uid_p1,     'Hi Ms. Sophia! Quick question about Avery''s pointe shoes for the recital finale — do you need them by dress rehearsal or the shows?', NOW() - interval '1 hour'),
    (conv2, uid_t1,     'Hi Laurel! She will definitely need them for dress rehearsal. Let me know if you need a fitting recommendation!',               NOW() - interval '30 minutes'),
    (conv3, uid_admin1, 'Ballet Level 4 families — just a reminder that next week''s class is in Studio B due to the photo session. Same time, 5:00–6:30 p.m.', NOW() - interval '1 day'),
    (conv3, uid_p1,     'Thanks for the heads up! We''ll be there.',                                                                                    NOW() - interval '23 hours'),
    (conv3, uid_p5,     'Got it, thank you!',                                                                                                           NOW() - interval '22 hours')
  ON CONFLICT DO NOTHING;

  -- Re-seed announcement reads and task completions with real IDs
  INSERT INTO announcement_reads (announcement_id, user_id)
  SELECT id, uid_p1 FROM announcements WHERE title IN (
    'Spring Recital 2026 — Save the Dates',
    'Registration Open — 2026–2027 Season',
    'Welcome to Fresh Coast Connect!',
    'Volunteer Sign-Ups: Recital Backstage Help'
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO task_completions (task_id, user_id, dancer_id, notes)
  SELECT t.id, uid_p2, NULL, 'Isabelle will be in both shows'
  FROM tasks t WHERE title = 'Confirm Spring Recital Participation'
  ON CONFLICT DO NOTHING;

END $$;
