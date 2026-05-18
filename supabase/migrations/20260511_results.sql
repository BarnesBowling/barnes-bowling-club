-- Barnes Bowling Club — Results & Leaderboard schema

create type competition_format as enum ('knockout', 'one_day', 'round_robin', 'final');
create type winner_side_type as enum ('a', 'b', 'draw');

create table public.competitions (
  id            uuid               primary key default gen_random_uuid(),
  slug          text               unique not null,
  name          text               not null,
  format        competition_format not null,
  handicap_rule text,
  eligibility   text,
  active        boolean            default true
);

insert into public.competitions (slug, name, format, handicap_rule, eligibility) values
  ('shield',         'Shield',   
      'knockout',    'Full handicap',             'Full members'),
  ('cup',            'Cup',            'knockout',    'No handicap',               'Full members'),
  ('pairs',          'Pairs',          'knockout',    'Half combined handicap',    'Full members'),
  ('plus-cup',       'Plus Cup',       'one_day',     null,                        'Plus-handicap players (+1 to +6)'),
  ('ladies-day',     'Ladies Day',     'one_day',     null,                        'All members'),
  ('wrong-bias',     'Wrong Bias',     'one_day',     null,                        'All members'),
  ('silver-fox',     'Silver Fox',     'one_day',     null,                        'Handicap -6 only'),
  ('murray-johnson', 'Murray Johnson', 'final',       null,                        'Shield winner vs Cup winner'),
  ('manser',         'Manser',         'round_robin', 'Special (see Manser rules)','All members');

create table public.pairs_teams (
  id                uuid        primary key default gen_random_uuid(),
  season            int         not null default 2026,
  player_a          text        not null,
  player_b          text        not null,
  team_name         text        not null,
  combined_handicap numeric     not null,
  team_handicap     numeric     not null,
  created_at        timestamptz default now()
);

create table public.matches (
  id                uuid             primary key default gen_random_uuid(),
  competition_slug  text             not null references public.competitions(slug),
  round             text,
  match_date        date             not null,
  side_a            text             not null,
  side_b            text             not null,
  side_a_pair_id    uuid             references public.pairs_teams(id),
  side_b_pair_id    uuid             references public.pairs_teams(id),
  side_a_score      int              not null,
  side_b_score      int              not null,
  winner_side       winner_side_type not null,
  manser_adjusted_a int,
  manser_adjusted_b int,
  notes             text,
  created_at        timestamptz      default now(),
  created_by        text             not null
);

alter table public.competitions enable row level security;
alter table public.pairs_teams   enable row level security;
alter table public.matches       enable row level security;

create policy "competitions public read"  on public.competitions for select using (true);
create policy "competitions admin write"  on public.competitions for all    using (public.is_admin()) with check (public.is_admin());

create policy "pairs_teams public read"   on public.pairs_teams  for select using (true);
create policy "pairs_teams admin write"   on public.pairs_teams  for all    using (public.is_admin()) with check (public.is_admin());

create policy "matches public read"       on public.matches       for select using (true);
create policy "matches admin write"       on public.matches       for all    using (public.is_admin()) with check (public.is_admin());
