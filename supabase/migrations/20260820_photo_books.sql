-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.photo_books (
  id           text        PRIMARY KEY,
  title        text        NOT NULL,
  spine_colour text        NOT NULL DEFAULT '#2D5A3D',
  single_page  boolean     NOT NULL DEFAULT false,
  sort_order   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_book_pages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id        text        NOT NULL REFERENCES public.photo_books(id) ON DELETE CASCADE,
  sort_order     integer     NOT NULL DEFAULT 0,
  layout         text        NOT NULL DEFAULT 'single',
  page_title     text,
  page_subtitle  text,
  shared_caption text,
  photos         jsonb       NOT NULL DEFAULT '[]',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_pbp_book_id ON public.photo_book_pages(book_id);

-- ── Security ─────────────────────────────────────────────────────────────────

ALTER TABLE public.photo_books      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_book_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all"     ON public.photo_books;
DROP POLICY IF EXISTS "authenticated_select" ON public.photo_books;
CREATE POLICY "service_role_all"     ON public.photo_books FOR ALL    TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select" ON public.photo_books FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "service_role_all"     ON public.photo_book_pages;
DROP POLICY IF EXISTS "authenticated_select" ON public.photo_book_pages;
CREATE POLICY "service_role_all"     ON public.photo_book_pages FOR ALL    TO service_role  USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select" ON public.photo_book_pages FOR SELECT TO authenticated USING (true);

-- ── Seed books ────────────────────────────────────────────────────────────────

INSERT INTO public.photo_books (id, title, spine_colour, single_page, sort_order) VALUES
  ('book-2026',    '2026 Season',            '#2D5A3D', false,  0),
  ('book-2025',    '2025 Season',            '#C9A84C', false,  1),
  ('book-2024',    '2024 Season',            '#6B2737', false,  2),
  ('book-2023',    '2023 Season',            '#1B3A5C', false,  3),
  ('book-2020-22', '2020–22 Season',         '#2D5A3D', false,  4),
  ('book-2019',    '2019 Season',            '#7B4F2E', false,  5),
  ('book-2017-19', '2017–19 Season',         '#C9A84C', false,  6),
  ('book-2014-16', '2014–16 Season',         '#1B3A5C', false,  7),
  ('book-2011-13', '2011–13 Season',         '#6B2737', false,  8),
  ('book-2008-10', '2008–10 Season',         '#2D5A3D', false,  9),
  ('book-2003-07', '2003–07 Season',         '#7B4F2E', false, 10),
  ('book-intl',    'Past International Days','#6B2737', true,  11);

-- ── Seed 2026 pages (44 pages) ────────────────────────────────────────────────

INSERT INTO public.photo_book_pages (book_id, sort_order, layout, page_title, page_subtitle, photos) VALUES
  ('book-2026',  0, 'sf-pair',   'Silver Fox', '15 August 2026', '[{"src":"/archive/years-photos/2026/silver-fox-01.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-02.jpg","caption":""}]'),
  ('book-2026',  1, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-03.jpg","caption":""}]'),
  ('book-2026',  2, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-04.jpg","caption":""}]'),
  ('book-2026',  3, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-05.jpg","caption":""}]'),
  ('book-2026',  4, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-06.jpg","caption":""}]'),
  ('book-2026',  5, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-07.jpg","caption":""}]'),
  ('book-2026',  6, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-08.jpg","caption":""}]'),
  ('book-2026',  7, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-09.jpg","caption":""}]'),
  ('book-2026',  8, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-10.jpg","caption":""}]'),
  ('book-2026',  9, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-11.jpg","caption":""}]'),
  ('book-2026', 10, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-12.jpg","caption":""}]'),
  ('book-2026', 11, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-13.jpg","caption":""}]'),
  ('book-2026', 12, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-14.jpg","caption":""}]'),
  ('book-2026', 13, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-15.jpg","caption":""}]'),
  ('book-2026', 14, 'sf-pair',   NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-16.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-17.jpg","caption":""}]'),
  ('book-2026', 15, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-18.jpg","caption":""}]'),
  ('book-2026', 16, 'sf-pair',   NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-19.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-20.jpg","caption":""}]'),
  ('book-2026', 17, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-21.jpg","caption":""}]'),
  ('book-2026', 18, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-22.jpg","caption":""}]'),
  ('book-2026', 19, 'sf-pair',   NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-23.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-24.jpg","caption":""}]'),
  ('book-2026', 20, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-25.jpg","caption":""}]'),
  ('book-2026', 21, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-26.jpg","caption":""}]'),
  ('book-2026', 22, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-27.jpg","caption":""}]'),
  ('book-2026', 23, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-28.jpg","caption":""}]'),
  ('book-2026', 24, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-29.jpg","caption":""}]'),
  ('book-2026', 25, 'sf-single', NULL, NULL, '[{"src":"/archive/years-photos/2026/silver-fox-30.jpg","caption":""}]'),
  ('book-2026', 26, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-01.jpg"}]'),
  ('book-2026', 27, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-02.jpg"}]'),
  ('book-2026', 28, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-03.jpg"}]'),
  ('book-2026', 29, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-04.jpg"}]'),
  ('book-2026', 30, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-05.jpg"}]'),
  ('book-2026', 31, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-06.jpg"}]'),
  ('book-2026', 32, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-07.jpg"}]'),
  ('book-2026', 33, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-08.jpg"}]'),
  ('book-2026', 34, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-09.jpg"}]'),
  ('book-2026', 35, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-10.jpg"}]'),
  ('book-2026', 36, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-11.jpg"}]'),
  ('book-2026', 37, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-12.jpg"}]'),
  ('book-2026', 38, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-13.jpg"}]'),
  ('book-2026', 39, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-14.jpg"}]'),
  ('book-2026', 40, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-15.jpg"}]'),
  ('book-2026', 41, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-16.jpg"}]'),
  ('book-2026', 42, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-17.jpg"}]'),
  ('book-2026', 43, 'single',    NULL, NULL, '[{"src":"/archive/years-photos/2026/page-18.jpg"}]');

-- ── Seed 2025 pages (50 pages) ────────────────────────────────────────────────

INSERT INTO public.photo_book_pages (book_id, sort_order, layout, photos) VALUES
  ('book-2025',  0, 'single', '[{"src":"/archive/years-photos/page-01.jpg"}]'),
  ('book-2025',  1, 'single', '[{"src":"/archive/years-photos/page-02.jpg"}]'),
  ('book-2025',  2, 'single', '[{"src":"/archive/years-photos/page-03.jpg"}]'),
  ('book-2025',  3, 'single', '[{"src":"/archive/years-photos/page-04.jpg"}]'),
  ('book-2025',  4, 'single', '[{"src":"/archive/years-photos/page-05.jpg"}]'),
  ('book-2025',  5, 'single', '[{"src":"/archive/years-photos/page-06.jpg"}]'),
  ('book-2025',  6, 'single', '[{"src":"/archive/years-photos/page-07.jpg"}]'),
  ('book-2025',  7, 'single', '[{"src":"/archive/years-photos/page-08.jpg"}]'),
  ('book-2025',  8, 'single', '[{"src":"/archive/years-photos/page-09.jpg"}]'),
  ('book-2025',  9, 'single', '[{"src":"/archive/years-photos/page-10.jpg"}]'),
  ('book-2025', 10, 'single', '[{"src":"/archive/years-photos/page-11.jpg"}]'),
  ('book-2025', 11, 'single', '[{"src":"/archive/years-photos/page-12.jpg"}]'),
  ('book-2025', 12, 'single', '[{"src":"/archive/years-photos/page-13.jpg"}]'),
  ('book-2025', 13, 'single', '[{"src":"/archive/years-photos/page-14.jpg"}]'),
  ('book-2025', 14, 'single', '[{"src":"/archive/years-photos/page-15.jpg"}]'),
  ('book-2025', 15, 'single', '[{"src":"/archive/years-photos/page-16.jpg"}]'),
  ('book-2025', 16, 'single', '[{"src":"/archive/years-photos/page-17.jpg"}]'),
  ('book-2025', 17, 'single', '[{"src":"/archive/years-photos/page-18.jpg"}]'),
  ('book-2025', 18, 'single', '[{"src":"/archive/years-photos/page-19.jpg"}]'),
  ('book-2025', 19, 'single', '[{"src":"/archive/years-photos/page-20.jpg"}]'),
  ('book-2025', 20, 'single', '[{"src":"/archive/years-photos/page-21.jpg"}]'),
  ('book-2025', 21, 'single', '[{"src":"/archive/years-photos/page-22.jpg"}]'),
  ('book-2025', 22, 'single', '[{"src":"/archive/years-photos/page-23.jpg"}]'),
  ('book-2025', 23, 'single', '[{"src":"/archive/years-photos/page-24.jpg"}]'),
  ('book-2025', 24, 'single', '[{"src":"/archive/years-photos/page-25.jpg"}]'),
  ('book-2025', 25, 'single', '[{"src":"/archive/years-photos/page-26.jpg"}]'),
  ('book-2025', 26, 'single', '[{"src":"/archive/years-photos/page-27.jpg"}]'),
  ('book-2025', 27, 'single', '[{"src":"/archive/years-photos/page-28.jpg"}]'),
  ('book-2025', 28, 'single', '[{"src":"/archive/years-photos/page-29.jpg"}]'),
  ('book-2025', 29, 'single', '[{"src":"/archive/years-photos/page-30.jpg"}]'),
  ('book-2025', 30, 'single', '[{"src":"/archive/years-photos/page-31.jpg"}]'),
  ('book-2025', 31, 'single', '[{"src":"/archive/years-photos/page-32.jpg"}]'),
  ('book-2025', 32, 'single', '[{"src":"/archive/years-photos/page-33.jpg"}]'),
  ('book-2025', 33, 'single', '[{"src":"/archive/years-photos/page-34.jpg"}]'),
  ('book-2025', 34, 'single', '[{"src":"/archive/years-photos/page-35.jpg"}]'),
  ('book-2025', 35, 'single', '[{"src":"/archive/years-photos/page-36.jpg"}]'),
  ('book-2025', 36, 'single', '[{"src":"/archive/years-photos/page-37.jpg"}]'),
  ('book-2025', 37, 'single', '[{"src":"/archive/years-photos/page-38.jpg"}]'),
  ('book-2025', 38, 'single', '[{"src":"/archive/years-photos/page-39.jpg"}]'),
  ('book-2025', 39, 'single', '[{"src":"/archive/years-photos/page-40.jpg"}]'),
  ('book-2025', 40, 'single', '[{"src":"/archive/years-photos/page-41.jpg"}]'),
  ('book-2025', 41, 'single', '[{"src":"/archive/years-photos/page-42.jpg"}]'),
  ('book-2025', 42, 'single', '[{"src":"/archive/years-photos/page-43.jpg"}]'),
  ('book-2025', 43, 'single', '[{"src":"/archive/years-photos/page-44.jpg"}]'),
  ('book-2025', 44, 'single', '[{"src":"/archive/years-photos/page-45.jpg"}]'),
  ('book-2025', 45, 'single', '[{"src":"/archive/years-photos/page-46.jpg"}]'),
  ('book-2025', 46, 'single', '[{"src":"/archive/years-photos/page-47.jpg"}]'),
  ('book-2025', 47, 'single', '[{"src":"/archive/years-photos/page-48.jpg"}]'),
  ('book-2025', 48, 'single', '[{"src":"/archive/years-photos/page-49.jpg"}]'),
  ('book-2025', 49, 'single', '[{"src":"/archive/years-photos/page-50.jpg"}]');

-- ── Seed intl pages (21 pages) ────────────────────────────────────────────────

INSERT INTO public.photo_book_pages (book_id, sort_order, layout, photos) VALUES
  ('book-intl',  0, 'single', '[{"src":"/archive/intl-days/International_Day01.jpg"}]'),
  ('book-intl',  1, 'single', '[{"src":"/archive/intl-days/International_Day02.jpg"}]'),
  ('book-intl',  2, 'single', '[{"src":"/archive/intl-days/International_Day03.jpg"}]'),
  ('book-intl',  3, 'single', '[{"src":"/archive/intl-days/International_Day04.jpg"}]'),
  ('book-intl',  4, 'single', '[{"src":"/archive/intl-days/International_Day05.jpg"}]'),
  ('book-intl',  5, 'single', '[{"src":"/archive/intl-days/International_Day06.jpg"}]'),
  ('book-intl',  6, 'single', '[{"src":"/archive/intl-days/International_Day07.jpg"}]'),
  ('book-intl',  7, 'single', '[{"src":"/archive/intl-days/International_Day08.jpg"}]'),
  ('book-intl',  8, 'single', '[{"src":"/archive/intl-days/International_Day09.jpg"}]'),
  ('book-intl',  9, 'single', '[{"src":"/archive/intl-days/International_Day10.jpg"}]'),
  ('book-intl', 10, 'single', '[{"src":"/archive/intl-days/International_Day11.jpg"}]'),
  ('book-intl', 11, 'single', '[{"src":"/archive/intl-days/International_Day12.jpg"}]'),
  ('book-intl', 12, 'single', '[{"src":"/archive/intl-days/International_Day13.jpg"}]'),
  ('book-intl', 13, 'single', '[{"src":"/archive/intl-days/International_Day14.jpg"}]'),
  ('book-intl', 14, 'single', '[{"src":"/archive/intl-days/International_Day15.jpg"}]'),
  ('book-intl', 15, 'single', '[{"src":"/archive/intl-days/International_Day16.jpg"}]'),
  ('book-intl', 16, 'single', '[{"src":"/archive/intl-days/International_Day17.jpg"}]'),
  ('book-intl', 17, 'single', '[{"src":"/archive/intl-days/International_Day18.jpg"}]'),
  ('book-intl', 18, 'single', '[{"src":"/archive/intl-days/International_Day19.jpg"}]'),
  ('book-intl', 19, 'single', '[{"src":"/archive/intl-days/International_Day20.jpg"}]'),
  ('book-intl', 20, 'single', '[{"src":"/archive/intl-days/International_Day21.jpg"}]');
