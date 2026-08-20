CREATE TABLE IF NOT EXISTS public.photo_books (
  id text PRIMARY KEY,
  title text NOT NULL,
  spine_colour text NOT NULL DEFAULT '#2D5A3D',
  single_page boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL REFERENCES public.photo_books(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  layout text NOT NULL DEFAULT 'single',
  page_title text,
  page_subtitle text,
  shared_caption text,
  photos jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pbp_book_id ON public.photo_book_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pbp_sort ON public.photo_book_pages(book_id, sort_order);

ALTER TABLE public.photo_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_book_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'photo_books' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all" ON public.photo_books FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'photo_books' AND policyname = 'authenticated_select'
  ) THEN
    CREATE POLICY "authenticated_select" ON public.photo_books FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'photo_book_pages' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all" ON public.photo_book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'photo_book_pages' AND policyname = 'authenticated_select'
  ) THEN
    CREATE POLICY "authenticated_select" ON public.photo_book_pages FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ── Seed books ────────────────────────────────────────────────────────────────

INSERT INTO public.photo_books (id, title, spine_colour, single_page, sort_order) VALUES
  ('book-2026',    '2026 Season',           '#2D5A3D', false, 0),
  ('book-2025',    '2025 Season',           '#C9A84C', false, 1),
  ('book-2024',    '2024 Season',           '#6B2737', false, 2),
  ('book-2023',    '2023 Season',           '#1B3A5C', false, 3),
  ('book-2020-22', '2020–22 Season',        '#2D5A3D', false, 4),
  ('book-2019',    '2019 Season',           '#7B4F2E', false, 5),
  ('book-2017-19', '2017–19 Season',        '#C9A84C', false, 6),
  ('book-2014-16', '2014–16 Season',        '#1B3A5C', false, 7),
  ('book-2011-13', '2011–13 Season',        '#6B2737', false, 8),
  ('book-2008-10', '2008–10 Season',        '#2D5A3D', false, 9),
  ('book-2003-07', '2003–07 Season',        '#7B4F2E', false, 10),
  ('book-intl',    'Past International Days','#6B2737', true,  11)
ON CONFLICT (id) DO NOTHING;

-- ── Seed 2025 pages (50 simple pages) ────────────────────────────────────────

DO $$
DECLARE
  i integer;
  src text;
BEGIN
  FOR i IN 1..50 LOOP
    src := '/archive/years-photos/page-' || lpad(i::text, 2, '0') || '.jpg';
    INSERT INTO public.photo_book_pages (book_id, sort_order, layout, photos)
    VALUES ('book-2025', i - 1, 'single', jsonb_build_array(jsonb_build_object('src', src)))
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ── Seed intl pages (21 pages, singlePage mode) ───────────────────────────────

DO $$
DECLARE
  i integer;
  src text;
BEGIN
  FOR i IN 1..21 LOOP
    src := '/archive/intl-days/International_Day' || lpad(i::text, 2, '0') || '.jpg';
    INSERT INTO public.photo_book_pages (book_id, sort_order, layout, photos)
    VALUES ('book-intl', i - 1, 'single', jsonb_build_array(jsonb_build_object('src', src)))
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ── Seed 2026 pages (26 Silver Fox rich pages + 18 general pages) ─────────────

