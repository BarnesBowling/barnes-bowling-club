'use client';

const G = '#2d5a3d';
const GL = '#4a7c59';
const BLUE = '#2980b9';
const RED = '#c0392b';
const GOLD = '#c9a84c';
const DITCH = '#1a3a2a';
const WHITE = '#ffffff';
const ORANGE = '#e85c2e';
const TEAL   = '#2a9d8f';

/* ── rink base ─────────────────────────────────────────────── */
function RinkSVG({ w = 190, h = 270, matCx, matCy, children }: { w?: number; h?: number; matCx?: number; matCy?: number; children: React.ReactNode }) {
  const cx = w / 2;
  const mcx = matCx ?? cx;
  const mcy = matCy ?? (h - 40);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="gt-wood" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill={DITCH} rx="3" />
      <rect x={14} y={16} width={w - 28} height={h - 32} fill={G} />
      <rect x={20} y={22} width={w - 40} height={h - 44} fill={GL} opacity="0.3" />
      <rect x={14} y={16} width={w - 28} height={h - 32} fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
      <rect x={mcx - 18} y={mcy} width={36} height={12} fill="rgba(201,168,76,0.2)" stroke={GOLD} strokeWidth="0.8" rx="1" />
      <text x={mcx} y={mcy + 9} fontSize="5.5" fill={GOLD} textAnchor="middle" fontFamily="DM Sans,sans-serif">MAT</text>
      {children}
    </svg>
  );
}

function Jack({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="6" fill={WHITE} stroke={GOLD} strokeWidth="1.2" />
      <text x={cx} y={cy + 3} fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>
    </g>
  );
}

function Bowl({ cx, cy, color = BLUE, label = '', r = 8 }: { cx: number; cy: number; color?: string; label?: string; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
      {label && (
        <text x={cx} y={cy + r * 0.45} fontSize={r * 0.85} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontFamily="DM Sans,sans-serif" fontWeight="600">
          {label}
        </text>
      )}
    </g>
  );
}

/* Wooden bowl with coloured sticker — used in Singles & Pairs */
function WoodBowl({ cx, cy, sticker, r = 8 }: { cx: number; cy: number; sticker: 'orange' | 'teal'; r?: number }) {
  const stickerFill = sticker === 'orange' ? ORANGE : TEAL;
  const stickerText = sticker === 'orange' ? WHITE : '#f5dc6e';
  const sr = r * 0.44;               // sticker radius
  const fs = Math.max(2, sr * 0.78); // font size
  return (
    <g>
      {/* Dark wood body with radial gradient */}
      <circle cx={cx} cy={cy} r={r} fill="url(#gt-wood)" />
      {/* Two subtle grain rings */}
      <circle cx={cx} cy={cy} r={r * 0.76} fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.55" />
      <circle cx={cx} cy={cy} r={r * 0.52} fill="none" stroke="#5c3820" strokeWidth="0.6" opacity="0.4"  />
      {/* Coloured sticker */}
      <circle cx={cx} cy={cy} r={sr} fill={stickerFill} />
      <text x={cx} y={cy + fs * 0.38} fontSize={fs} textAnchor="middle"
            fill={stickerText} fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </g>
  );
}

function PlayerIcon({ cx, cy, color, label, r = 9 }: { cx: number; cy: number; color: string; label: string; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      <text x={cx} y={cy + r * 0.45} fontSize={r * 0.85} textAnchor="middle" fill={WHITE} fontFamily="DM Sans,sans-serif" fontWeight="700">{label}</text>
    </g>
  );
}

function GameCard({ name, desc, children }: { name: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: 500, color: G }}>{name}</div>
      {children}
      <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '12px', lineHeight: 1.7, color: '#4a4a42', margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Singles ───────────────────────────────────────────────── */
