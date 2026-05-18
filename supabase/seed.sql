-- Seed data for Barnes Bowling Club
-- Run in Supabase SQL Editor after schema.sql

-- ── EVENTS ──────────────────────────────────────────────────
insert into public.events (title, event_date, location, visibility) values
  ('Season Opening Day',        '2026-04-25 14:00:00+01', 'Sun Inn, Barnes SW13',  'public'),
  ('Club Championship — Round 1','2026-06-07 14:00:00+01', 'Barnes Green',          'public'),
  ('International Day',         '2026-06-28 12:00:00+01', 'Sun Inn, Barnes SW13',  'public'),
  ('Barnes Fair Day',           '2026-07-19 12:00:00+01', 'Sun Inn, Barnes SW13',  'public'),
  ('Club Championship — Final', '2026-08-23 14:00:00+01', 'Barnes Green',          'public'),
  ('Season''s End Supper',      '2026-09-20 19:00:00+01', 'Sun Inn, Barnes SW13',  'public');

-- ── OFFICERS ────────────────────────────────────────────────
insert into public.officers (group_name, role, name, sort_order) values
  ('Officers',   'Chairman',          'Kevin Hill',  1),
  ('Officers',   'Secretary',         'T.B.C.',      2),
  ('Officers',   'Treasurer',         'Andrew Fox',  3),
  ('Playing',    'Bowls Captain',     'T.B.C.',      4),
  ('Playing',    'Vice Captain',      'T.B.C.',      5),
  ('Playing',    'Fixture Secretary', 'T.B.C.',      6),
  ('Committee',  'Committee Member',  'T.B.C.',      7),
  ('Committee',  'Committee Member',  'T.B.C.',      8),
  ('Committee',  'Committee Member',  'T.B.C.',      9),
  ('Selection',  'Selector',          'T.B.C.',     10),
  ('Selection',  'Selector',          'T.B.C.',     11);

-- ── HANDICAPS ───────────────────────────────────────────────
insert into public.handicaps (name, handicap, trend, played, season_year) values
  ('A. Pemberton',      -4,  'down', 12, 2026),
  ('G. Whitmore',       -2,  'same', 10, 2026),
  ('R. Hargreaves',      0,  'down', 11, 2026),
  ('T. Singh',           2,  'up',    9, 2026),
  ('D. Clarke',          4,  'same',  8, 2026),
  ('C. Fox',             5,  'up',    7, 2026),
  ('M. Ashworth',        6,  'down', 10, 2026),
  ('P. Leighton',        7,  'same',  6, 2026),
  ('J. Beaumont',        8,  'down',  7, 2026),
  ('H. Forsythe',        9,  'up',    5, 2026),
  ('E. Drummond',       10,  'same',  8, 2026),
  ('S. Cavendish',      11,  'up',    6, 2026),
  ('W. Hutchinson',     12,  'same',  7, 2026),
  ('N. Baines',         14,  'up',    4, 2026),
  ('L. Mortimer',       15,  'down',  6, 2026),
  ('F. Aldridge',       16,  'same',  5, 2026),
  ('O. Stafford',       17,  'up',    3, 2026),
  ('B. Weston',         18,  'up',    5, 2026),
  ('K. Mallory',        20,  'same',  4, 2026),
  ('V. Langton',        21,  'up',    3, 2026),
  ('I. Thornton',       22,  'up',    4, 2026),
  ('Q. Bradshaw',       24,  'up',    3, 2026),
  ('U. Farnsworth',     25,  'same',  2, 2026),
  ('Y. Crampton',       26,  'up',    3, 2026),
  ('Z. Hollingsworth',  28,  'up',    2, 2026),
  ('X. Pemberton',      30,  'same',  2, 2026),
  ('J. Newcombe',       35,  'up',    1, 2026);

-- ── NOTICES ─────────────────────────────────────────────────
insert into public.notices (title, body, author) values
  ('Season 2026 now open', 'The green is open for the 2026 season. First roll of the season was April 25th. Welcome back everyone!', 'Club Secretary'),
  ('International Day — 28 June', 'Our biggest event of the year. Guests very welcome. Please let the secretary know if you are bringing guests so we can plan catering.', 'Bowls Captain'),
  ('Green maintenance', 'The green will be closed Monday 2 June for routine maintenance. Normal play resumes Tuesday morning.', 'Groundsman');
