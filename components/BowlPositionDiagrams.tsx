'use client';

const green = '#2d5a3d';
const greenLight = '#3d7a52';
const cream = '#f5f0e8';
const gold = '#c9a84c';
const white = '#ffffff';
const red = '#e85c2e';
const ditch = '#1a3a2a';
const boundary = 'rgba(201,168,76,0.5)';

const captionStyle = { fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.75, color: '#4a4a42', margin: '0.5rem 0 0' } as const;

function RinkBase({ children, label, desc, extraContent }: { children: React.ReactNode; label: string; desc?: string; extraContent?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <svg viewBox="0 0 200 280" style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto' }}>
        {/* Ditch area */}
        <rect x="0" y="0" width="200" height="280" fill={ditch} rx="4" />
        {/* Green surface */}
        <rect x="20" y="24" width="160" height="232" fill={green} />
        {/* Rink inner surface */}
        <rect x="30" y="34" width="140" height="212" fill={greenLight} opacity="0.4" />
        {/* Ditch label */}
        <text x="10" y="16" fontSize="7" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans, sans-serif" letterSpacing="1">DITCH</text>
        <text x="10" y="272" fontSize="7" fill="rgba(245,240,232,0.4)" fontFamily="DM Sans, sans-serif" letterSpacing="1">DITCH</text>
        {/* Boundary lines */}
        <rect x="20" y="24" width="160" height="232" fill="none" stroke={boundary} strokeWidth="1.5" />
        {/* Mat — lower-right corner */}
        <rect x="136" y="230" width="40" height="18" fill="rgba(201,168,76,0.25)" stroke={gold} strokeWidth="1" rx="1" />
        <text x="156" y="242" fontSize="6" fill={gold} textAnchor="middle" fontFamily="DM Sans, sans-serif">MAT</text>
        {children}
      </svg>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: green, marginBottom: '6px' }}>{label}</div>
        {desc && <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.75, color: '#4a4a42', margin: 0 }}>{desc}</p>}
        {extraContent}
      </div>
    </div>
  );
}

function Jack({ cx, cy, live = true }: { cx: number; cy: number; live?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="7" fill={live ? white : 'rgba(255,255,255,0.2)'} stroke={live ? gold : 'rgba(201,168,76,0.4)'} strokeWidth="1.5" />
      <text x={cx} y={cy + 4} fontSize="7" textAnchor="middle" fill={live ? gold : 'rgba(201,168,76,0.4)'} fontFamily="DM Sans,sans-serif" fontWeight="600">J</text>
    </g>
  );
}

