-- Barnes Bowling Club — Name-based member ledger (no Supabase auth required)

CREATE TABLE IF NOT EXISTS public.member_ledger (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text          NOT NULL,
  description text          NOT NULL,
  category    text          NOT NULL CHECK (category IN (
                               'membership_fee', 'guest_fee', 'event_fee',
                               'manser_fee', 'wrong_bias_fee', 'miscellaneous', 'payment'
                             )),
  amount      numeric(10,2) NOT NULL CHECK (amount > 0),
  type        text          NOT NULL CHECK (type IN ('debit', 'credit')),
  date        date          NOT NULL DEFAULT CURRENT_DATE,
  metadata    jsonb,
  notes       text,
  created_at  timestamptz   NOT NULL DEFAULT now(),
  created_by  text
);

CREATE INDEX IF NOT EXISTS idx_member_ledger_name ON public.member_ledger(member_name);
CREATE INDEX IF NOT EXISTS idx_member_ledger_date ON public.member_ledger(date DESC);

ALTER TABLE public.member_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.member_ledger FOR ALL TO service_role USING (true);

CREATE POLICY "Members can read own ledger"
  ON public.member_ledger FOR SELECT TO authenticated USING (true);
