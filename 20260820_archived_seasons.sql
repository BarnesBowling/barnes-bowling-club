CREATE TABLE IF NOT EXISTS public.archived_seasons (
  year                integer       PRIMARY KEY,
  cup                 jsonb,          -- { winner, runnerUp, semifinalists }
  shield              jsonb,          -- { winner, runnerUp, semifinalists }
  pairs               jsonb,          -- { winner, runnerUp, semifinalists }
  silver_fox          jsonb,          -- { winner, runnerUp, semifinalists }
  manser              jsonb,          -- { winner, leaderboard: [{player,handicap,games,totalPoints,avgPoints}] }
  plus_cup            jsonb,          -- { winner, leaderboard: [{player,games,totalPoints}] }
  ladies_day          jsonb,          -- { winner, leaderboard: [{player,games,totalPoints,avgPoints}] }
  overall_leaderboard jsonb,          -- [{player,played,wins,losses,draws,winPct}]
  matches_backup      jsonb,          -- full matches array snapshot
  pairs_backup        jsonb,          -- pairs_teams snapshot
  archived_at         timestamptz     NOT NULL DEFAULT now(),
  archived_by         text
);

ALTER TABLE public.archived_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access archived_seasons"
  ON public.archived_seasons FOR ALL TO service_role USING (true);

CREATE POLICY "Members can read archived_seasons"
  ON public.archived_seasons FOR SELECT TO authenticated USING (true);
