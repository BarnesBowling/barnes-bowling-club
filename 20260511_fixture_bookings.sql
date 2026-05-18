-- Fixture bookings table (replaces localStorage storage)
CREATE TABLE IF NOT EXISTS public.fixture_bookings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email text NOT NULL,
  competition  text NOT NULL CHECK (competition IN ('shield','cup','pairs','manser')),
  player1      text NOT NULL,
  player2      text NOT NULL,
  player3      text,
  player4      text,
  date         date NOT NULL,
  time_slot    text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_fixture_bookings_email ON public.fixture_bookings(member_email);
CREATE INDEX IF NOT EXISTS idx_fixture_bookings_date  ON public.fixture_bookings(date DESC);