function Bowl({ cx, cy, color = white, label = '', chalk = false, dead = false }: { cx: number; cy: number; color?: string; label?: string; chalk?: boolean; dead?: boolean }) {
  return (
    <g opacity={dead ? 0.35 : 1}>
      <circle cx={cx} cy={cy} r="10" fill={color} stroke={dead ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'} strokeWidth="1.5" />
      {chalk && <circle cx={cx} cy={cy} r="10" fill="none" stroke="white" strokeWidth="2" strokeDasharray="3 2" />}
      {label && <text x={cx} y={cy + 4} fontSize="8" textAnchor="middle" fill={dead ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)'} fontFamily="DM Sans,sans-serif" fontWeight="600">{label}</text>}
    </g>
  );
}

function ChalkMark({ cx, cy }: { cx: number; cy: number }) {
  return <text x={cx + 11} y={cy - 8} fontSize="9" fill="white" fontFamily="DM Sans,sans-serif">✓</text>;
}

// ── DIAGRAM 1: Live Bowl ─────────────────────────────────────────
function LiveBowl() {
  return (
    <RinkBase
      label="Live Wood"
      extraContent={
        <p style={captionStyle}>
          A Wood that has been delivered and comes to rest within the playing quartile of the Green. Live Woods count toward scoring at the end of the end.
        </p>
      }
    >
      <Jack cx={65} cy={70} />
      <Bowl cx={55} cy={90} color="#2a9d8f" label="B" />
      <Bowl cx={80} cy={100} color={red} label="R" />
      <Bowl cx={45} cy={115} color="#2a9d8f" label="B" />
      {/* Labels */}
      <text x={100} y={268} fontSize="7" fill="rgba(245,240,232,0.6)" textAnchor="middle" fontFamily="DM Sans,sans-serif">All woods within Green = live</text>
    </RinkBase>
  );
}

// ── DIAGRAM 2: Dead Bowl ─────────────────────────────────────────
function DeadBowl() {
  return (
    <RinkBase
      label="Dead Wood"
      extraContent={
        <p style={captionStyle}>
          A Wood that has come to rest entirely outside the boundaries of the Green is considered dead. It cannot score or be brought back into play.
        </p>
      }
    >
      <Jack cx={65} cy={75} />
      <Bowl cx={60} cy={95} color="#2a9d8f" label="B" />
      <Bowl cx={77} cy={90} color={red} label="R" />
      {/* Dead bowl outside boundary */}
      <Bowl cx={10} cy={88} color={red} label="R" dead />
      <text x={10} y={108} fontSize="6.5" fill="rgba(245,240,232,0.4)" textAnchor="middle" fontFamily="DM Sans,sans-serif">DEAD</text>
      <line x1="20" y1="88" x2="32" y2="88" stroke="rgba(200,50,50,0.5)" strokeWidth="1" strokeDasharray="3 2" />
    </RinkBase>
  );
}

// ── DIAGRAM 3: Dead Jack ─────────────────────────────────────────
function DeadJack() {
  return (
    <RinkBase
      label="Dead Jack"
      extraContent={
        <>
          <p style={captionStyle}>
            If the Jack is driven over the side boundary or over the bank, the end is stopped and restarted from the opposite end. The player who originally rolled the Jack will roll again.
          </p>
          <p style={captionStyle}>
            If the Jack is thrown out on the first roll, it is re-rolled by the opposition, but the original order of play remains unchanged.
          </p>
        </>
      }
    >
      {/* Dead jack outside side boundary */}
      <Jack cx={185} cy={80} live={false} />
      <text x={185} y={100} fontSize="6.5" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="DM Sans,sans-serif">DEAD</text>
      {/* Arrow showing jack path */}
      <line x1="78" y1="80" x2="178" y2="80" stroke="rgba(200,50,50,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Bowls on green */}
      <Bowl cx={50} cy={90} color="#2a9d8f" label="B" />
      <Bowl cx={70} cy={80} color={red} label="R" />
      {/* X mark */}
      <text x={100} y={155} fontSize="22" textAnchor="middle" fill="rgba(192,57,43,0.25)" fontFamily="DM Sans,sans-serif">✕</text>
      <text x={100} y={170} fontSize="7.5" textAnchor="middle" fill="rgba(192,57,43,0.6)" fontFamily="DM Sans,sans-serif">End must be replayed</text>
      <text x={100} y={268} fontSize="7" fill="rgba(245,240,232,0.6)" textAnchor="middle" fontFamily="DM Sans,sans-serif">Jack crosses side boundary = Queen / non scoring</text>
    </RinkBase>
  );
}

// ── DIAGRAM 6: Boundary Jack ─────────────────────────────────────
function BoundaryJack() {
  return (
    <RinkBase
      label="Boundary Jack"
      extraContent={
        <>
          <p style={captionStyle}>The Jack stays where it comes to rest unless it is:</p>
          <ul style={{ ...captionStyle, margin: '0.25rem 0 0', paddingLeft: '1.25em' }}>
            <li style={{ marginBottom: '0.15rem' }}>less than 6 feet from the edge of the green. If there is any doubt the wooden stick is used to measure.</li>
            <li style={{ marginBottom: '0.15rem' }}>over the centre line when only one green is being used</li>
            <li>within 4 feet of the centre line when both greens are in use</li>
          </ul>
        </>
      }
    >
      {/* Jack on boundary line */}
      <Jack cx={20} cy={80} live />
      {/* Highlight boundary */}
      <line x1="20" y1="24" x2="20" y2="256" stroke={gold} strokeWidth="2" opacity="0.6" strokeDasharray="5 3" />
      <text x={20} y={80} fontSize="6.5" fill={gold} textAnchor="middle" fontFamily="DM Sans,sans-serif" transform="rotate(-90,20,80)">BOUNDARY</text>
      {/* Bowls */}
      <Bowl cx={65} cy={85} color="#2a9d8f" label="B" />
      <Bowl cx={83} cy={78} color={red} label="R" />
      {/* Live indicator */}
      <circle cx={20} cy={80} r="14" fill="none" stroke="rgba(127,255,170,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={50} y={100} fontSize="7" fill="rgba(127,255,170,0.7)" fontFamily="DM Sans,sans-serif">still live</text>
      <text x={100} y={268} fontSize="7" fill="rgba(245,240,232,0.6)" textAnchor="middle" fontFamily="DM Sans,sans-serif">Jack on or inside boundary = live</text>
    </RinkBase>
  );
}

export function BowlPositionDiagrams() {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '3rem 2rem',
        marginTop: '1rem',
      }}>
        <LiveBowl />
        <DeadBowl />
        <DeadJack />
        <BoundaryJack />
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.25rem 1.5rem',
        background: 'rgba(45,90,61,.06)',
        border: '1px solid rgba(45,90,61,.12)',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', alignSelf: 'center' }}>Key</div>
        {[
          { color: '#2a9d8f', label: 'Teal team woods' },
          { color: red, label: 'Orange team woods' },
          { color: white, label: 'Jack' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18"><circle cx="9" cy="9" r="8" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" /></svg>
            <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
