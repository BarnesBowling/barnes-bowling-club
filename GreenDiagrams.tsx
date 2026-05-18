'use client';

const G = '#2d5a3d';
const GL = '#4a7c59';
const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const DITCH_COL = '#1a3a2a';
const BANK_COL = '#3d2b1a';
const WALL_COL = '#6b5a3e';
const WHITE = '#ffffff';
const DIM_COL = 'rgba(201,168,76,0.9)';

/* ── shared label helpers ────────────────────────────────── */
function DimLine({ x1, y1, x2, y2, label, mid }: { x1: number; y1: number; x2: number; y2: number; label: string; mid?: [number, number] }) {
  const mx = mid ? mid[0] : (x1 + x2) / 2;
  const my = mid ? mid[1] : (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM_COL} strokeWidth="0.8" strokeDasharray="3 2" />
      <rect x={mx - 18} y={my - 7} width="36" height="12" fill="rgba(26,58,42,0.85)" rx="2" />
      <text x={mx} y={my + 3.5} fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="600">{label}</text>
    </g>
  );
}

function Label({ x, y, text, sub }: { x: number; y: number; text: string; sub?: string }) {
  return (
    <g>
      <text x={x} y={y} fontSize="7.5" textAnchor="middle" fill={CREAM} fontFamily="DM Sans,sans-serif" fontWeight="600" letterSpacing="0.5">{text}</text>
      {sub && <text x={x} y={y + 10} fontSize="6" textAnchor="middle" fill="rgba(245,240,232,0.5)" fontFamily="DM Sans,sans-serif">{sub}</text>}
    </g>
  );
}

/* ── DIAGRAM 1: The Green — portrait 220×300 ─────────────── */
export function DiagramTheGreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: 500, color: G }}>The Green</div>
      <svg viewBox="0 0 220 300" style={{ width: '100%', maxWidth: 220, display: 'block' }}>
        {/* Walled garden background */}
        <rect x="0" y="0" width="220" height="300" fill={WALL_COL} rx="4" />
        {/* Wall texture lines */}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280].map(y => (
          <line key={y} x1="0" y1={y} x2="220" y2={y} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        ))}
        {/* Ditch */}
        <rect x="16" y="16" width="188" height="268" fill={DITCH_COL} rx="2" />
        {/* Green surface */}
        <rect x="26" y="26" width="168" height="248" fill={G} />
        {/* Green surface highlight */}
        <rect x="26" y="26" width="168" height="248" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.2" />
        {/* White dashed X — diagonal corner to corner */}
        <line x1="26" y1="26" x2="194" y2="274" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
        <line x1="194" y1="26" x2="26" y2="274" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
        {/* White markers: short edges at 35/50/65%, long edges at 1/3 and 2/3 */}
        <rect x="80"  y="24"  width="10" height="4" fill="white" rx="1" />
        <rect x="105" y="24"  width="10" height="4" fill="white" rx="1" />
        <rect x="130" y="24"  width="10" height="4" fill="white" rx="1" />
        <rect x="80"  y="272" width="10" height="4" fill="white" rx="1" />
        <rect x="105" y="272" width="10" height="4" fill="white" rx="1" />
        <rect x="130" y="272" width="10" height="4" fill="white" rx="1" />
        <rect x="24"  y="105" width="4"  height="8" fill="white" rx="1" />
        <rect x="24"  y="187" width="4"  height="8" fill="white" rx="1" />
        <rect x="192" y="105" width="4"  height="8" fill="white" rx="1" />
        <rect x="192" y="187" width="4"  height="8" fill="white" rx="1" />
        {/* Corner mats — one at each corner for diagonal play across quartiles */}
        {[
          { x: 28,  y: 28  },
          { x: 170, y: 28  },
          { x: 28,  y: 264 },
          { x: 170, y: 264 },
        ].map(({ x, y }, i) => (
          <g key={i}>
            <rect x={x} y={y} width="22" height="8" fill="rgba(201,168,76,0.3)" stroke={GOLD} strokeWidth="0.8" rx="1" />
            <text x={x + 11} y={y + 5.5} fontSize="4.5" fill={GOLD} textAnchor="middle" fontFamily="DM Sans,sans-serif">MAT</text>
          </g>
        ))}
        {/* Dimension lines */}
        <DimLine x1={8} y1={26} x2={8} y2={274} label="~30m" mid={[8, 150]} />
        <DimLine x1={26} y1={290} x2={194} y2={290} label="~25m" mid={[110, 290]} />
        {/* Labels */}
        <Label x={110} y={148} text="PLAYING SURFACE" sub="naturally undulating" />
        {/* Compass */}
        <text x={205} y={45} fontSize="8" fill="rgba(245,240,232,0.5)" textAnchor="middle" fontFamily="DM Sans,sans-serif">N</text>
        <line x1="205" y1="30" x2="205" y2="48" stroke="rgba(245,240,232,0.35)" strokeWidth="0.8" />
        <polygon points="205,28 202,36 205,33 208,36" fill="rgba(245,240,232,0.5)" />
      </svg>
      <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '12px', lineHeight: 1.7, color: '#4a4a42', margin: 0 }}>
        The Barnes green is naturally undulating — unlike a modern flat green. It sits in a walled garden behind the Sun Inn, approximately 30 × 25 metres. The contour lines show the natural slopes that develop over centuries of play.
      </p>
    </div>
  );
}

