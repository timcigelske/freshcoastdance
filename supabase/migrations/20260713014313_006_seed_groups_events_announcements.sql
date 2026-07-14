
/*
# Fresh Coast Connect — Seed Groups, Events, Announcements, Files, Tasks

## Summary
Seeds groups, calendar events (with attendance), announcements with reads/acks,
file folders and files, and parent tasks.
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

  hh1 uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  hh2 uuid := 'aaaaaaaa-0000-0000-0000-000000000002';
  hh3 uuid := 'aaaaaaaa-0000-0000-0000-000000000003';

  staff_t1 uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  staff_t2 uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  staff_t3 uuid := 'bbbbbbbb-0000-0000-0000-000000000003';
  staff_t4 uuid := 'bbbbbbbb-0000-0000-0000-000000000004';
  staff_t5 uuid := 'bbbbbbbb-0000-0000-0000-000000000005';

  season_id uuid := 'cccccccc-0000-0000-0000-000000000001';

  cls_ballet3 uuid := 'eeeeeeee-0000-0000-0000-000000000001';
  cls_ballet4 uuid := 'eeeeeeee-0000-0000-0000-000000000002';
  cls_ballet5 uuid := 'eeeeeeee-0000-0000-0000-000000000003';
  cls_tap3 uuid := 'eeeeeeee-0000-0000-0000-000000000004';
  cls_tap4 uuid := 'eeeeeeee-0000-0000-0000-000000000005';
  cls_jazz34 uuid := 'eeeeeeee-0000-0000-0000-000000000006';
  cls_contemp5 uuid := 'eeeeeeee-0000-0000-0000-000000000007';
  cls_acro345 uuid := 'eeeeeeee-0000-0000-0000-000000000008';
  cls_leaps5 uuid := 'eeeeeeee-0000-0000-0000-000000000009';

  d1 uuid := 'ffffffff-0000-0000-0000-000000000001';
  d3 uuid := 'ffffffff-0000-0000-0000-000000000003';
  d6 uuid := 'ffffffff-0000-0000-0000-000000000006';
  d8 uuid := 'ffffffff-0000-0000-0000-000000000008';
  d11 uuid := 'ffffffff-0000-0000-0000-000000000011';
  d14 uuid := 'ffffffff-0000-0000-0000-000000000014';
  d18 uuid := 'ffffffff-0000-0000-0000-000000000018';

  -- Group IDs
  grp_studio uuid := gen_random_uuid();
  grp_staff uuid := gen_random_uuid();
  grp_company uuid := gen_random_uuid();
  grp_ballet4 uuid := gen_random_uuid();
  grp_ballet5 uuid := gen_random_uuid();
  grp_comp_team uuid := gen_random_uuid();
  grp_parents uuid := gen_random_uuid();

  -- Event IDs
  evt1 uuid := gen_random_uuid();
  evt2 uuid := gen_random_uuid();
  evt3 uuid := gen_random_uuid();
  evt4 uuid := gen_random_uuid();
  evt5 uuid := gen_random_uuid();
  evt6 uuid := gen_random_uuid();
  evt7 uuid := gen_random_uuid();
  evt8 uuid := gen_random_uuid();
  evt9 uuid := gen_random_uuid();
  evt10 uuid := gen_random_uuid();

  -- Announcement IDs
  ann1 uuid := gen_random_uuid();
  ann2 uuid := gen_random_uuid();
  ann3 uuid := gen_random_uuid();
  ann4 uuid := gen_random_uuid();
  ann5 uuid := gen_random_uuid();
  ann6 uuid := gen_random_uuid();
  ann7 uuid := gen_random_uuid();
  ann8 uuid := gen_random_uuid();
  ann9 uuid := gen_random_uuid();
  ann10 uuid := gen_random_uuid();
  ann11 uuid := gen_random_uuid();
  ann12 uuid := gen_random_uuid();

  -- Folder IDs
  fld_recital uuid := gen_random_uuid();
  fld_competition uuid := gen_random_uuid();
  fld_costumes uuid := gen_random_uuid();
  fld_music uuid := gen_random_uuid();
  fld_faculty uuid := gen_random_uuid();

  -- Task IDs
  task1 uuid := gen_random_uuid();
  task2 uuid := gen_random_uuid();
  task3 uuid := gen_random_uuid();
  task4 uuid := gen_random_uuid();
  task5 uuid := gen_random_uuid();

  -- Conversation IDs
  conv1 uuid := gen_random_uuid();
  conv2 uuid := gen_random_uuid();
  conv3 uuid := gen_random_uuid();

BEGIN

  -- === GROUPS ===
  INSERT INTO groups (id, name, description, type, color_hex) VALUES
    (grp_studio, 'Fresh Coast Dance', 'Main studio community — all members', 'studio', '#1E3A5F'),
    (grp_staff, 'FCD Staff', 'Teaching faculty and administrative team', 'staff', '#1E40AF'),
    (grp_company, 'FCD Company', 'Competition company dancers', 'company', '#7C3AED'),
    (grp_ballet4, 'Ballet Level 4', 'Ballet Level 4 class group', 'recreational', '#2563EB'),
    (grp_ballet5, 'Ballet Level 5', 'Ballet Level 5 class group', 'recreational', '#1E3A5F'),
    (grp_comp_team, 'Competition Team', 'Dancers competing this season', 'competition', '#DC2626'),
    (grp_parents, 'Parent Committee', 'Studio parent volunteer group', 'parent', '#0891B2')
  ON CONFLICT DO NOTHING;

  -- Group memberships (staff)
  INSERT INTO group_memberships (group_id, user_id, role) VALUES
    (grp_studio, uid_owner, 'admin'),
    (grp_studio, uid_admin1, 'admin'),
    (grp_studio, uid_admin2, 'admin'),
    (grp_studio, uid_t1, 'member'),
    (grp_studio, uid_t2, 'member'),
    (grp_studio, uid_t3, 'member'),
    (grp_studio, uid_t4, 'member'),
    (grp_studio, uid_t5, 'member'),
    (grp_studio, uid_p1, 'member'),
    (grp_studio, uid_p2, 'member'),
    (grp_studio, uid_p3, 'member'),
    (grp_staff, uid_owner, 'admin'),
    (grp_staff, uid_admin1, 'admin'),
    (grp_staff, uid_t1, 'member'),
    (grp_staff, uid_t2, 'member'),
    (grp_staff, uid_t3, 'member'),
    (grp_staff, uid_t4, 'member'),
    (grp_staff, uid_t5, 'member')
  ON CONFLICT DO NOTHING;

  -- === EVENTS ===
  INSERT INTO events (id, title, event_type, start_at, end_at, location, room, teacher_id, class_id, requires_rsvp, dress_code, what_to_bring, created_by, color_hex, is_modified, modification_note) VALUES
    -- Regular classes this week
    (evt1, 'Ballet Level 4 — Weekly Class', 'class',
     (NOW() + interval '1 day')::date + time '17:00', (NOW() + interval '1 day')::date + time '18:30',
     'Fresh Coast Dance', 'Studio B', staff_t1, cls_ballet4, false, 'Black leotard, pink tights, ballet shoes', 'Water bottle', uid_admin1, '#1E3A5F', true, 'Room change: Studio B instead of Studio A tonight only'),
    (evt2, 'Tap Level 4 & 5 — Weekly Class', 'class',
     (NOW() + interval '3 days')::date + time '17:00', (NOW() + interval '3 days')::date + time '18:30',
     'Fresh Coast Dance', 'Studio B', staff_t2, cls_tap4, false, 'Comfortable dancewear, tap shoes', 'Water bottle', uid_admin1, '#2563EB', false, NULL),
    (evt3, 'Contemporary Level 5 — Weekly Class', 'class',
     (NOW() + interval '4 days')::date + time '18:00', (NOW() + interval '4 days')::date + time '19:30',
     'Fresh Coast Dance', 'Studio A', staff_t3, cls_contemp5, false, 'Dance leggings or shorts, any dance shoes or barefoot', 'Water bottle', uid_admin1, '#0D9488', false, NULL),
    -- Competition rehearsal
    (evt4, 'Competition Team Rehearsal', 'rehearsal',
     (NOW() + interval '2 days')::date + time '10:00', (NOW() + interval '2 days')::date + time '12:30',
     'Fresh Coast Dance', 'Studio A', staff_t1, NULL, true, 'All competition costume pieces for run-through', 'All dance shoes, water, team jacket', uid_admin1, '#DC2626', false, NULL),
    -- Dress rehearsal
    (evt5, 'Spring Recital Dress Rehearsal', 'recital',
     (NOW() + interval '14 days')::date + time '08:00', (NOW() + interval '14 days')::date + time '18:00',
     'Hillside Performing Arts Center', 'Main Stage', NULL, NULL, true, 'Full recital costume, hair and makeup per show order', 'All costumes, shoes, hair supplies, lunch and snacks', uid_admin1, '#7C3AED', false, NULL),
    -- Recital
    (evt6, 'Spring Recital — Show 1', 'recital',
     (NOW() + interval '21 days')::date + time '14:00', (NOW() + interval '21 days')::date + time '17:00',
     'Hillside Performing Arts Center', 'Main Stage', NULL, NULL, true, 'Full recital costume', 'All costumes, shoes, hair supplies', uid_admin1, '#7C3AED', false, NULL),
    (evt7, 'Spring Recital — Show 2', 'recital',
     (NOW() + interval '21 days')::date + time '19:00', (NOW() + interval '21 days')::date + time '22:00',
     'Hillside Performing Arts Center', 'Main Stage', NULL, NULL, true, 'Full recital costume', 'All costumes, shoes, hair supplies', uid_admin1, '#7C3AED', false, NULL),
    -- Special event
    (evt8, 'Regional Competition — Spring Showcase', 'competition',
     (NOW() + interval '30 days')::date + time '07:00', (NOW() + interval '30 days')::date + time '20:00',
     'Metro Convention Center', 'Ballroom A', NULL, NULL, true, 'Competition costume, warmup gear', 'All dance shoes, costume, makeup kit, snacks, team jacket', uid_admin1, '#DC2626', false, NULL),
    -- Staff meeting
    (evt9, 'Faculty Meeting — End of Year Planning', 'meeting',
     (NOW() + interval '7 days')::date + time '19:00', (NOW() + interval '7 days')::date + time '20:30',
     'Fresh Coast Dance', 'Lobby', NULL, NULL, false, NULL, NULL, uid_owner, '#1E40AF', false, NULL),
    -- Parent information night
    (evt10, 'Recital Parent Information Night', 'special',
     (NOW() + interval '10 days')::date + time '19:00', (NOW() + interval '10 days')::date + time '20:30',
     'Fresh Coast Dance', 'Studio A', NULL, NULL, true, NULL, NULL, uid_admin1, '#0891B2', false, NULL)
  ON CONFLICT DO NOTHING;

  -- Attendance responses for competition rehearsal
  INSERT INTO attendance_responses (event_id, dancer_id, user_id, rsvp_status, rsvp_at) VALUES
    (evt4, d1, uid_p1, 'going', NOW() - interval '1 day'),
    (evt4, d3, uid_p2, 'going', NOW() - interval '2 days'),
    (evt4, d6, uid_p4, 'not_going', NOW() - interval '1 day'),
    (evt4, d8, uid_p5, 'going', NOW() - interval '3 hours'),
    (evt4, d11, uid_p6, 'late', NOW() - interval '30 minutes')
  ON CONFLICT DO NOTHING;

  -- === ANNOUNCEMENTS ===
  INSERT INTO announcements (id, title, body, author_id, priority, audience_type, requires_acknowledgment, is_pinned, is_published) VALUES
    (ann1, 'Tonight: Ballet Level 4 Room Change',
     '<p><strong>Important update for Ballet Level 4 families:</strong></p><p>Tonight''s Ballet Level 4 class will meet in <strong>Studio B</strong> instead of Studio A. The class time remains <strong>5:00–6:30 p.m.</strong></p><p>Studio A is being used for a photo session this afternoon. Please arrive at Studio B entrance. Thank you for your flexibility!</p>',
     uid_admin1, 'urgent', 'all', true, true, true),
    (ann2, 'Spring Recital 2026 — Save the Dates',
     '<p>We are thrilled to announce the dates for <strong>Spring Recital 2026: Waves of Motion</strong>!</p><ul><li><strong>Dress Rehearsal:</strong> Saturday, ' || to_char(NOW() + interval '14 days', 'Month DD') || ' at Hillside Performing Arts Center</li><li><strong>Show 1:</strong> ' || to_char(NOW() + interval '21 days', 'Month DD') || ' at 2:00 p.m.</li><li><strong>Show 2:</strong> ' || to_char(NOW() + interval '21 days', 'Month DD') || ' at 7:00 p.m.</li></ul><p>More details about costumes, hair and makeup, and ticket sales to follow. Please mark your calendars!</p>',
     uid_owner, 'important', 'all', false, true, true),
    (ann3, 'Competition Team — Regional Showcase Information',
     '<p>Competition families, please review the following details for the upcoming <strong>Regional Spring Showcase</strong>:</p><ul><li><strong>Date:</strong> ' || to_char(NOW() + interval '30 days', 'Month DD') || '</li><li><strong>Location:</strong> Metro Convention Center, Ballroom A</li><li><strong>Arrival Time:</strong> 7:00 a.m. sharp — do not be late</li><li><strong>What to bring:</strong> All costumes labeled with dancer name, all dance shoes, full makeup kit, team jacket, healthy snacks and lunch</li></ul><p>A detailed itinerary has been uploaded to the Competition folder. Please review it carefully.</p>',
     uid_admin1, 'important', 'group', false, false, true),
    (ann4, 'Recital Hair and Makeup Instructions Now Available',
     '<p>The hair and makeup guide for Spring Recital 2026 is now available in the Files section under <strong>Recital 2026 > Costumes, Hair & Makeup</strong>.</p><p>Please review the instructions for each of your dancer''s numbers carefully. All dancers must arrive to dress rehearsal with hair and makeup <strong>already complete</strong>.</p><p>Questions? Message your dancer''s teacher directly.</p>',
     uid_admin2, 'important', 'all', true, false, true),
    (ann5, 'Registration Open — 2026–2027 Season',
     '<p>Registration for the 2026–2027 studio year is now open for current families!</p><p>Current students have priority registration through ' || to_char(NOW() + interval '30 days', 'Month DD') || '. Class schedules and descriptions are available on the studio website.</p><p>Please complete the re-enrollment form in the Tasks section to hold your dancer''s spot.</p>',
     uid_owner, 'important', 'all', false, false, true),
    (ann6, 'Costume Balance Due — May 15',
     '<p>Reminder: The second costume payment is due by <strong>May 15</strong>. Costumes not paid in full by this date may result in your dancer not having their costume for dress rehearsal.</p><p>Payments can be made at the front desk or through the studio portal. Please contact Marcus or Priya if you have questions about your balance.</p>',
     uid_admin1, 'important', 'all', true, false, true),
    (ann7, 'Ballet Level 5 — Pointe Shoe Order',
     '<p>Ballet Level 5 dancers who do not yet have pointe shoes for the recital finale: please contact Ms. Sophia by end of this week. We have arranged a group fitting at Dance World on Saturday.</p><p>All Level 5 dancers will need to have their pointe shoes no later than the dress rehearsal.</p>',
     uid_t1, 'routine', 'all', false, false, true),
    (ann8, 'Acro Class — No Class This Saturday',
     '<p>There will be <strong>no Acrobatics class this Saturday</strong> due to a facility conflict. We apologize for the short notice.</p><p>Mr. Caleb will schedule a makeup class the following Saturday. Notification will be sent once confirmed.</p>',
     uid_t4, 'important', 'all', false, false, true),
    (ann9, 'Welcome to Fresh Coast Connect!',
     '<p>Welcome to <strong>Fresh Coast Connect</strong> — your private hub for everything happening at Fresh Coast Dance.</p><p>Here you''ll find:</p><ul><li>Studio announcements and important updates</li><li>Your family''s class and event calendar</li><li>Files, music, and costume information</li><li>Tasks and forms that need your attention</li><li>Direct messaging with teachers and staff</li></ul><p>We''re so glad you''re here. Dance season is going to be amazing!</p>',
     uid_owner, 'routine', 'all', false, false, true),
    (ann10, 'Staff Note: End of Year Checklist',
     '<p>Faculty team — please review and complete the following before the end of the studio year:</p><ol><li>Submit final recital show order by ' || to_char(NOW() + interval '5 days', 'Mon DD') || '</li><li>Upload final competition music files to the folder by ' || to_char(NOW() + interval '3 days', 'Mon DD') || '</li><li>Confirm attendance records are up to date</li><li>Submit any supply requests for the fall season</li></ol><p>Thank you for an outstanding year.</p>',
     uid_owner, 'important', 'staff', false, false, true),
    (ann11, 'Leaps & Turns Intensive — Summer Registration',
     '<p>Ms. Hannah will be hosting a <strong>Leaps & Turns Intensive</strong> this summer, open to Levels 3 through 5.</p><p>Dates: Three Saturdays in July. Small group format, limited spots. This is an excellent opportunity for dancers looking to strengthen technique before the fall season.</p><p>Sign-up form coming soon to the Tasks section.</p>',
     uid_t5, 'routine', 'all', false, false, true),
    (ann12, 'Volunteer Sign-Ups: Recital Backstage Help',
     '<p>We need parent volunteers to help backstage at both recital shows! Backstage helpers assist with quick changes, keeping dancers calm, and guiding them to and from the stage.</p><p>Please complete the volunteer sign-up task if you are available for Show 1, Show 2, or both. Volunteers receive a complimentary ticket to the show they are working.</p>',
     uid_admin2, 'routine', 'all', false, false, true)
  ON CONFLICT DO NOTHING;

  -- Mark some announcements as read by parent1
  INSERT INTO announcement_reads (announcement_id, user_id) VALUES
    (ann2, uid_p1), (ann5, uid_p1), (ann9, uid_p1), (ann12, uid_p1)
  ON CONFLICT DO NOTHING;

  -- Ack for ann9 (welcome)
  INSERT INTO announcement_acknowledgments (announcement_id, user_id, dancer_id) VALUES
    (ann9, uid_p2, NULL)
  ON CONFLICT DO NOTHING;

  -- === FOLDERS ===
  INSERT INTO folders (id, name, description, sort_order, created_by) VALUES
    (fld_recital, 'Recital 2026', 'All files for the Spring Recital 2026: Waves of Motion', 1, uid_admin1),
    (fld_competition, 'Competition', 'Competition music, itineraries and routines', 2, uid_admin1),
    (fld_costumes, 'Costumes, Hair & Makeup', 'Costume specifications, hair and makeup instructions', 3, uid_admin2),
    (fld_music, 'Class Music', 'Music files for class use', 4, uid_t1),
    (fld_faculty, 'Faculty Resources', 'Resources and documents for staff only', 5, uid_owner)
  ON CONFLICT DO NOTHING;

  -- Files
  INSERT INTO files (name, description, file_type, url, folder_id, uploaded_by, audience_type, is_pinned, tags) VALUES
    ('Spring Recital 2026 — Show Order.pdf', 'Complete running order for both shows', 'pdf',
     'https://storage.example.com/files/show-order-2026.pdf', fld_recital, uid_admin1, 'all', true,
     ARRAY['recital','show order']),
    ('Dress Rehearsal Schedule.pdf', 'Detailed schedule for all cast members', 'pdf',
     'https://storage.example.com/files/dress-rehearsal-schedule.pdf', fld_recital, uid_admin1, 'all', true,
     ARRAY['recital','dress rehearsal']),
    ('Recital Hair and Makeup Guide.pdf', 'Hair and makeup instructions for each number', 'pdf',
     'https://storage.example.com/files/hair-makeup-guide-2026.pdf', fld_costumes, uid_admin2, 'all', true,
     ARRAY['recital','costumes','hair','makeup']),
    ('Costume Inventory — All Dancers.xlsx', 'Master costume list with dancer assignments', 'spreadsheet',
     'https://storage.example.com/files/costume-inventory-2026.xlsx', fld_costumes, uid_admin2, 'all', false,
     ARRAY['costumes']),
    ('Regional Competition Itinerary.pdf', 'Full competition day schedule and logistics', 'pdf',
     'https://storage.example.com/files/regional-competition-itinerary.pdf', fld_competition, uid_admin1, 'group', true,
     ARRAY['competition','itinerary']),
    ('Waves of Motion — Ballet 5 Competition Music.mp3', 'Ballet Level 5 competition piece', 'audio',
     'https://storage.example.com/files/ballet5-competition-music.mp3', fld_competition, uid_t1, 'group', true,
     ARRAY['competition','music','ballet']),
    ('Contemporary 5 — Solo Music.mp3', 'Contemporary Level 5 competition piece', 'audio',
     'https://storage.example.com/files/contemp5-competition-music.mp3', fld_competition, uid_t3, 'group', false,
     ARRAY['competition','music','contemporary']),
    ('Jazz Trio — Competition Music.mp3', 'Jazz Levels 3 & 4 competition music', 'audio',
     'https://storage.example.com/files/jazz34-competition-music.mp3', fld_competition, uid_t3, 'group', false,
     ARRAY['competition','music','jazz']),
    ('Ballet 4 — Class Warm-Up Playlist.m3u', 'Weekly warm-up music playlist', 'audio',
     'https://storage.example.com/files/ballet4-warmup.m3u', fld_music, uid_t1, 'all', false,
     ARRAY['class','music','ballet']),
    ('Tap 4-5 — Recital Music.mp3', 'Tap recital piece music', 'audio',
     'https://storage.example.com/files/tap45-recital-music.mp3', fld_recital, uid_t2, 'all', false,
     ARRAY['recital','music','tap']),
    ('End of Year Teacher Checklist.docx', 'Staff year-end checklist', 'document',
     'https://storage.example.com/files/teacher-checklist-2026.docx', fld_faculty, uid_owner, 'staff', false,
     ARRAY['staff']),
    ('Studio Handbook 2025–2026.pdf', 'Complete studio policies and procedures', 'pdf',
     'https://storage.example.com/files/studio-handbook-2025-26.pdf', NULL, uid_owner, 'all', true,
     ARRAY['handbook','policies']),
    ('Spring Recital Ticket Information.pdf', 'How to purchase and manage recital tickets', 'pdf',
     'https://storage.example.com/files/recital-ticket-info.pdf', fld_recital, uid_admin1, 'all', false,
     ARRAY['recital','tickets']),
    ('Ballet 5 Costume Spec Sheet.pdf', 'Specifications for Ballet Level 5 recital costume', 'pdf',
     'https://storage.example.com/files/ballet5-costume-spec.pdf', fld_costumes, uid_admin2, 'all', false,
     ARRAY['costumes','ballet']),
    ('Contemporary 5 Costume Spec Sheet.pdf', 'Contemporary Level 5 competition costume specs', 'pdf',
     'https://storage.example.com/files/contemp5-costume-spec.pdf', fld_costumes, uid_admin2, 'all', false,
     ARRAY['costumes','contemporary']),
    ('Photo Release Form.pdf', 'Annual photo and media release for all dancers', 'pdf',
     'https://storage.example.com/files/photo-release-2026.pdf', NULL, uid_admin2, 'all', false,
     ARRAY['forms','legal']),
    ('Fall 2026 Class Schedule Draft.pdf', 'Preliminary schedule for fall enrollment', 'pdf',
     'https://storage.example.com/files/fall-2026-schedule-draft.pdf', fld_faculty, uid_admin1, 'staff', false,
     ARRAY['staff','schedule']),
    ('Competition Makeup Reference Sheet.pdf', 'Stage makeup guide for competition', 'pdf',
     'https://storage.example.com/files/competition-makeup-ref.pdf', fld_costumes, uid_admin2, 'all', false,
     ARRAY['competition','makeup','costumes']),
    ('Leaps and Turns Technique Notes.pdf', 'Ms. Hannah''s technique notes for levels 3-5', 'pdf',
     'https://storage.example.com/files/leaps-turns-technique.pdf', fld_faculty, uid_t5, 'all', false,
     ARRAY['technique','leaps','turns']),
    ('Emergency Contact Form Template.pdf', 'Annual emergency contact update form', 'pdf',
     'https://storage.example.com/files/emergency-contact-form.pdf', NULL, uid_admin1, 'all', false,
     ARRAY['forms','emergency'])
  ON CONFLICT DO NOTHING;

  -- === TASKS ===
  INSERT INTO tasks (id, title, description, task_type, audience_type, due_at, created_by, is_active) VALUES
    (task1, 'Confirm Spring Recital Participation',
     'Please confirm that your dancer will be participating in Spring Recital 2026: Waves of Motion. Note any show conflicts in the comments.',
     'acknowledgment', 'all', NOW() + interval '7 days', uid_admin1, true),
    (task2, 'Review Recital Hair and Makeup Instructions',
     'Please review the hair and makeup guide for your dancer''s recital numbers and acknowledge that you have read and understand the requirements.',
     'acknowledgment', 'all', NOW() + interval '14 days', uid_admin2, true),
    (task3, 'Update Emergency Contact Information',
     'Please verify and update your household''s emergency contact information. This must be completed each season.',
     'form', 'all', NOW() + interval '10 days', uid_admin1, true),
    (task4, 'Volunteer Sign-Up — Recital Backstage',
     'Sign up to help backstage for Show 1, Show 2, or both. Backstage volunteers receive a complimentary ticket.',
     'signup', 'all', NOW() + interval '21 days', uid_admin2, true),
    (task5, 'Complete Re-Enrollment for 2026–2027',
     'Confirm your dancer''s classes for the upcoming season. Current students have priority enrollment through the deadline listed.',
     'form', 'all', NOW() + interval '30 days', uid_owner, true)
  ON CONFLICT DO NOTHING;

  -- Some task completions
  INSERT INTO task_completions (task_id, user_id, dancer_id, notes) VALUES
    (task1, uid_p2, d3, 'Isabelle will be in both shows'),
    (task3, uid_p3, NULL, 'Updated June contact info')
  ON CONFLICT DO NOTHING;

  -- === CONVERSATIONS ===
  INSERT INTO conversations (id, type, title, created_by, last_message_at) VALUES
    (conv1, 'group', 'FCD Staff', uid_owner, NOW() - interval '2 hours'),
    (conv2, 'direct', NULL, uid_p1, NOW() - interval '30 minutes'),
    (conv3, 'class', 'Ballet Level 4 — Parent Chat', uid_admin1, NOW() - interval '1 day')
  ON CONFLICT DO NOTHING;

  INSERT INTO conversation_participants (conversation_id, user_id) VALUES
    (conv1, uid_owner), (conv1, uid_admin1), (conv1, uid_admin2),
    (conv1, uid_t1), (conv1, uid_t2), (conv1, uid_t3), (conv1, uid_t4), (conv1, uid_t5),
    (conv2, uid_p1), (conv2, uid_t1),
    (conv3, uid_admin1), (conv3, uid_p1), (conv3, uid_p5)
  ON CONFLICT DO NOTHING;

  INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES
    (conv1, uid_owner, 'Hi team — reminder that faculty meeting is next week. Please review the end-of-year checklist I posted to the Files section.', NOW() - interval '3 hours'),
    (conv1, uid_t1, 'Thanks Diane. I''ll have the Ballet 5 show order submitted by Friday.', NOW() - interval '2 hours'),
    (conv1, uid_t2, 'Noted! Tap music files are already uploaded.', NOW() - interval '2 hours'),
    (conv2, uid_p1, 'Hi Ms. Sophia! Quick question about Avery''s pointe shoes for the recital finale — do you need them by dress rehearsal or the shows?', NOW() - interval '1 hour'),
    (conv2, uid_t1, 'Hi Laurel! She will definitely need them for dress rehearsal. I would plan to have them broken in a bit before then. Let me know if you need a fitting recommendation!', NOW() - interval '30 minutes'),
    (conv3, uid_admin1, 'Ballet Level 4 families — just a reminder that next week''s class is in Studio B due to the photo session. Same time, 5:00–6:30 p.m.', NOW() - interval '1 day'),
    (conv3, uid_p1, 'Thanks for the heads up! We''ll be there.', NOW() - interval '23 hours'),
    (conv3, uid_p5, 'Got it, thank you!', NOW() - interval '22 hours')
  ON CONFLICT DO NOTHING;

END $$;
