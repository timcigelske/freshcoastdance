
/*
# Fix Overly Permissive RLS Policies

## Summary
Tightens four INSERT/UPDATE policies that previously used `WITH CHECK (true)` or
`USING (true)`, effectively bypassing row-level security for authenticated users.

## Changes

### attendance_responses
- INSERT: restricted to rows where `user_id = auth.uid()` (parents submit under their own ID)
- UPDATE: restricted to the submitting user or staff/admin/teacher

### conversation_participants
- INSERT: restricted to adding yourself OR admin/owner adding others (not arbitrary adds)

### notifications
- INSERT: restricted to inserting for yourself OR by admin/owner (system inserts)

## Security notes
These policies prevent:
- Any authenticated user inserting RSVP records with arbitrary user_id values
- Any authenticated user updating other users' attendance records
- Any authenticated user adding arbitrary people to conversations
- Any authenticated user creating notifications for other users
*/

-- attendance_responses INSERT: must be the submitting user
DROP POLICY IF EXISTS "attendance_insert" ON attendance_responses;
CREATE POLICY "attendance_insert" ON attendance_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin', 'teacher')
    )
  );

-- attendance_responses UPDATE: own record or staff
DROP POLICY IF EXISTS "attendance_update" ON attendance_responses;
CREATE POLICY "attendance_update" ON attendance_responses FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin', 'teacher')
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin', 'teacher')
    )
  );

-- conversation_participants INSERT: add yourself, or admin/owner adds others
DROP POLICY IF EXISTS "conv_participants_insert" ON conversation_participants;
CREATE POLICY "conv_participants_insert" ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin')
    )
  );

-- notifications INSERT: create for yourself, or admin/owner creates for others
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin')
    )
  );
