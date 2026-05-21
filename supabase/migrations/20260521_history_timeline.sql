-- History Timeline milestones table
-- Run this in the Supabase dashboard SQL editor, then seed data appears automatically.

CREATE TABLE IF NOT EXISTS public.history_timeline (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  year        integer     UNIQUE NOT NULL,
  title       text        NOT NULL,
  description text        NOT NULL,
  sort_order  integer,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.history_timeline ENABLE ROW LEVEL SECURITY;

-- Public visitors can read milestones
CREATE POLICY "Public read history_timeline"
  ON public.history_timeline FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed from data/history-timeline.ts (24 entries)
INSERT INTO public.history_timeline (year, title, description, sort_order) VALUES
  (1693, 'First Known Record',         'First known reference to a Bowling Green in Barnes appears in the manorial court records, referring to ''one cottage and 10 perches of land called the Bowling Green.'' Suggests bowling activity in Barnes predates this date.', 1),
  (1725, 'Established 1725',           'The date displayed on the club door. The exact origin of this date remains unknown — possible theories include a misreading of another date or confusion with earlier bowling green history.', 2),
  (1746, 'John Rocque''s Map',         'John Rocque''s map of Barnes is created, showing the Green, the Sun Inn, and nearby land associated with the historical bowling area — demonstrating bowling greens were recognised cartographic features.', 3),
  (1775, 'The Green Moves',            'The original ''Bowling Green House'' reportedly became the village schoolhouse. Bowling activity may have moved from the Green itself to land behind the Sun Inn — a date central to later historical interpretations.', 4),
  (1783, 'Evidence of the Present Green', 'A copyhold land map shows an area behind the Sun Inn with a shape closely matching the current bowling green — strong evidence the present green already existed by this date.', 5),
  (1837, 'Tithe Map Confirmation',     'The tithe map explicitly labels the area behind the Sun Inn as a Bowling Green, owned by Miss Mary Waring and occupied by someone named Mayfield.', 6),
  (1850, 'TBD',                        'Placeholder milestone description for 1850 — to be filled in later.', 7),
  (1889, 'Barnes Bowling Club Founded','Barnes Bowling Club officially founded. The first annual dinner was held in October 1889 at the Sun Inn. Joseph Seal served as founding president.', 8),
  (1900, 'TBD',                        'Placeholder milestone description for 1900 — to be filled in later.', 9),
  (1913, 'Early Records Survive',      'Records survive from this year showing members, games played, and averages and scores.', 10),
  (1915, 'Standardisation of Woods',   'The club debated standardisation of bowls (''woods''). New members were prohibited from using woods under size 7. References to ''private woods'' and ''club woods'' appear in records.', 11),
  (1920, 'A Lord Chancellor Member',   'Former club president George Cave became Lord Chancellor during the 1920s.', 12),
  (1936, 'Ladies Day',                 'A photograph survives of ''Ladies Day'' at the Sun Inn.', 13),
  (1937, 'Pavilion Rebuilt',           'The club pavilion was newly refurbished and rebuilt. The annual dinner was held there.', 14),
  (1940, 'TBD',                        'Placeholder milestone description for 1940 — to be filled in later.', 15),
  (1960, 'TBD',                        'Placeholder milestone description for 1960 — to be filled in later.', 16),
  (1969, 'End of Vine Road Bowls',     'The last known reference to bowls being played at Vine Road recreation ground.', 17),
  (1976, '200 Years of Bowling',       'A newspaper article stated the club ''goes back at least 200 years.'' The club played matches against the Chelsea Pensioners and later the Beefeaters at the Tower of London.', 18),
  (1980, 'TBD',                        'Placeholder milestone description for 1980 — to be filled in later.', 19),
  (1992, 'History Revisited',          'The Mortlake History Society publication repeated the claim that the original bowling green became the school site in 1775 and that bowling moved behind the Sun Inn.', 20),
  (2000, 'TBD',                        'Placeholder milestone description for 2000 — to be filled in later.', 21),
  (2015, 'TBD',                        'Placeholder milestone description for 2015 — to be filled in later.', 22),
  (2020, 'TBD',                        'Placeholder milestone description for 2020 — to be filled in later.', 23),
  (2025, 'TBD',                        'Placeholder milestone description for 2025 — to be filled in later.', 24)
ON CONFLICT (year) DO NOTHING;
