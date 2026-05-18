-- Add JSON metadata column to member_transactions (stores guest fee details etc.)
ALTER TABLE public.member_transactions
  ADD COLUMN IF NOT EXISTS metadata jsonb;
