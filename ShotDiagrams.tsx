'use client';

import { useEffect, useId, useRef, useState } from 'react';

const G = '#2d5a3d';
const GL = '#3d7a52';
const BLUE = '#2980b9';
const TEAL = '#2a9d8f';
const RED = '#c0392b';
const JACK_COL = '#f5f0e8';
const GOLD = '#c9a84c';
const DITCH  = '#1a3a2a';
const ORANGE = '#e85c2e';

/* ── tiny helpers ─────────────────────────────────────────── */
function RinkSVG({ children, w = 180, h = 260, matX }: { children: React.ReactNode; w?: number; h?: number; matX?: number }) {
  const mx = matX ?? w / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={GOLD} opacity="0.85" />
        </marker>
        <marker id="arr-red" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={RED} opacity="0.7" />
        </marker>
        <marker id="arr-blue" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={BLUE} opacity="0.7" />
        </marker>
        <marker id="arr-orange" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={ORANGE} opacity="0.7" />
        </marker>
        <marker id="arr-teal" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill={TEAL} opacity="0.7" />
        </marker>
        {/* Wood body gradient — dark brown, same family as GameTypeDiagrams WoodBowl */}
        <radialGradient id="sd-wood" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
      </defs>
      {/* ditch */}
      <rect x="0" y="0" width={w} height={h} fill={DITCH} rx="3" />
      {/* green */}
      <rect x="15" y="18" width={w - 30} height={h - 36} fill={G} />
      <rect x="22" y="25" width={w - 44} height={h - 50} fill={GL} opacity="0.35" />
      {/* boundary */}
      <rect x="15" y="18" width={w - 30} height={h - 36} fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
      {/* mat */}
      <rect x={mx - 16} y={h - 34} width="32" height="12" fill="rgba(201,168,76,0.2)" stroke={GOLD} strokeWidth="0.8" rx="1" />
      <text x={mx} y={h - 25} fontSize="5" fill={GOLD} textAnchor="middle" fontFamily="DM Sans,sans-serif">MAT</text>
      {children}
    </svg>
  );
}

function Jack({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="6" fill={JACK_COL} stroke={GOLD} strokeWidth="1.2" />
      <text x={cx} y={cy + 3.5} fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>
    </g>
  );
}
function Bowl({ cx, cy, color = BLUE, label = '' }: { cx: number; cy: number; color?: string; label?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill={color} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      {label && <text x={cx} y={cy + 3.5} fontSize="7.5" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontFamily="DM Sans,sans-serif" fontWeight="600">{label}</text>}
    </g>
  );
}

/* static branded wood (dark brown body + coloured sticker) */
function WoodBowl({ cx, cy, stickerColor, r = 9 }: { cx: number; cy: number; stickerColor: string; r?: number }) {
  const sr = r * 0.44;
  const fs = Math.max(2.5, sr * 0.78);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#sd-wood)" />
      <circle cx={cx} cy={cy} r={r * 0.76} fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.55" />
      <circle cx={cx} cy={cy} r={r * 0.52} fill="none" stroke="#5c3820" strokeWidth="0.6" opacity="0.4" />
      <circle cx={cx} cy={cy} r={sr} fill={stickerColor} />
      <text x={cx} y={cy + fs * 0.38} fontSize={fs} textAnchor="middle"
            fill="#ffffff" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </g>
  );
}

/* animated branded wood travelling along a quadratic bezier */
function AnimWoodBowl({ x1, y1, cx, cy, x2, y2, stickerColor }: {
  x1: number; y1: number; cx: number; cy: number; x2: number; y2: number;
  stickerColor: string;
}) {
  const reactId = useId().replace(/:/g, '-');
  const pathId = `aw-${reactId}`;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const r = 9;
  const sr = r * 0.44;
  const fs = Math.max(2.5, sr * 0.78);
  const wood = (
    <>
      <circle r={r} fill="url(#sd-wood)" />
      <circle r={r * 0.76} fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.55" />
      <circle r={r * 0.52} fill="none" stroke="#5c3820" strokeWidth="0.6" opacity="0.4" />
      <circle r={sr} fill={stickerColor} />
      <text y={fs * 0.38} fontSize={fs} textAnchor="middle"
            fill="#ffffff" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </>
  );

  return (
    <g>
      {/* dashed gold trajectory line */}
      <path id={pathId} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
            fill="none" stroke={GOLD} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
      {/* wood: static at mat when reduced motion, animated along path otherwise */}
      {reducedMotion ? (
        <g transform={`translate(${x1},${y1})`}>{wood}</g>
      ) : (
        <g>
          <animateMotion keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear"
                         dur="4s" repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
          <g>
            <animateTransform attributeName="transform" type="rotate"
                              from="0" to="360" dur="2s" repeatCount="indefinite" />
            {wood}
          </g>
        </g>
      )}
    </g>
  );
}

