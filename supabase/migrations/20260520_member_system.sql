-- Step 1: Add auth_user_id to club_members if not already there
ALTER TABLE public.club_members
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_club_members_auth_user_id ON public.club_members(auth_user_id);

-- Step 2: Drop the old name-based member_ledger (created earlier this session)
DROP TABLE IF EXISTS public.member_ledger;

-- Step 3: Create the UUID-referenced member_ledger
CREATE TABLE IF NOT EXISTS public.member_ledger (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid          NOT NULL REFERENCES public.club_members(id) ON DELETE CASCADE,
  description    text          NOT NULL,
  category       text          NOT NULL CHECK (category IN (
                                  'membership_fee','guest_fee','event_fee',
                                  'manser_fee','wrong_bias_fee','miscellaneous','payment'
                                )),
  amount         numeric(10,2) NOT NULL CHECK (amount > 0),
  type           text          NOT NULL CHECK (type IN ('debit','credit')),
  date           date          NOT NULL DEFAULT CURRENT_DATE,
  num_guests     integer,
  cost_per_guest numeric(10,2),
  notes          text,
  metadata       jsonb,
  created_at     timestamptz   NOT NULL DEFAULT now(),
  created_by     text
);

CREATE INDEX IF NOT EXISTS idx_member_ledger_member_id ON public.member_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_member_ledger_date ON public.member_ledger(date DESC);

ALTER TABLE public.member_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access ledger" ON public.member_ledger FOR ALL TO service_role USING (true);
CREATE POLICY "Members can read own ledger" ON public.member_ledger FOR SELECT TO authenticated
  USING (member_id IN (SELECT id FROM public.club_members WHERE auth_user_id = auth.uid()));

-- Step 4: Populate club_members from handicapData.ts
-- Membership number format: BBC + initials(firstname[0]+surname[0]) + 3-digit counter within that pair
-- Sorted alphabetically by surname then firstname.
-- ON CONFLICT DO NOTHING to be safe if some already exist.

