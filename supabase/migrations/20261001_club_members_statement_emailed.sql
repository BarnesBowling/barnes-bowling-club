alter table club_members
  add column if not exists statement_last_emailed_at timestamptz;
