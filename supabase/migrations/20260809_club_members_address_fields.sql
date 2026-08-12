-- Address fields on club_members, synced from member My Details form
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS address_line2 text;
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.club_members ADD COLUMN IF NOT EXISTS postcode text;
