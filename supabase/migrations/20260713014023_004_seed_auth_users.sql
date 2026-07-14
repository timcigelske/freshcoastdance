
/*
# Fresh Coast Connect — Seed Demonstration Data

## Summary
Seeds fictional but realistic demonstration data for Fresh Coast Dance.
Creates auth users via auth.users direct insert, then populates all related tables.
All names are fictional. No real student data is used.

## Demo Accounts (all passwords: FreshCoast2026!)
- owner@freshcoastdance.com — Studio Owner (Diane Holloway)
- admin@freshcoastdance.com — Administrator (Marcus Webb)
- info@freshcoastdance.com — Administrator (Priya Nair)
- teacher.ballet@freshcoastdance.com — Ballet Teacher (Sophia Reyes)
- teacher.tap@freshcoastdance.com — Tap Teacher (Jordan Ellis)
- teacher.jazz@freshcoastdance.com — Jazz/Contemporary Teacher (Nia Foster)
- teacher.acro@freshcoastdance.com — Acro Teacher (Caleb Monroe)
- teacher.leaps@freshcoastdance.com — Leaps & Turns Teacher (Hannah Park)
- parent1@example.com — Parent (Laurel Thornton household)
- parent2@example.com — Parent (Chris & Sam Delacroix household)
- parent3@example.com — Parent (Tamara Kingsley household)
*/

-- Insert auth users using supabase's auth schema
-- We insert directly to bypass email confirmation for demo data
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
BEGIN

  -- Create auth users (with hashed password for FreshCoast2026!)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES
    (uid_owner, '00000000-0000-0000-0000-000000000000', 'owner@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Diane Holloway"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_admin1, '00000000-0000-0000-0000-000000000000', 'admin@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Marcus Webb"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_admin2, '00000000-0000-0000-0000-000000000000', 'info@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Priya Nair"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_t1, '00000000-0000-0000-0000-000000000000', 'teacher.ballet@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sophia Reyes"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_t2, '00000000-0000-0000-0000-000000000000', 'teacher.tap@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Jordan Ellis"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_t3, '00000000-0000-0000-0000-000000000000', 'teacher.jazz@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Nia Foster"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_t4, '00000000-0000-0000-0000-000000000000', 'teacher.acro@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Caleb Monroe"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_t5, '00000000-0000-0000-0000-000000000000', 'teacher.leaps@freshcoastdance.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Hannah Park"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p1, '00000000-0000-0000-0000-000000000000', 'parent1@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Laurel Thornton"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p2, '00000000-0000-0000-0000-000000000000', 'parent2@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Chris Delacroix"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p3, '00000000-0000-0000-0000-000000000000', 'parent3@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Tamara Kingsley"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p4, '00000000-0000-0000-0000-000000000000', 'parent4@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ben Okafor"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p5, '00000000-0000-0000-0000-000000000000', 'parent5@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Rachel Nguyen"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p6, '00000000-0000-0000-0000-000000000000', 'parent6@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"James Whitfield"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p7, '00000000-0000-0000-0000-000000000000', 'parent7@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sofia Castillo"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p8, '00000000-0000-0000-0000-000000000000', 'parent8@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Aaron Bernstein"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p9, '00000000-0000-0000-0000-000000000000', 'parent9@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Maya Laurent"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p10, '00000000-0000-0000-0000-000000000000', 'parent10@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Derek Malone"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p11, '00000000-0000-0000-0000-000000000000', 'parent11@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Candace Flores"}'::jsonb, now(), now(), 'authenticated', 'authenticated'),
    (uid_p12, '00000000-0000-0000-0000-000000000000', 'parent12@example.com',
     crypt('FreshCoast2026!', gen_salt('bf')), now(),
     '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Trevor Washington"}'::jsonb, now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

END $$;
