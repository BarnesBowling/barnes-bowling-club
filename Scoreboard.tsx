/* Scoreboard.tsx
 * Flat-illustration SVG icon based on the Henselite metal-frame scoreboard.
 * Two vertical posts, empty header bar, two flip-card score panels, ENDS row,
 * rectangular sled base (not A-frame). Transparent background.
 * ViewBox 180×280 matches the How-to-Play thumbnail convention.
 */

const FRAME  = '#1a3a2a'; // dark club green — posts, header, sled base
const HEADER = '#0f2218'; // slightly darker green — empty header bar
const CARD   = '#f5f0e8'; // cream — flip-card panels
const GOLD   = '#c9a84c'; // gold — ENDS label accent
const INK    = '#1a1a14'; // near-black — score numerals
const DIM    = 'rgba(90,70,30,0.55)'; // muted warm brown — HOME / AWAY micro-labels

export function Scoreboard({ width = '100%' }: { width?: string | number }) {
  return (
    <svg
      viewBox="0 0 180 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width, display: 'block' }}
    >
      {/* ── Vertical posts ─────────────────────────────────────
          Left post: x=32, Right post: x=148
          strokeWidth=7 so each post is a visible 7px-wide bar.   */}
      <line x1="32" y1="18" x2="32" y2="244"
            stroke={FRAME} strokeWidth="7" strokeLinecap="butt" />
      <line x1="148" y1="18" x2="148" y2="244"
            stroke={FRAME} strokeWidth="7" strokeLinecap="butt" />

      {/* ── Header bar — empty green band spanning the posts ───
          Dark green, no text. Rounded top corners, squared bottom
          (achieved by stacking a rx=2 rect then squaring the lower
          rounded corners with a plain rect overlay).               */}
      <rect x="28" y="18" width="124" height="36" rx="2" fill={HEADER} />
      <rect x="28" y="42" width="124" height="12" fill={HEADER} />
      {/* Player labels — centred above each score card, gold on green */}
      <text x="61" y="38" fontSize="7.5" textAnchor="middle"
            fontFamily="DM Sans,sans-serif" fontWeight="600" letterSpacing="0.3"
            fill={GOLD}>Player 1</text>
      <text x="119" y="38" fontSize="7.5" textAnchor="middle"
            fontFamily="DM Sans,sans-serif" fontWeight="600" letterSpacing="0.3"
            fill={GOLD}>Player 2</text>

      {/* Hairline separator below header */}
      <line x1="28" y1="54" x2="152" y2="54"
            stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />

      {/* ── Score area backing (green panel between posts) ─────  */}
      <rect x="36" y="54" width="108" height="196" fill={FRAME} opacity="0.55" />

      {/* ── Main score cards ───────────────────────────────────

          Left card: HOME
          Positions: x=36, y=58, w=50, h=82
          Flip-line centred at y=99 (58+41)
          "0" baseline at y=113 (cap-top ≈ y=85, centre ≈ y=99)  */}
      <rect x="36" y="58" width="50" height="82" rx="2" fill={CARD} />
      <line x1="36" y1="99" x2="86" y2="99"
            stroke="rgba(0,0,0,0.07)" strokeWidth="0.9" />

      <text x="61" y="111" fontSize="32" textAnchor="middle"
            fontFamily="DM Sans,sans-serif" fontWeight="700" fill={INK}>20</text>

      {/* Right card: AWAY  (x=94, same height) */}
      <rect x="94" y="58" width="50" height="82" rx="2" fill={CARD} />
      <line x1="94" y1="99" x2="144" y2="99"
            stroke="rgba(0,0,0,0.07)" strokeWidth="0.9" />

      <text x="119" y="111" fontSize="32" textAnchor="middle"
            fontFamily="DM Sans,sans-serif" fontWeight="700" fill={INK}>21</text>

      {/* Subtle "v" between cards */}
      <text x="90" y="101" fontSize="10" textAnchor="middle"
            fontFamily="DM Sans,sans-serif"
            fill="rgba(245,240,232,0.18)">v</text>

      {/* ── Section divider ────────────────────────────────────  */}
      <line x1="36" y1="149" x2="144" y2="149"
            stroke="rgba(245,240,232,0.14)" strokeWidth="0.8" />

      {/* ── ENDS row ───────────────────────────────────────────
          ENDS label left-aligned under HOME card.
          ENDS score card aligned under AWAY card (x=94).
          Card: y=152, h=38 → flip-line at y=171, "0" baseline y=179. */}
      <text x="36" y="173" fontSize="7.5"
            fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="1.5"
            fill={GOLD} opacity="0.88">ENDS</text>

      <rect x="94" y="152" width="50" height="38" rx="2" fill={CARD} />
      <line x1="94" y1="171" x2="144" y2="171"
            stroke="rgba(0,0,0,0.07)" strokeWidth="0.9" />
      <text x="119" y="179" fontSize="22" textAnchor="middle"
            fontFamily="DM Sans,sans-serif" fontWeight="700" fill={INK}>0</text>

      {/* ── Rectangular sled base ──────────────────────────────
          Matches the Henselite H-frame: a wide rectangular perimeter
          frame at the foot of the posts, extending outward on each side.

          Main crossbar (where posts meet the base): y=244-260
          Outer sled width wider than posts: x=14 to x=166           */}

      {/* Top rail of sled (connects post bottoms) */}
      <line x1="14" y1="244" x2="166" y2="244"
            stroke={FRAME} strokeWidth="6" strokeLinecap="round" />
      {/* Left side piece (sled runner stub) */}
      <line x1="14" y1="244" x2="14" y2="262"
            stroke={FRAME} strokeWidth="6" strokeLinecap="round" />
      {/* Right side piece */}
      <line x1="166" y1="244" x2="166" y2="262"
            stroke={FRAME} strokeWidth="6" strokeLinecap="round" />
      {/* Bottom rail (ground contact) */}
      <line x1="14" y1="262" x2="166" y2="262"
            stroke={FRAME} strokeWidth="6" strokeLinecap="round" />
      {/* Inner crossbar connecting the two posts through the sled body */}
      <line x1="32" y1="253" x2="148" y2="253"
            stroke={FRAME} strokeWidth="4" strokeLinecap="round" />
      {/* Rubber foot caps at sled corners */}
      <circle cx="14"  cy="263" r="4" fill={FRAME} />
      <circle cx="166" cy="263" r="4" fill={FRAME} />
    </svg>
  );
}