/* animated travelling bowl along a quadratic bezier */
function AnimBowl({ x1, y1, cx, cy, x2, y2, color = BLUE, delay = 0 }: {
  x1: number; y1: number; cx: number; cy: number; x2: number; y2: number;
  color?: string; delay?: number;
}) {
  const pathId = useRef(`p-${Math.random().toString(36).slice(2)}`).current;
  return (
    <g>
      {/* trajectory */}
      <path id={pathId} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
        fill="none" stroke={GOLD} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.6" />
      {/* travelling bowl */}
      <circle r="8" fill={color} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}

/* animated arrow line */
function AnimLine({ x1, y1, x2, y2, color = GOLD, dur = '1s', delay = 0, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number;
  color?: string; dur?: string; delay?: number; dashed?: boolean;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="1.5"
      strokeDasharray={dashed ? `${len} ${len}` : `${len} ${len}`}
      strokeDashoffset={len}
      markerEnd={`url(#arr)`}
      opacity="0.8"
    >
      <animate attributeName="stroke-dashoffset" from={len} to="0" dur={dur} begin={`${delay}s`} repeatCount="indefinite" />
    </line>
  );
}

/* ── card wrapper ─────────────────────────────────────────── */
function ShotCard({ name, desc, children }: { name: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', fontWeight: 500, color: G }}>{name}</div>
      {children}
      <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: '12px', lineHeight: 1.7, color: '#4a4a42', margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOT DIAGRAMS
═══════════════════════════════════════════════════════════ */

function DrawShot() {
  return (
    <ShotCard name="Draw" desc="The most important shot in bowls. Delivered with the exact weight needed to finish close to the jack, following a curved path due to the bias.">
      <RinkSVG matX={38}>
        {/* Teal wood trajectory + animation rendered first so orange woods sit on top */}
        <AnimWoodBowl x1={38} y1={232} cx={60} cy={155} x2={90} y2={80} stickerColor={TEAL} />
        {/* Orange woods spaced apart — path passes between them at x≈80, y≈107 */}
        <WoodBowl cx={65}  cy={105} stickerColor={ORANGE} />
        <WoodBowl cx={112} cy={108} stickerColor={ORANGE} />
        {/* Jack last so it stays on top of the arriving teal wood */}
        <Jack cx={90} cy={80} />
      </RinkSVG>
    </ShotCard>
  );
}

function TrailShot() {
  return (
    <ShotCard name="Trail" desc="A shot that carries the jack forward with it to a new position, ideally dragging it closer to your own woods or away from the opponent's.">
      {/* matX=31 — mat flush with the left green boundary (green starts x=15, mat rect x=15–47) */}
      <RinkSVG matX={31}>
        {/* Jack "before" (ghost) — original position, where the bowl strikes it */}
        <circle cx={100} cy={100} r="6" fill={JACK_COL} stroke={GOLD} strokeWidth="1.2" opacity="0.3" />
        {/* Arrow: jack carried from (100,100) toward final position (127,65) */}
        {/* Line runs edge-to-edge: from 6px outside ghost → 6px outside final */}
        <line x1="104" y1="95" x2="123" y2="70"
              stroke={GOLD} strokeWidth="1.2" strokeDasharray="3 2"
              opacity="0.55" markerEnd="url(#arr)" />
        {/* Jack "after" (final) — 50% right of original cx=90 → cx=127 */}
        <Jack cx={127} cy={65} />
        {/* Two orange branded woods in the head, flanking the ghost jack */}
        {/* Verified clear of ghost jack (r=6) and each other (r=9):      */}
        {/*   wood1↔jack: 17.2px > 15  ✓   wood2↔jack: 22.2px > 15  ✓   */}
        {/*   wood1↔wood2: 20.8px > 18 ✓                                  */}
        <WoodBowl cx={86}  cy={110} stickerColor={ORANGE} />
        <WoodBowl cx={103} cy={122} stickerColor={ORANGE} />
        {/* Blue branded wood — travels from bottom-left mat along bias path to jack */}
        {/* Path (31,232) Q (55,165) (127,65) passes near both woods and ghost jack  */}
        <AnimWoodBowl x1={31} y1={232} cx={55} cy={165} x2={127} y2={65} stickerColor={BLUE} />
      </RinkSVG>
    </ShotCard>
  );
}

function RestShot() {
  return (
    <ShotCard name="Rest" desc="Played with slightly more weight than a draw. The wood comes to rest against an opponent's wood, pushing it aside and placing your wood close to the jack.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={78} />
        {/* opponent wood being rested against — ghost shows target */}
        <circle cx={88} cy={105} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" opacity="0.35" />
        <WoodBowl cx={88} cy={105} stickerColor={ORANGE} />
        <WoodBowl cx={108} cy={100} stickerColor={ORANGE} />
        {/* teal wood arriving from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={120} cy={168} x2={82} y2={115} stickerColor={TEAL} />
        {/* result: your wood close to jack */}
        <circle cx={82} cy={90} r="9" fill={TEAL} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" opacity="0.45" strokeDasharray="3 2" />
      </RinkSVG>
    </ShotCard>
  );
}

function WrestShot() {
  return (
    <ShotCard name="Wrest" desc="Your wood displaces an opponent's wood from its position — and your wood takes that spot. Requires precise weight and line to execute successfully.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={80} />
        {/* opponent wood being displaced */}
        <WoodBowl cx={90} cy={105} stickerColor={ORANGE} />
        {/* arrow showing opponent wood moving away */}
        <line x1="90" y1="105" x2="115" y2="128" stroke={ORANGE} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" markerEnd="url(#arr-orange)" />
        <circle cx={115} cy={130} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.4" />
        {/* teal wood arriving from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={120} cy={168} x2={90} y2={107} stickerColor={TEAL} />
        {/* result: your wood where opponent was */}
        <circle cx={90} cy={100} r="9" fill={TEAL} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" opacity="0.45" strokeDasharray="3 2" />
      </RinkSVG>
    </ShotCard>
  );
}

function PromotionShot() {
  return (
    <ShotCard name="Promotion" desc="Pushes one of your own woods that is already in the head closer to the jack, converting a wood that was counting into one that scores even better.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={75} />
        {/* your wood in head — before promotion */}
        <circle cx={90} cy={115} r="9" fill={TEAL} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" opacity="0.35" />
        {/* arrow showing your wood promoted */}
        <line x1="90" y1="113" x2="90" y2="88" stroke={TEAL} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.65" markerEnd="url(#arr-teal)" />
        {/* promoted position */}
        <WoodBowl cx={90} cy={86} stickerColor={TEAL} />
        <WoodBowl cx={110} cy={105} stickerColor={ORANGE} />
        {/* incoming teal wood from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={115} cy={178} x2={90} y2={117} stickerColor={TEAL} />
      </RinkSVG>
    </ShotCard>
  );
}

function DriveShot() {
  return (
    <ShotCard name="Drive / Fire" desc="Delivered at pace with full weight. The aim is to scatter the head — dislodging opponent woods or driving the jack out of play to spoil a bad end.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={78} />
        <WoodBowl cx={88} cy={100} stickerColor={ORANGE} />
        <WoodBowl cx={98} cy={110} stickerColor={ORANGE} />
        <WoodBowl cx={80} cy={112} stickerColor={TEAL} />
        {/* teal wood drives from bottom-right — nearly straight at pace */}
        <AnimWoodBowl x1={149} y1={232} cx={119} cy={161} x2={90} y2={90} stickerColor={TEAL} />
        {/* speed lines perpendicular to diagonal trajectory */}
        <line x1="135" y1="182" x2="143" y2="178" stroke={GOLD} strokeWidth="0.8" opacity="0.4" />
        <line x1="125" y1="178" x2="117" y2="182" stroke={GOLD} strokeWidth="0.8" opacity="0.4" />
        {/* scattered opponent woods */}
        <circle cx={65} cy={72} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.4" />
        <circle cx={118} cy={85} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.4" />
      </RinkSVG>
    </ShotCard>
  );
}

function BlockShot() {
  return (
    <ShotCard name="Block" desc="Deliberately bowled short of the jack to block a path that the opponent would otherwise use. An effective defensive tactic when you hold shot.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={72} />
        <WoodBowl cx={88} cy={90} stickerColor={TEAL} />
        <WoodBowl cx={102} cy={95} stickerColor={ORANGE} />
        {/* teal block wood delivered short from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={140} cy={188} x2={130} y2={145} stickerColor={TEAL} />
        {/* block position indicator */}
        <circle cx={130} cy={145} r="9" fill={TEAL} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" opacity="0.4" strokeDasharray="3 2" />
        {/* opponent's intended path — from mat offset to jack, blocked at block wood */}
        <line x1="155" y1="228" x2="132" y2="148" stroke={ORANGE} strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        <line x1="132" y1="148" x2="90" y2="76" stroke={ORANGE} strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        <text x={148} y={200} fontSize="7" fill={ORANGE} opacity="0.5" fontFamily="DM Sans,sans-serif">blocked</text>
      </RinkSVG>
    </ShotCard>
  );
}

function PlantShot() {
  return (
    <ShotCard name="Plant" desc="Your wood strikes one of your own woods which then strikes an opponent's wood — a combination shot. Requires precise weight so the first wood transfers momentum cleanly.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={75} />
        {/* opponent wood to be hit */}
        <WoodBowl cx={88} cy={108} stickerColor={ORANGE} />
        {/* your front wood acting as plant */}
        <circle cx={88} cy={130} r="9" fill={TEAL} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" opacity="0.5" />
        {/* arrow: plant wood hits opponent */}
        <line x1="88" y1="121" x2="88" y2="116" stroke={TEAL} strokeWidth="1.5" opacity="0.7" markerEnd="url(#arr-teal)" />
        {/* opponent displaced */}
        <circle cx={105} cy={92} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.4" />
        <line x1="90" y1="107" x2="104" y2="94" stroke={ORANGE} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.55" markerEnd="url(#arr-orange)" />
        {/* teal wood arriving from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={118} cy={182} x2={88} y2={132} stickerColor={TEAL} />
      </RinkSVG>
    </ShotCard>
  );
}

function SplitShot() {
  return (
    <ShotCard name="Split" desc="Delivered between two opponent woods to dislodge both simultaneously. A high-risk, high-reward shot requiring the wood to thread a narrow gap.">
      <RinkSVG matX={149}>
        <Jack cx={90} cy={72} />
        {/* two opponent woods to split */}
        <WoodBowl cx={78} cy={100} stickerColor={ORANGE} />
        <WoodBowl cx={102} cy={100} stickerColor={ORANGE} />
        {/* arrows showing displacement */}
        <line x1="76" y1="100" x2="58" y2="118" stroke={ORANGE} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.55" markerEnd="url(#arr-orange)" />
        <line x1="104" y1="100" x2="122" y2="118" stroke={ORANGE} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.55" markerEnd="url(#arr-orange)" />
        <circle cx={55} cy={120} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.35" />
        <circle cx={125} cy={120} r="9" fill={ORANGE} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" opacity="0.35" />
        {/* teal wood threading the gap from bottom-right mat */}
        <AnimWoodBowl x1={149} y1={232} cx={120} cy={166} x2={90} y2={102} stickerColor={TEAL} />
      </RinkSVG>
    </ShotCard>
  );
}

/* ── export ─────────────────────────────────────────────── */
export function ShotDiagrams() {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '2.5rem 2rem',
        marginTop: '1rem',
      }}>
        <DrawShot />
        <TrailShot />
        <RestShot />
        <WrestShot />
        <PromotionShot />
        <DriveShot />
        <BlockShot />
        <PlantShot />
        <SplitShot />
      </div>

      <div style={{
        marginTop: '2.5rem',
        padding: '1rem 1.5rem',
        background: 'rgba(45,90,61,.06)',
        border: '1px solid rgba(45,90,61,.1)',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Key</div>
        {[
          { color: BLUE, label: 'Your wood (blue)' },
          { color: RED, label: "Opponent's wood (red)" },
          { color: JACK_COL, label: 'Jack', border: GOLD },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg width="16" height="16"><circle cx="8" cy="8" r="7" fill={color} stroke={border ?? 'rgba(255,255,255,0.4)'} strokeWidth="1" /></svg>
            <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <svg width="30" height="10"><line x1="0" y1="5" x2="26" y2="5" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" /><polygon points="24,2 30,5 24,8" fill={GOLD} opacity="0.85" /></svg>
          <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontFamily: "'DM Sans',sans-serif" }}>Wood trajectory</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <svg width="30" height="10"><circle cx="8" cy="5" r="6" fill={BLUE} opacity="0.4" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" /></svg>
          <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontFamily: "'DM Sans',sans-serif" }}>Final position</span>
        </div>
      </div>
    </div>
  );
}
