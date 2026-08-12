-- Scrolling banner / ticker messages table
CREATE TABLE IF NOT EXISTS public.ticker_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message    text        NOT NULL,
  sort_order integer     DEFAULT 0,
  active     boolean     DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticker_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ticker"
  ON public.ticker_messages FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Service role full access"
  ON public.ticker_messages FOR ALL
  TO service_role
  USING (true);

-- Seed with messages from the original hardcoded ticker
INSERT INTO public.ticker_messages (message, sort_order, active) VALUES
  ('Season 2026 ·  25th April to early October', 1, true),
  ('Playing Membership £215 · Joining Fee £100',  2, true),
  ('Wednesday nights 6–8pm open to all',          3, true),
  ('International Day 28 June · Guests Welcome',  4, true);