INSERT INTO public.photo_book_pages (book_id, sort_order, layout, page_title, page_subtitle, photos) VALUES
  ('book-2026', 0, 'sf-pair', 'Silver Fox', '15 August 2026',
    '[{"src":"/archive/years-photos/2026/silver-fox-01.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-02.jpg","caption":""}]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO public.photo_book_pages (book_id, sort_order, layout, photos) VALUES
  ('book-2026', 1,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-03.jpg","caption":""}]'::jsonb),
  ('book-2026', 2,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-04.jpg","caption":""}]'::jsonb),
  ('book-2026', 3,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-05.jpg","caption":""}]'::jsonb),
  ('book-2026', 4,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-06.jpg","caption":""}]'::jsonb),
  ('book-2026', 5,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-07.jpg","caption":""}]'::jsonb),
  ('book-2026', 6,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-08.jpg","caption":""}]'::jsonb),
  ('book-2026', 7,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-09.jpg","caption":""}]'::jsonb),
  ('book-2026', 8,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-10.jpg","caption":""}]'::jsonb),
  ('book-2026', 9,  'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-11.jpg","caption":""}]'::jsonb),
  ('book-2026', 10, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-12.jpg","caption":""}]'::jsonb),
  ('book-2026', 11, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-13.jpg","caption":""}]'::jsonb),
  ('book-2026', 12, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-14.jpg","caption":""}]'::jsonb),
  ('book-2026', 13, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-15.jpg","caption":""}]'::jsonb),
  ('book-2026', 14, 'sf-pair',   '[{"src":"/archive/years-photos/2026/silver-fox-16.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-17.jpg","caption":""}]'::jsonb),
  ('book-2026', 15, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-18.jpg","caption":""}]'::jsonb),
  ('book-2026', 16, 'sf-pair',   '[{"src":"/archive/years-photos/2026/silver-fox-19.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-20.jpg","caption":""}]'::jsonb),
  ('book-2026', 17, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-21.jpg","caption":""}]'::jsonb),
  ('book-2026', 18, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-22.jpg","caption":""}]'::jsonb),
  ('book-2026', 19, 'sf-pair',   '[{"src":"/archive/years-photos/2026/silver-fox-23.jpg","caption":""},{"src":"/archive/years-photos/2026/silver-fox-24.jpg","caption":""}]'::jsonb),
  ('book-2026', 20, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-25.jpg","caption":""}]'::jsonb),
  ('book-2026', 21, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-26.jpg","caption":""}]'::jsonb),
  ('book-2026', 22, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-27.jpg","caption":""}]'::jsonb),
  ('book-2026', 23, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-28.jpg","caption":""}]'::jsonb),
  ('book-2026', 24, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-29.jpg","caption":""}]'::jsonb),
  ('book-2026', 25, 'sf-single', '[{"src":"/archive/years-photos/2026/silver-fox-30.jpg","caption":""}]'::jsonb),
  ('book-2026', 26, 'single',    '[{"src":"/archive/years-photos/2026/page-01.jpg"}]'::jsonb),
  ('book-2026', 27, 'single',    '[{"src":"/archive/years-photos/2026/page-02.jpg"}]'::jsonb),
  ('book-2026', 28, 'single',    '[{"src":"/archive/years-photos/2026/page-03.jpg"}]'::jsonb),
  ('book-2026', 29, 'single',    '[{"src":"/archive/years-photos/2026/page-04.jpg"}]'::jsonb),
  ('book-2026', 30, 'single',    '[{"src":"/archive/years-photos/2026/page-05.jpg"}]'::jsonb),
  ('book-2026', 31, 'single',    '[{"src":"/archive/years-photos/2026/page-06.jpg"}]'::jsonb),
  ('book-2026', 32, 'single',    '[{"src":"/archive/years-photos/2026/page-07.jpg"}]'::jsonb),
  ('book-2026', 33, 'single',    '[{"src":"/archive/years-photos/2026/page-08.jpg"}]'::jsonb),
  ('book-2026', 34, 'single',    '[{"src":"/archive/years-photos/2026/page-09.jpg"}]'::jsonb),
  ('book-2026', 35, 'single',    '[{"src":"/archive/years-photos/2026/page-10.jpg"}]'::jsonb),
  ('book-2026', 36, 'single',    '[{"src":"/archive/years-photos/2026/page-11.jpg"}]'::jsonb),
  ('book-2026', 37, 'single',    '[{"src":"/archive/years-photos/2026/page-12.jpg"}]'::jsonb),
  ('book-2026', 38, 'single',    '[{"src":"/archive/years-photos/2026/page-13.jpg"}]'::jsonb),
  ('book-2026', 39, 'single',    '[{"src":"/archive/years-photos/2026/page-14.jpg"}]'::jsonb),
  ('book-2026', 40, 'single',    '[{"src":"/archive/years-photos/2026/page-15.jpg"}]'::jsonb),
  ('book-2026', 41, 'single',    '[{"src":"/archive/years-photos/2026/page-16.jpg"}]'::jsonb),
  ('book-2026', 42, 'single',    '[{"src":"/archive/years-photos/2026/page-17.jpg"}]'::jsonb),
  ('book-2026', 43, 'single',    '[{"src":"/archive/years-photos/2026/page-18.jpg"}]'::jsonb)
ON CONFLICT DO NOTHING;