function SinglesGame() {
  return (
    <GameCard
      name="Singles"
      desc="Singles is bowls at its purest — just two players, head to head. Each player delivers two woods, alternating with their opponent (A, B, A, B). Once all four woods are down, the player whose wood lies closest to the jack scores one point per counting wood — a maximum of two per end. In a competition, singles is played to 21 points. In a friendly, you can agree any target — 11 is the usual choice for a relaxed game."
    >
      {/* matCx=32 places the mat flush with the green's left edge (x 14–50) */}
      <RinkSVG matCx={32}>
        {/* ── Bias trajectory — drawn first so all other elements render on top ── */}
        {/* M=front of bottom-left mat (32,232), C=cubic Bezier arcs right          */}
        {/* representing the wood's bias, CP1(130,220) pulls hard right, then       */}
        {/* CP2(128,90) returns toward the jack. At t=0.5 arc is ~40px right of    */}
        {/* the direct line — clearly shows the bias sweep.                         */}
        <path d="M 32,232 C 130,220 128,90 119,72"
              fill="none" stroke={GOLD} strokeWidth="1.5"
              strokeDasharray="5 3" opacity="0.6" />

        {/* ── Second MAT — top-right corner, mirroring bottom-left ────────────── */}
        {/* Green right edge x=176; mat width=36 → rect x=140. Green top y=16;    */}
        {/* 12px gap mirrors the bottom mat's gap from the green bottom.           */}
        <rect x={140} y={28} width={36} height={12}
              fill="rgba(201,168,76,0.2)" stroke={GOLD} strokeWidth="0.8" rx="1" />
        <text x={158} y={37} fontSize="5.5" fill={GOLD} textAnchor="middle"
              fontFamily="DM Sans,sans-serif">MAT</text>

        {/* Jack — shifted 30% further right: cx 95 → 95 + (176−95)×0.3 ≈ 119 */}
        <Jack cx={119} cy={72} />
        {/* Orange A — 1 touching jack, 1 random top-right quartile */}
        <WoodBowl cx={109} cy={82}  sticker="orange" />
        <WoodBowl cx={150} cy={108} sticker="orange" />
        {/* Teal B — 1 beside orange near jack, 1 random top-right quartile */}
        <WoodBowl cx={124} cy={86}  sticker="teal" />
        <WoodBowl cx={157} cy={130} sticker="teal" />
        {/* Delivery sequence — 2 bowls each */}
        <text x={95} y={175} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.7">A · B · A · B</text>
        {/* Player icons follow mat to bottom-left */}
        <PlayerIcon cx={26} cy={252} color={ORANGE} label="A" />
        <PlayerIcon cx={46} cy={252} color={TEAL}   label="B" />
        {/* Info — moved to y=52 to clear the top-right MAT (which ends at y=40) */}
        <text x={95} y={52} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">2 woods each · first to 21 points</text>
      </RinkSVG>
    </GameCard>
  );
}

/* ── Pairs ─────────────────────────────────────────────────── */
function PairsGame() {
  return (
    <GameCard
      name="Pairs"
      desc="In Pairs, two players form a team. Each player delivers 2 woods in the sequence shown above. A pairs team can score a maximum of 4 points in a single end if all four of their woods finish closest to the jack. As in singles, the player or team winning the end throws the jack for the next, and the order of play is determined by whoever throws the jack. The number of points to win the match can be however many is agreed between players at the start, or as determined by the Captain in a competition."
    >
      {/* matCx=158 — bottom-right corner; matCy defaults to h-40=230, rect y=230–242 */}
      <RinkSVG matCx={158}>
        {/* Info text — top-centre, clear of jack cluster */}
        <text x={95} y={36} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">2 woods each · 6 ends</text>

        {/* Jack — top-left (corner-to-corner from bottom-right mat) */}
        <Jack cx={55} cy={68} />

        {/* 4 woods around jack — 2 orange (Team A), 2 teal (Team B) */}
        {/* Verified non-overlapping: wood r=7, jack r=6             */}
        <WoodBowl cx={45} cy={79}  sticker="orange" r={7} />
        <WoodBowl cx={76} cy={90}  sticker="orange" r={7} />
        <WoodBowl cx={67} cy={78}  sticker="teal"   r={7} />
        <WoodBowl cx={42} cy={58}  sticker="teal"   r={7} />

        {/* Delivery sequence */}
        <text x={95} y={145} fontSize="6.5" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.65">A · C · A · C · B · D · B · D</text>

        {/* Player icons — two columns above the bottom-right mat        */}
        {/* Col 1 (x=140): Team A (orange) — A (cy=200) and C (cy=218)  */}
        {/* Col 2 (x=166): Team B (teal)   — B (cy=200) and D (cy=218)  */}
        {/* C/D bottom edge (225) clears mat top (230) by 5px            */}
        <text x={140} y={186} fontSize="4.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team A</text>
        <text x={166} y={186} fontSize="4.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team B</text>
        <PlayerIcon cx={140} cy={200} color={ORANGE} label="A" r={7} />
        <PlayerIcon cx={166} cy={200} color={TEAL}   label="B" r={7} />
        <PlayerIcon cx={140} cy={218} color={ORANGE} label="C" r={7} />
        <PlayerIcon cx={166} cy={218} color={TEAL}   label="D" r={7} />
      </RinkSVG>
    </GameCard>
  );
}