/* ── DIAGRAM 2: Around the Green — portrait 200×280 ─────── */
export function DiagramAroundTheGreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: 500, color: G }}>Around the Green</div>
      <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
        {/* Background */}
        <rect x="0" y="0" width="180" height="280" fill="#0d1f16" rx="4" />

        {/* Left ditch — x-coords scaled ×0.9 from 200-wide original */}
        <rect x="13" y="100" width="16" height="45" fill={DITCH_COL} />
        <text x="21" y="128" fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif" letterSpacing="0.8" transform="rotate(-90,21,128)">DITCH</text>

        {/* Right ditch */}
        <rect x="151" y="100" width="16" height="45" fill={DITCH_COL} />
        <text x="159" y="128" fontSize="5.5" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans,sans-serif" letterSpacing="0.8" transform="rotate(90,159,128)">DITCH</text>

        {/* Green body — shallow bowl: edges at y=100, centre dips only to y=106 */}
        <path d="M29,145 L29,100 C49,106 131,106 151,100 L151,145 Z" fill={G} />

        {/* Bowl surface outline — subtle cubic bezier */}
        <path d="M29,100 C49,106 131,106 151,100" fill="none" stroke={GL} strokeWidth="1.2" opacity="0.5" />

        {/* Natural undulation wavy line riding the bowl surface */}
        <path d="M36,101 Q52,104 70,106 Q90,107 110,106 Q128,104 144,101" fill="none" stroke={GL} strokeWidth="1" />

        {/* Natural undulation label */}
        <line x1="90" y1="106" x2="90" y2="88" stroke={GOLD} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />
        <text x="90" y="84" fontSize="6.5" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" opacity="0.75">natural undulation</text>

        {/* CROSS-SECTION VIEW caption */}
        <text x="90" y="175" fontSize="7.5" textAnchor="middle" fill="rgba(245,240,232,0.2)" fontFamily="DM Sans,sans-serif">CROSS-SECTION VIEW</text>
      </svg>
      <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '12px', lineHeight: 1.7, color: '#4a4a42', margin: 0 }}>
        Cross-section showing the ditch on each long edge and the natural undulation of the green surface. The long edges curve up slightly where the green meets the ditch — a feature of the historic Barnes green that contributes to its unique character.
      </p>
    </div>
  );
}

/* ── main export ─────────────────────────────────────────── */
export function GreenDiagrams() {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '2.5rem 2rem',
        marginTop: '1rem',
      }}>
        <DiagramAroundTheGreen />
      </div>
    </div>
  );
}