INSERT INTO public.club_members (full_name, membership_number, handicap, status) VALUES
  ('Ahmad Al-Hamad',    'BBCAA001',  2, 'active'),
  ('Jan Allcorn',       'BBCJA001',  4, 'active'),
  ('Gareth Ballance',   'BBCGB001', -6, 'active'),
  ('Maggie Bell',       'BBCMB001',  2, 'active'),
  ('Stephanie Bell',    'BBCSB001',  4, 'active'),
  ('Jeff Black',        'BBCJB001',  2, 'active'),
  ('Andrew Bown',       'BBCAB001', -6, 'active'),
  ('Julia Bradley',     'BBCJB002',  6, 'active'),
  ('Anita Brown',       'BBCAB002',  2, 'active'),
  ('Scott Brown',       'BBCSB002',  6, 'active'),
  ('Ed Butt',           'BBCEB001', -2, 'active'),
  ('Roger Chapman',     'BBCRC001',  0, 'active'),
  ('Andrew Clapham',    'BBCAC001',  6, 'active'),
  ('Karen Clapham',     'BBCKC001',  6, 'active'),
  ('Jane Clargo',       'BBCJC001',  2, 'active'),
  ('Colin Clarke',      'BBCCC001', -2, 'active'),
  ('Andrew Cleven',     'BBCAC002', -4, 'active'),
  ('Simon Clough',      'BBCSC001', -6, 'active'),
  ('Brian Coles',       'BBCBC001', -6, 'active'),
  ('Lynne Cox',         'BBCLC001',  4, 'active'),
  ('Sarah Crosbie-Smith','BBCSC002', 2, 'active'),
  ('Huw Crwys-Williams','BBCHC001',  6, 'active'),
  ('Michael Daly',      'BBCMD001',  6, 'active'),
  ('Simon Danciger',    'BBCSD001', -6, 'active'),
  ('Mark Derry',        'BBCMD002',  6, 'active'),
  ('Alaric Evans',      'BBCAE001', -6, 'active'),
  ('Alison Evans',      'BBCAE002',  6, 'active'),
  ('Brian Evans',       'BBCBE001', -2, 'active'),
  ('Peter Evans',       'BBCPE001',  6, 'active'),
  ('Sue Evans',         'BBCSE001',  6, 'active'),
  ('Jennifer Farrimond','BBCJF001',  4, 'active'),
  ('Ed Fenn-Smith',     'BBCEF001',  6, 'active'),
  ('Bob Finch',         'BBCBF001',  6, 'active'),
  ('Roger Ford',        'BBCRF001', -6, 'active'),
  ('Andrew Fox',        'BBCAF001',  2, 'active'),
  ('Jeremy Frearson',   'BBCJF002', -2, 'active'),
  ('Ulrik Fugman',      'BBCUF001',  6, 'active'),
  ('Stephen Gaskell',   'BBCSG001', -2, 'active'),
  ('Tracy Greasley',    'BBCTG001',  2, 'active'),
  ('Ginnette Grimes',   'BBCGG001', -2, 'active'),
  ('Torquil Gyngell',   'BBCTG002',  0, 'active'),
  ('Philippa Haworth',  'BBCPH001',  6, 'active'),
  ('Judith Heaton',     'BBCJH001', -4, 'active'),
  ('Kevin Hill',        'BBCKH001',  0, 'active'),
  ('Natacha Hill',      'BBCNH001', -2, 'active'),
  ('Colleen Hillman',   'BBCCH001',  6, 'active'),
  ('Alistair Hogarth',  'BBCAH001',  4, 'active'),
  ('Richard Hogg',      'BBCRH001',  6, 'active'),
  ('Mark Hunter',       'BBCMH001', -6, 'active'),
  ('Mirren Jackson',    'BBCMJ001',  6, 'active'),
  ('Gill Jay',          'BBCGJ001',  6, 'active'),
  ('Margaret Kaye',     'BBCMK001',  4, 'active'),
  ('Adrian Kent',       'BBCAK001',  6, 'active'),
  ('Jane Kinnear',      'BBCJK001',  6, 'active'),
  ('Geoff Knowles',     'BBCGK001', -4, 'active'),
  ('Andrea Lane',       'BBCAL001',  6, 'active'),
  ('Ian Livingstone',   'BBCIL001',  6, 'active'),
  ('Fran Mauri',        'BBCFM001',  4, 'active'),
  ('Michael McDermott', 'BBCMM001',  6, 'active'),
  ('Roger McGough',     'BBCRM001',  0, 'active'),
  ('Catherine Mitrenas','BBCCM001', -2, 'active'),
  ('Fausto More',       'BBCFM002',  2, 'active'),
  ('Terry O''Hanlon',   'BBCTO001',  4, 'active'),
  ('Noel O''Hara',      'BBCNO001',  4, 'active'),
  ('Bernard O''Keeffe', 'BBCBO001', -6, 'active'),
  ('Jocelyn O''Keeffe', 'BBCJO001',  4, 'active'),
  ('Jim O''Neill',      'BBCJO002',  0, 'active'),
  ('Luke Papanicola',   'BBCLP001', -4, 'active'),
  ('Danny Peel',        'BBCDP001',  0, 'active'),
  ('Michael Perkins',   'BBCMP001',  4, 'active'),
  ('Liz Pinfold',       'BBCLP002',  6, 'active'),
  ('Fee Power',         'BBCFP001', -2, 'active'),
  ('David Priestley',   'BBCDP002',  4, 'active'),
  ('Stephane Redon',    'BBCSR001',  6, 'active'),
  ('Venina Rees',       'BBCVR001', -4, 'active'),
  ('Giselle Rettie',    'BBCGR001',  0, 'active'),
  ('Andrew Rigg',       'BBCAR001',  6, 'active'),
  ('Jules Robinson',    'BBCJR001',  2, 'active'),
  ('Jon Sadlier',       'BBCJS001',  0, 'active'),
  ('Julian Schiller',   'BBCJS002',  2, 'active'),
  ('Wolfgang Schiller', 'BBCWS001',  6, 'active'),
  ('Mark Silverwood',   'BBCMS001', -4, 'active'),
  ('Richard Skinner',   'BBCRS001',  0, 'active'),
  ('Peter Smith',       'BBCPS001',  6, 'active'),
  ('Simon Smith',       'BBCSS001',  6, 'active'),
  ('Peter Spearing',    'BBCPS002', -4, 'active'),
  ('Hayley Steedman',   'BBCHS001',  4, 'active'),
  ('Toby Steedman',     'BBCTS001', -2, 'active'),
  ('Simon Stewart',     'BBCSS002',  2, 'active'),
  ('Gerry Summers',     'BBCGS001', -6, 'active'),
  ('Gordon Swire',      'BBCGS002', -6, 'active'),
  ('Geraldine Talbot',  'BBCGT001',  6, 'active'),
  ('Marisa Talbot',     'BBCMT001',  4, 'active'),
  ('Phil Thompson',     'BBCPT001', -4, 'active'),
  ('Rhona Vose',        'BBCRV001', -2, 'active'),
  ('Brooks Wallace',    'BBCBW001',  6, 'active'),
  ('Rupert Warburton',  'BBCRW001',  2, 'active'),
  ('Annie Watts',       'BBCAW001', -4, 'active'),
  ('Paul Weinberger',   'BBCPW001',  6, 'active'),
  ('Chris Williams',    'BBCCW001',  6, 'active'),
  ('Joseph Wren',       'BBCJW001',  6, 'active'),
  ('Toby Young',        'BBCTY001',  6, 'active')
ON CONFLICT (membership_number) DO NOTHING;