/* ── Triples ───────────────────────────────────────────────── */
function TriplesGame() {
  return (
    <GameCard
      name="Triples"
      desc="A triples game takes place between six players — three per team: Lead, Second, and Skip. Each player delivers three woods. Leads bowl first, then Seconds, then Skips. Play continues for 18 ends; the team with the most points wins — a maximum of nine points per end."
    >
      <RinkSVG>
        <Jack cx={95} cy={70} />
        {/* Blue bowls (3×3 = 9) */}
        <Bowl cx={85} cy={85} color={BLUE} r={7} />
        <Bowl cx={100} cy={83} color={BLUE} r={7} />
        <Bowl cx={79} cy={100} color={BLUE} r={7} />
        <Bowl cx={106} cy={98} color={BLUE} r={7} />
        <Bowl cx={83} cy={114} color={BLUE} r={7} />
        <Bowl cx={102} cy={112} color={BLUE} r={7} />
        <Bowl cx={88} cy={127} color={BLUE} r={7} />
        <Bowl cx={104} cy={126} color={BLUE} r={7} />
        <Bowl cx={78} cy={126} color={BLUE} r={7} />
        {/* Red bowls */}
        <Bowl cx={64} cy={80} color={RED} r={7} />
        <Bowl cx={124} cy={78} color={RED} r={7} />
        <Bowl cx={59} cy={96} color={RED} r={7} />
        <Bowl cx={129} cy={94} color={RED} r={7} />
        <Bowl cx={62} cy={111} color={RED} r={7} />
        <Bowl cx={126} cy={109} color={RED} r={7} />
        <Bowl cx={64} cy={126} color={RED} r={7} />
        <Bowl cx={125} cy={125} color={RED} r={7} />
        <Bowl cx={68} cy={140} color={RED} r={7} />
        {/* Delivery order */}
        <text x={95} y={158} fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.65">Leads → Seconds → Skips</text>
        {/* Player icons: 3 blue + 3 red */}
        <PlayerIcon cx={35} cy={247} color={BLUE} label="L" r={8} />
        <PlayerIcon cx={56} cy={247} color={BLUE} label="2" r={8} />
        <PlayerIcon cx={77} cy={247} color={BLUE} label="S" r={8} />
        <PlayerIcon cx={113} cy={247} color={RED} label="L" r={8} />
        <PlayerIcon cx={134} cy={247} color={RED} label="2" r={8} />
        <PlayerIcon cx={155} cy={247} color={RED} label="S" r={8} />
        <text x={56} y={263} fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team A</text>
        <text x={134} y={263} fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team B</text>
        <text x={95} y={44} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">3 woods each · 18 ends</text>
      </RinkSVG>
    </GameCard>
  );
}

