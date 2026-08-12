-- Run this in the Supabase SQL editor before deploying the new auth flow.
-- Adds password_set flag to club_members.

ALTER TABLE club_members
  ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false;

-- Members whose auth_user_id is already set completed the old invite flow
-- and almost certainly have a password. Mark them done so they go straight
-- to the new password-based login without hitting the first-time setup page.
UPDATE club_members
SET password_set = true
WHERE auth_user_id IS NOT NULL;
