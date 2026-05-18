-- Barnes Bowling Club — Member account transactions

CREATE TABLE IF NOT EXISTS public.member_transactions (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email text         NOT NULL,
  date         date         NOT NULL DEFAULT CURRENT_DATE,
  description  text         NOT NULL,
  category     text         NOT NULL CHECK (category IN (
                               'membership_fee', 'guest_fee', 'event_fee',
                               'manser_fee', 'wrong_bias_fee', 'miscellaneous', 'payment'
                             )),
  amount       numeric(10,2) NOT NULL, -- positive = charge (debit), negative = payment (credit)
  created_at   timestamptz  NOT NULL DEFAULT now(),
  created_by   text
);

CREATE INDEX IF NOT EXISTS idx_member_transactions_email ON public.member_transactions(member_email);
CREATE INDEX IF NOT EXISTS idx_member_transactions_date  ON public.member_transactions(date DESC);