/* ── Fours ─────────────────────────────────────────────────── */
function FoursGame() {
  return (
    <GameCard
      name="Fours"
      desc="A fours game takes place between eight players — four per team: Lead, Second, Third, and Skip. Each player delivers two woods. Players bowl in position order — all Leads first, then Seconds, Thirds, and finally Skips. The game is played over 21 ends."
    >
      <RinkSVG>
        <Jack cx={95} cy={68} />
        {/* Blue bowls */}
        <Bowl cx={84} cy={83} color={BLUE} r={7} />
        <Bowl cx={100} cy={81} color={BLUE} r={7} />
        <Bowl cx={78} cy={97} color={BLUE} r={7} />
        <Bowl cx={106} cy={95} color={BLUE} r={7} />
        <Bowl cx={82} cy={111} color={BLUE} r={7} />
        <Bowl cx={102} cy={109} color={BLUE} r={7} />
        <Bowl cx={86} cy={124} color={BLUE} r={7} />
        <Bowl cx={98} cy={123} color={BLUE} r={7} />
        {/* Red bowls */}
        <Bowl cx={63} cy={78} color={RED} r={7} />
        <Bowl cx={127} cy={76} color={RED} r={7} />
        <Bowl cx={57} cy={93} color={RED} r={7} />
        <Bowl cx={133} cy={91} color={RED} r={7} />
        <Bowl cx={60} cy={108} color={RED} r={7} />
        <Bowl cx={130} cy={106} color={RED} r={7} />
        <Bowl cx={63} cy={123} color={RED} r={7} />
        <Bowl cx={127} cy={121} color={RED} r={7} />
        {/* Delivery order */}
        <text x={95} y={152} fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.65">Lead → Second → Third → Skip</text>
        {/* Player icons: 4 blue + 4 red, r=7 to fit in standard width */}
        <PlayerIcon cx={22} cy={248} color={BLUE} label="L" r={7} />
        <PlayerIcon cx={42} cy={248} color={BLUE} label="2" r={7} />
        <PlayerIcon cx={62} cy={248} color={BLUE} label="3" r={7} />
        <PlayerIcon cx={82} cy={248} color={BLUE} label="S" r={7} />
        <PlayerIcon cx={108} cy={248} color={RED} label="L" r={7} />
        <PlayerIcon cx={128} cy={248} color={RED} label="2" r={7} />
        <PlayerIcon cx={148} cy={248} color={RED} label="3" r={7} />
        <PlayerIcon cx={168} cy={248} color={RED} label="S" r={7} />
        <text x={52} y={263} fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team A</text>
        <text x={138} y={263} fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">Team B</text>
        <text x={95} y={44} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">2 woods each · 21 ends</text>
      </RinkSVG>
    </GameCard>
  );
}

/* ── 75s ───────────────────────────────────────────────────── */
function SeventyFivesGame() {
  return (
    <GameCard
      name="75s"
      desc="A fun variant especially suited to beginners. Unlike standard formats, both teams can score at each end — the four woods lying closest to the jack score 4, 3, 2, and 1 points respectively, regardless of which team bowled them. The first player or team to reach 75 points wins. Ties continue until someone leads at the end of an end."
    >
      <RinkSVG>
        <Jack cx={95} cy={72} />
        {/* 4 closest bowls scoring 4,3,2,1 — mixed colours */}
        {/* 1st closest: blue (4 pts) */}
        <Bowl cx={90} cy={87} color={BLUE} r={9} />
        <text x={90} y={100} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700" opacity="0.9">4 pts</text>
        {/* 2nd: red (3 pts) */}
        <Bowl cx={106} cy={90} color={RED} r={9} />
        <text x={106} y={103} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700" opacity="0.9">3 pts</text>
        {/* 3rd: blue (2 pts) */}
        <Bowl cx={80} cy={107} color={BLUE} r={9} />
        <text x={80} y={120} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700" opacity="0.9">2 pts</text>
        {/* 4th: red (1 pt) */}
        <Bowl cx={114} cy={105} color={RED} r={9} />
        <text x={114} y={118} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700" opacity="0.9">1 pt</text>
        {/* Other bowls (don't score) */}
        <Bowl cx={65} cy={100} color={RED} r={7} />
        <Bowl cx={126} cy={97} color={BLUE} r={7} />
        <Bowl cx={68} cy={118} color={BLUE} r={7} />
        <Bowl cx={123} cy={116} color={RED} r={7} />
        {/* Both teams score label */}
        <text x={95} y={152} fontSize="7" textAnchor="middle" fill="rgba(127,255,170,0.65)" fontFamily="DM Sans,sans-serif">Both teams can score each end</text>
        {/* Scoring chart */}
        <rect x={30} y={165} width={130} height={44} fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" rx="2" />
        <text x={95} y={177} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.5)" fontFamily="DM Sans,sans-serif">1st closest = 4 pts</text>
        <text x={95} y={188} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.5)" fontFamily="DM Sans,sans-serif">2nd = 3 pts · 3rd = 2 pts · 4th = 1 pt</text>
        <text x={95} y={200} fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.75">Total 10 points per end · first to 75 wins</text>
        {/* Player icons at mat (generic A, B) */}
        <PlayerIcon cx={76} cy={252} color={BLUE} label="A" />
        <PlayerIcon cx={114} cy={252} color={RED} label="B" />
        <text x={95} y={44} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif">10 pts per end · first to 75</text>
      </RinkSVG>
    </GameCard>
  );
}

/* ── main export ───────────────────────────────────────────── */
export function GameTypeDiagrams() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '2.5rem 2rem',
      marginTop: '1rem',
    }}>
      <SinglesGame />
      <PairsGame />
    </div>
  );
}
