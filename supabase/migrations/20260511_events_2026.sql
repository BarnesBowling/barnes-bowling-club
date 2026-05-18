-- Extend events table with fields needed for the season calendar
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS category    text CHECK (category IN ('competition','match','social','external','admin','deadline')),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_tbc      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bank_holiday boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS day_label   text;

-- Allow event_date to be null (for TBC events with no confirmed date)
ALTER TABLE public.events ALTER COLUMN event_date DROP NOT NULL;

-- Remove placeholder seed data
DELETE FROM public.events WHERE title IN (
  'Season Opening Day','Club Championship — Round 1','International Day',
  'Barnes Fair Day','Club Championship — Final','Season''s End Supper'
);

-- Insert 2026 season calendar events
INSERT INTO public.events (title, event_date, description, category, is_tbc, bank_holiday, day_label, visibility) VALUES

  -- April
  ('Opening Day',
   '2026-04-25 12:00:00+01',
   'Sun Inn — lunch 12 noon for 12:30 · Raising of the Flag at The Club, 3:00 pm · 2025 Shield Final',
   'competition', false, false, 'Sat', 'members'),

  -- May
  ('Murray Johnson Cup',
   '2026-05-04 12:00:00+01',
   'Winner of 2025 Cup vs Winner of 2025 Shield',
   'competition', false, true, 'Mon', 'members'),

  ('Draw for The Shield, The Cup & The Pairs Competitions',
   '2026-05-13 19:00:00+01',
   'Evening',
   'admin', false, false, 'Wed', 'members'),

  ('Away Match vs Masonian Club',
   '2026-05-23 14:00:00+01',
   'Afternoon',
   'match', false, false, 'Sat', 'members'),

  ('Ladies Day',
   '2026-05-25 12:00:00+01',
   NULL,
   'social', false, true, 'Mon', 'members'),

  ('FISH Open Gardens',
   '2026-05-31 13:00:00+01',
   '1–6 pm',
   'external', false, false, 'Sun', 'members'),

  -- June
  ('Home Match vs Masonian Club',
   '2026-06-11 18:00:00+01',
   '6 pm',
   'match', false, false, 'Thu', 'members'),

  ('Summer Solstice Social',
   '2026-06-20 12:00:00+01',
   NULL,
   'social', true, false, 'Sat', 'members'),

  ('Challenge Plus Cup',
   '2026-06-27 13:00:00+01',
   '1–5 pm · Open to probationary members and all members with a plus handicap',
   'competition', false, false, 'Sat', 'members'),

  ('First Round Matches — Cup deadline',
   '2026-06-28 23:59:00+01',
   'Deadline for The Cup first round matches',
   'deadline', false, false, 'Sun', 'members'),

  -- July
  ('First Round Matches — Shield deadline',
   '2026-07-05 23:59:00+01',
   'Deadline for The Shield first round matches',
   'deadline', false, false, 'Sun', 'members'),

  ('Barnes Fair Open Day',
   '2026-07-11 12:00:00+01',
   NULL,
   'external', false, false, 'Sat', 'members'),

  ('International Day',
   '2026-07-18 12:00:00+01',
   NULL,
   'social', true, false, 'Sat', 'members'),

  ('Corporate Hire — Hansard',
   '2026-07-28 14:00:00+01',
   'Afternoon',
   'admin', false, false, 'Tue', 'members'),

  -- August
  ('Silver Fox Trophy',
   '2026-08-15 12:00:00+01',
   '15th or 22nd August (date TBC) · Open to all members who have previously won the Cup or Shield',
   'competition', true, false, 'Sat', 'members'),

  ('Summer Bank Holiday',
   '2026-08-31 00:00:00+01',
   NULL,
   'social', false, true, 'Mon', 'members'),

  -- September
  ('Finals of The Competitions',
   '2026-09-05 12:00:00+01',
   'Saturday 5th and Sunday 6th September',
   'competition', false, false, 'Sat–Sun', 'members'),

  -- October
  ('Closing Day',
   '2026-10-04 12:00:00+01',
   NULL,
   'social', true, false, 'Sun', 'members'),

  -- November
  ('Closing Dinner',
   '2026-11-13 19:00:00+00',
   NULL,
   'social', false, false, 'Fri', 'members'),

  ('AGM',
   '2026-11-26 19:00:00+00',
   NULL,
   'admin', false, false, 'Thu', 'members'),

  -- TBC — date unconfirmed
  ('Wrong Bias Fixed Jack Competition',
   NULL,
   NULL,
   'competition', true, false, 'TBC', 'members');
