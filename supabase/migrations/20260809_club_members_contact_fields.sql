-- Add contact/emergency fields to club_members for sync from member My Details
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
