-- Add scoring format columns to competitions table

alter table public.competitions
  add column if not exists target_score_early int,
  add column if not exists target_score_late  int,
  add column if not exists scoring_unit       text not null default 'points';

-- Manser: first to 11 points
update public.competitions set target_score_early = 11,  scoring_unit = 'points' where slug = 'manser';

-- Cup: first to 21 points, no handicap
update public.competitions set target_score_early = 21,  scoring_unit = 'points' where slug = 'cup';

-- Shield: first to 21 points, full handicap
update public.competitions set target_score_early = 21,  scoring_unit = 'points' where slug = 'shield';

-- Pairs: early rounds to 15, semi-final & final to 21
update public.competitions set target_score_early = 15, target_score_late = 21, scoring_unit = 'points' where slug = 'pairs';

-- Silver Fox: 6 ends (not points)
update public.competitions set target_score_early = 6,   scoring_unit = 'ends'   where slug = 'silver-fox';

-- Murray Johnson: finals match, 21 points
update public.competitions set target_score_early = 21,  scoring_unit = 'points' where slug = 'murray-johnson';
