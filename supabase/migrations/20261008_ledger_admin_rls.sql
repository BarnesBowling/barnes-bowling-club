-- ── 1. Admin RLS policies on member_ledger ──────────────────────────────────
-- Lets authenticated admins (profiles.role = 'admin') read/write all rows.
-- The app uses service_role for all mutations; these policies are for direct
-- DB access and defence in depth.

CREATE POLICY "Admins can select all ledger"
  ON public.member_ledger
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert ledger"
  ON public.member_ledger
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update ledger"
  ON public.member_ledger
  FOR UPDATE TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete ledger"
  ON public.member_ledger
  FOR DELETE TO authenticated
  USING (public.is_admin());


-- ── 2. member_balances view ──────────────────────────────────────────────────
-- Single source of truth: balance = sum(debits) − sum(credits).
-- security_invoker means the view runs with the caller's permissions,
-- so members only see their own row and admins see all rows.

CREATE OR REPLACE VIEW public.member_balances
  WITH (security_invoker = true)
AS
SELECT
  member_id,
  COALESCE(SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END), 0)::numeric(12,2) AS total_charges,
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)::numeric(12,2) AS total_paid,
  COALESCE(
    SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END) -
    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END),
    0
  )::numeric(12,2) AS balance
FROM public.member_ledger
GROUP BY member_id;

GRANT SELECT ON public.member_balances TO authenticated;


-- ── 3. Audit table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.member_ledger_audit (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id   uuid        NOT NULL,
  member_id   uuid        NOT NULL,
  action      text        NOT NULL CHECK (action IN ('edit', 'delete')),
  old_values  jsonb       NOT NULL,
  new_values  jsonb,
  changed_by  text,
  changed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_audit_ledger_id  ON public.member_ledger_audit(ledger_id);
CREATE INDEX IF NOT EXISTS idx_ledger_audit_member_id  ON public.member_ledger_audit(member_id);
CREATE INDEX IF NOT EXISTS idx_ledger_audit_changed_at ON public.member_ledger_audit(changed_at DESC);

ALTER TABLE public.member_ledger_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access audit"
  ON public.member_ledger_audit FOR ALL TO service_role USING (true);

CREATE POLICY "Admins can read audit"
  ON public.member_ledger_audit
  FOR SELECT TO authenticated
  USING (public.is_admin());


-- ── 4. Audit trigger ─────────────────────────────────────────────────────────
-- Fires AFTER UPDATE or DELETE on member_ledger.
-- changed_by: reads the JWT email claim when available (authenticated users),
-- falls back to current_user (service_role operations).

CREATE OR REPLACE FUNCTION public.member_ledger_audit_fn()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_changed_by text;
BEGIN
  BEGIN
    v_changed_by := nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'email';
  EXCEPTION WHEN OTHERS THEN
    v_changed_by := current_user;
  END;

  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.member_ledger_audit(ledger_id, member_id, action, old_values, new_values, changed_by)
    VALUES (OLD.id, OLD.member_id, 'edit', to_jsonb(OLD), to_jsonb(NEW), v_changed_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.member_ledger_audit(ledger_id, member_id, action, old_values, new_values, changed_by)
    VALUES (OLD.id, OLD.member_id, 'delete', to_jsonb(OLD), NULL, v_changed_by);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS member_ledger_audit_trigger ON public.member_ledger;
CREATE TRIGGER member_ledger_audit_trigger
  AFTER UPDATE OR DELETE ON public.member_ledger
  FOR EACH ROW EXECUTE FUNCTION public.member_ledger_audit_fn();
