ALTER TABLE public.member_ledger
  ADD COLUMN IF NOT EXISTS guest_names text;
