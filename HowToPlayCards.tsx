'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { BowlPositionDiagrams } from './BowlPositionDiagrams';
import { ShotDiagrams } from './ShotDiagrams';
import { GreenDiagrams } from './GreenDiagrams';
import { GameTypeDiagrams } from './GameTypeDiagrams';
import { Scoreboard } from './icons/Scoreboard';

type Section = { id: string; title: string; body: string; sort_order: number };

/* ── colour palette ─────────────────────────────────────── */
const G = '#2d5a3d';
const GL = '#3d7a52';
const GOLD = '#c9a84c';
const CREAM = '#f5f0e8';
const BLUE = '#2980b9';
const RED = '#c0392b';
const DITCH = '#1a3a2a';

/* ── SVG thumbnails ─────────────────────────────────────── */
function ThumbEquipment() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <defs>
        {/* Radial gradient: lighter top-left highlight, dark rim — simulates lignum vitae depth */}
        <radialGradient id="eq-bowl" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
      </defs>

      {/* Dark green background */}
      <rect width="180" height="280" fill={G} />

      {/* ── Bowl 1 (top) ── */}
      <circle cx="90" cy="80" r="52" fill="url(#eq-bowl)" />
      {/* Concentric grain rings */}
      <circle cx="90" cy="80" r="45" fill="none" stroke="#5c3820" strokeWidth="1.4" opacity="0.65" />
      <circle cx="90" cy="80" r="37" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="90" cy="80" r="29" fill="none" stroke="#5c3820" strokeWidth="0.9" opacity="0.45" />
      <circle cx="90" cy="80" r="21" fill="none" stroke="#5c3820" strokeWidth="0.7" opacity="0.4"  />
      {/* Orange stamp */}
      <circle cx="90" cy="80" r="14" fill="#e85c2e" />
      <circle cx="90" cy="80" r="14" fill="none" stroke="#c44520" strokeWidth="0.8" opacity="0.6" />
      <text x="90" y="84" fontSize="8.5" textAnchor="middle" fill="white"
            fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.5">2025</text>

      {/* ── Bowl 2 (bottom) ── */}
      <circle cx="90" cy="198" r="52" fill="url(#eq-bowl)" />
      {/* Concentric grain rings */}
      <circle cx="90" cy="198" r="45" fill="none" stroke="#5c3820" strokeWidth="1.4" opacity="0.65" />
      <circle cx="90" cy="198" r="37" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="90" cy="198" r="29" fill="none" stroke="#5c3820" strokeWidth="0.9" opacity="0.45" />
      <circle cx="90" cy="198" r="21" fill="none" stroke="#5c3820" strokeWidth="0.7" opacity="0.4"  />
      {/* Orange stamp */}
      <circle cx="90" cy="198" r="14" fill="#e85c2e" />
      <circle cx="90" cy="198" r="14" fill="none" stroke="#c44520" strokeWidth="0.8" opacity="0.6" />
      <text x="90" y="202" fontSize="8.5" textAnchor="middle" fill="white"
            fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.5">2025</text>
    </svg>
  );
}

function ThumbGreen() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill="#6b5a3e" />
      <rect x="12" y="16" width="156" height="248" fill={DITCH} rx="2" />
      <rect x="22" y="26" width="136" height="228" fill={G} />
      <rect x="22" y="26" width="136" height="228" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.2" />
      {/* White dashed X — diagonal corner to corner */}
      <line x1="22" y1="26" x2="158" y2="254" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.45" />
      <line x1="158" y1="26" x2="22" y2="254" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.45" />
      {/* White markers: short edges at 35/50/65%, long edges at 1/3 and 2/3 */}
      <rect x="65"  y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="85"  y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="105" y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="65"  y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="85"  y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="105" y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="20"  y="98"  width="4"  height="8" fill="white" rx="1" />
      <rect x="20"  y="174" width="4"  height="8" fill="white" rx="1" />
      <rect x="156" y="98"  width="4"  height="8" fill="white" rx="1" />
      <rect x="156" y="174" width="4"  height="8" fill="white" rx="1" />
      {[
        { x: 24,  y: 28  },
        { x: 138, y: 28  },
        { x: 24,  y: 245 },
        { x: 138, y: 245 },
      ].map(({ x, y }, i) => (
        <g key={i}>
          <rect x={x} y={y} width="18" height="7" fill="rgba(201,168,76,.3)" stroke={GOLD} strokeWidth="0.8" rx="1" />
          <text x={x + 9} y={y + 5.2} fontSize="4" fill={GOLD} textAnchor="middle" fontFamily="DM Sans,sans-serif">MAT</text>
        </g>
      ))}
    </svg>
  );
}

function ThumbTypesOfGame() {
  const ORANGE = '#e85c2e';
  const TEAL   = '#2a9d8f';
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="tog-wood" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="180" height="280" fill={G} />
      <rect x="14" y="14" width="152" height="252" fill={GL} opacity="0.25" rx="2" />

      {/* ── SINGLES ── */}
      <text x="90" y="40" fontSize="11" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">SINGLES</text>
      {/* Jack */}
      <circle cx="90" cy="57" r="7" fill="white" stroke={GOLD} strokeWidth="1" />
      <text x="90" y="61" fontSize="7" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>
      {/* Orange bowl (left) r=13 */}
      <circle cx="62" cy="85" r="13" fill="url(#tog-wood)" />
      <circle cx="62" cy="85" r="9.9" fill="none" stroke="#5c3820" strokeWidth="1.2" opacity="0.55" />
      <circle cx="62" cy="85" r="6.8" fill="none" stroke="#5c3820" strokeWidth="0.9" opacity="0.4" />
      <circle cx="62" cy="85" r="5.7" fill={ORANGE} />
      <text x="62" y="87" fontSize="4.5" textAnchor="middle" fill="white" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
      {/* Teal bowl (right) r=13 */}
      <circle cx="118" cy="85" r="13" fill="url(#tog-wood)" />
      <circle cx="118" cy="85" r="9.9" fill="none" stroke="#5c3820" strokeWidth="1.2" opacity="0.55" />
      <circle cx="118" cy="85" r="6.8" fill="none" stroke="#5c3820" strokeWidth="0.9" opacity="0.4" />
      <circle cx="118" cy="85" r="5.7" fill={TEAL} />
      <text x="118" y="87" fontSize="4.5" textAnchor="middle" fill="#f5dc6e" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>

      {/* Dividing line */}
      <line x1="24" y1="132" x2="156" y2="132" stroke="rgba(201,168,76,.2)" strokeWidth="1" />

      {/* ── PAIRS ── */}
      <text x="90" y="155" fontSize="11" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">PAIRS</text>
      {/* Jack */}
      <circle cx="90" cy="172" r="6" fill="white" stroke={GOLD} strokeWidth="1" />
      <text x="90" y="176" fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>
      {/* Orange team — left pair, r=12 */}
      <circle cx="48" cy="208" r="12" fill="url(#tog-wood)" />
      <circle cx="48" cy="208" r="9.1" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="48" cy="208" r="6.2" fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.4" />
      <circle cx="48" cy="208" r="5.3" fill={ORANGE} />
      <text x="48" y="210" fontSize="4.1" textAnchor="middle" fill="white" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>

      <circle cx="76" cy="208" r="12" fill="url(#tog-wood)" />
      <circle cx="76" cy="208" r="9.1" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="76" cy="208" r="6.2" fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.4" />
      <circle cx="76" cy="208" r="5.3" fill={ORANGE} />
      <text x="76" y="210" fontSize="4.1" textAnchor="middle" fill="white" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
      {/* Teal team — right pair, r=12 */}
      <circle cx="104" cy="208" r="12" fill="url(#tog-wood)" />
      <circle cx="104" cy="208" r="9.1" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="104" cy="208" r="6.2" fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.4" />
      <circle cx="104" cy="208" r="5.3" fill={TEAL} />
      <text x="104" y="210" fontSize="4.1" textAnchor="middle" fill="#f5dc6e" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>

      <circle cx="132" cy="208" r="12" fill="url(#tog-wood)" />
      <circle cx="132" cy="208" r="9.1" fill="none" stroke="#5c3820" strokeWidth="1.1" opacity="0.55" />
      <circle cx="132" cy="208" r="6.2" fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.4" />
      <circle cx="132" cy="208" r="5.3" fill={TEAL} />
      <text x="132" y="210" fontSize="4.1" textAnchor="middle" fill="#f5dc6e" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </svg>
  );
}

function ThumbHowToBowl() {
  const reactId = useId().replace(/:/g, '-');
  const pathId = `htb-path-${reactId}`;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const biasPath = 'M 45,255 C 130,235 125,75 90,42';

  // Wood graphic centered at (0,0) for use inside animateMotion
  const woodR = 14;
  const sr = woodR * 0.44;           // orange sticker radius ≈ 6.2
  const fs = Math.max(2, sr * 0.78); // sticker font size ≈ 4.8
  const wood = (
    <>
      <circle r={woodR} fill="url(#htb-wood)" />
      <circle r={woodR * 0.76} fill="none" stroke="#5c3820" strokeWidth="1.3" opacity="0.55" />
      <circle r={woodR * 0.52} fill="none" stroke="#5c3820" strokeWidth="1.0" opacity="0.4" />
      <circle r={sr} fill="#e85c2e" />
      <text y={fs * 0.38} fontSize={fs} textAnchor="middle"
            fill="#3a2418" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </>
  );

  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="th-arr" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0,5 2.5,0 5" fill={GOLD} opacity="0.9" />
        </marker>
        <radialGradient id="htb-wood" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
        {/* Motion path in defs for mpath reference */}
        <path id={pathId} d={biasPath} />
      </defs>

      {/* Green surface */}
      <rect width="180" height="280" fill={G} />
      <rect x="14" y="12" width="152" height="256" fill={GL} opacity="0.2" rx="2" />

      {/* Jack — top center */}
      <circle cx="90" cy="42" r="10" fill={CREAM} stroke={GOLD} strokeWidth="1.5" />
      <text x="90" y="47" fontSize="9" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>

      {/* Bias arc — dashed line stays visible; wood animates along it */}
      <path d={biasPath} fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="5 3" opacity="0.7" markerEnd="url(#th-arr)" />

      {/* MAT */}
      <rect x="18" y="252" width="42" height="12" fill="rgba(201,168,76,.25)" stroke={GOLD} strokeWidth="1" rx="1" />
      <text x="39" y="261" fontSize="6" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif">MAT</text>

      {/* Stick figure */}
      <circle cx="27" cy="220" r="7" fill={CREAM} opacity="0.65" />
      <line x1="27" y1="227" x2="38" y2="248" stroke={CREAM} strokeWidth="2" opacity="0.65" />
      <line x1="38" y1="248" x2="24" y2="263" stroke={CREAM} strokeWidth="2" opacity="0.65" />
      <line x1="38" y1="248" x2="54" y2="258" stroke={CREAM} strokeWidth="2" opacity="0.65" />
      <line x1="31" y1="235" x2="54" y2="248" stroke={CREAM} strokeWidth="2" opacity="0.65" />

      {/* Wood: static at mat when reduced motion, animated along bias path otherwise */}
      {reducedMotion ? (
        <g transform="translate(45,255)">{wood}</g>
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
    </svg>
  );
}

function ThumbTypesOfShot() {
  const reactId = useId().replace(/:/g, '-');
  const bhId = `ths-bh-${reactId}`;
  const fhId = `ths-fh-${reactId}`;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const ORANGE = '#e85c2e';
  const bhPath = 'M40,258 Q5,170 35,95 Q90,35 135,38';
  const fhPath = 'M155,258 Q175,170 165,95 Q155,38 135,38';

  // Orange branded wood centered at (0,0) — used inside animateMotion groups
  const woodR = 10;
  const sr = woodR * 0.44;          // sticker radius ≈ 4.4
  const fs = Math.max(2, sr * 0.78); // sticker font ≈ 3.4
  const wood = (
    <>
      <circle r={woodR} fill="url(#ths-wood)" />
      <circle r={woodR * 0.76} fill="none" stroke="#5c3820" strokeWidth="0.8" opacity="0.55" />
      <circle r={woodR * 0.52} fill="none" stroke="#5c3820" strokeWidth="0.6" opacity="0.4" />
      <circle r={sr} fill={ORANGE} />
      <text y={fs * 0.38} fontSize={fs} textAnchor="middle"
            fill="#ffffff" fontFamily="DM Sans,sans-serif" fontWeight="700">2025</text>
    </>
  );

  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <defs>
        <marker id="th-arr2" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <polygon points="0 0,4 2,0 4" fill={GOLD} opacity="0.8" />
        </marker>
        {/* Wood body gradient — dark brown, same as WoodBowl in GameTypeDiagrams */}
        <radialGradient id="ths-wood" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#5c3820" />
          <stop offset="40%"  stopColor="#3a2418" />
          <stop offset="100%" stopColor="#150a04" />
        </radialGradient>
        {/* Paths in defs for animateMotion mpath reference */}
        <path id={bhId} d={bhPath} />
        <path id={fhId} d={fhPath} />
      </defs>

      <rect width="180" height="280" fill={G} />

      {/* Trajectory lines */}
      <path d={bhPath}                          fill="none" stroke={BLUE} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" markerEnd="url(#th-arr2)" />
      <path d="M95,258 Q115,170 135,38"         fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" markerEnd="url(#th-arr2)" />
      <path d={fhPath}                          fill="none" stroke={RED}  strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" markerEnd="url(#th-arr2)" />

      {/* Woods: static at delivery end when motion is reduced, animated otherwise */}
      {reducedMotion ? (
        <>
          <g transform="translate(40,258)">{wood}</g>
          <g transform="translate(155,258)">{wood}</g>
        </>
      ) : (
        <>
          {/* Backhand wood — travels from jack (keyPoint 1) down to delivery end (keyPoint 0),
              then holds for 20% of the cycle before looping */}
          <g>
            <animateMotion keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear"
                           dur="5s" repeatCount="indefinite">
              <mpath href={`#${bhId}`} />
            </animateMotion>
            <g>
              <animateTransform attributeName="transform" type="rotate"
                                from="0" to="360" dur="2s" repeatCount="indefinite" />
              {wood}
            </g>
          </g>

          {/* Forehand wood — same timing, travels right-side path */}
          <g>
            <animateMotion keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear"
                           dur="5s" repeatCount="indefinite">
              <mpath href={`#${fhId}`} />
            </animateMotion>
            <g>
              <animateTransform attributeName="transform" type="rotate"
                                from="0" to="360" dur="2s" repeatCount="indefinite" />
              {wood}
            </g>
          </g>
        </>
      )}

      {/* Jack — rendered last so it stays on top of animated woods */}
      <circle cx="135" cy="38" r="10" fill={CREAM} stroke={GOLD} strokeWidth="1.5" />
      <text x="135" y="43" fontSize="9" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>

      {/* Labels aligned to each line's delivery-end x */}
      <text x="40"  y="274" fontSize="8" textAnchor="middle" fill={BLUE} opacity="0.8" fontFamily="DM Sans,sans-serif">Backhand</text>
      <text x="95"  y="274" fontSize="8" textAnchor="middle" fill={GOLD} opacity="0.8" fontFamily="DM Sans,sans-serif">Jack</text>
      <text x="155" y="274" fontSize="8" textAnchor="middle" fill={RED}  opacity="0.8" fontFamily="DM Sans,sans-serif">Forehand</text>
    </svg>
  );
}

function ThumbBowlPositions() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill={DITCH} />
      <rect x="14" y="14" width="152" height="252" fill={G} />
      <rect x="14" y="14" width="152" height="252" fill="none" stroke="rgba(201,168,76,.4)" strokeWidth="1.5" />
      <circle cx="90" cy="70" r="10" fill={CREAM} stroke={GOLD} strokeWidth="1.5" />
      <text x="90" y="75" fontSize="9" textAnchor="middle" fill={GOLD} fontFamily="DM Sans,sans-serif" fontWeight="700">J</text>
      <circle cx="74" cy="94" r="13" fill="#2a9d8f" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      <circle cx="107" cy="92" r="13" fill="#e85c2e" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      <circle cx="90" cy="112" r="13" fill="#2a9d8f" stroke="white" strokeWidth="2.5" strokeDasharray="3 2" />
      <text x="107" y="99" fontSize="10" fill="white" fontFamily="DM Sans,sans-serif">✓</text>
      <circle cx="9" cy="140" r="11" fill="#e85c2e" stroke="rgba(255,255,255,.2)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function ThumbRoles() {
  const roles = [
    { cx: 52, cy: 85, label: 'Lead', color: '#4a9e6a', isSkip: false },
    { cx: 128, cy: 85, label: 'Second', color: '#3d8a5c', isSkip: false },
    { cx: 52, cy: 185, label: 'Third', color: '#2d7a4e', isSkip: false },
    { cx: 128, cy: 185, label: 'Skip', color: GOLD, isSkip: true },
  ];
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill={G} />
      {roles.map(({ cx, cy, label, color, isSkip }) => (
        <g key={label}>
          <circle cx={cx} cy={cy} r={isSkip ? 24 : 20} fill={color} opacity={isSkip ? 1 : 0.75} stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
          <text x={cx} y={cy + 4} fontSize={isSkip ? 9 : 8} textAnchor="middle" fill={isSkip ? G : CREAM} fontFamily="DM Sans,sans-serif" fontWeight="700">
            {isSkip ? 'S' : label[0]}
          </text>
          <text x={cx} y={cy + (isSkip ? 24 : 20) + 14} fontSize="8" textAnchor="middle" fill={color} fontFamily="DM Sans,sans-serif" fontWeight="600" opacity="0.9">{label}</text>
        </g>
      ))}
      <text x="90" y="255" fontSize="8" textAnchor="middle" fill="rgba(245,240,232,.4)" fontFamily="DM Sans,sans-serif">delivery order →</text>
    </svg>
  );
}

function ThumbJoining() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill={G} />
      <image
        href="/images/icons/etiquette.png"
        x="43" y="90" width="94" height="102"
      />
    </svg>
  );
}

function ThumbQuartiles() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill="#6b5a3e" />
      <rect x="12" y="16" width="156" height="248" fill={DITCH} rx="2" />
      <rect x="22" y="26" width="136" height="228" fill={G} />
      <rect x="22" y="26" width="136" height="228" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1.2" />
      {/* Quartile lines at 1/3 and 2/3; vertical centre broken into top/bottom thirds only */}
      <line x1="90" y1="26"  x2="90" y2="254" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.5" />
      <line x1="22" y1="102" x2="158" y2="102" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.5" />
      <line x1="22" y1="178" x2="158" y2="178" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.5" />
      {/* Gold dashed verticals at 35% and 65% of rink width */}
      <line x1="70" y1="26" x2="70" y2="254" stroke={GOLD} strokeWidth="0.8" strokeDasharray="5 3" opacity="0.6" />
      <line x1="110" y1="26" x2="110" y2="254" stroke={GOLD} strokeWidth="0.8" strokeDasharray="5 3" opacity="0.6" />
      {/* White markers: short edges at 35/50/65%, long edges at 1/3 and 2/3 */}
      <rect x="65"  y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="85"  y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="105" y="24"  width="10" height="4" fill="white" rx="1" />
      <rect x="65"  y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="85"  y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="105" y="252" width="10" height="4" fill="white" rx="1" />
      <rect x="20"  y="98"  width="4"  height="8" fill="white" rx="1" />
      <rect x="20"  y="174" width="4"  height="8" fill="white" rx="1" />
      <rect x="156" y="98"  width="4"  height="8" fill="white" rx="1" />
      <rect x="156" y="174" width="4"  height="8" fill="white" rx="1" />
    </svg>
  );
}

function DefaultThumb() {
  return (
    <svg viewBox="0 0 180 280" style={{ width: '100%', display: 'block' }}>
      <rect width="180" height="280" fill={G} />
      <circle cx="90" cy="140" r="40" fill={GL} opacity="0.4" />
      <circle cx="90" cy="140" r="18" fill={GOLD} opacity="0.3" />
    </svg>
  );
}

const BODY_OVERRIDES: Record<string, string> = {
  'Bowl & Jack Positions': `Understanding the status of the bowls and the Jack is an important part of learning and playing the game correctly. The positions below explain the most common situations you will come across on the Green.\n\nDuring competitive play these rules are applied strictly, while in friendly games other players will usually help guide you through any unusual situations.`,
  'Scoring': `Scoring Woods are those belonging to one player or team that lie within four feet of the Jack and are closer than the opposing Woods. The maximum score per end is two points in Singles and four points in Doubles. If no woods lie within 4 feet of the jack no player scores and the end is determined a Queen. The person who last rolled the jack then rolls again.\n\nIf an opponent's Wood is the next closest to the Jack, this prevents the player or team from scoring additional points, even if more than one of their Woods lies within four feet. If there is any doubt the Woods are measured by metal ruler to determine the closest wood.\n\nCompetition Singles matches are played to 21 points, with the winner being the first player to reach 21. Other matches are usually played to 11 points, or as determined by the players at the start of the match.\n\nCompetition Pairs is played to 15 points, except for semi-finals and finals which are played to 21 points.`,
};

const BODY_EXTRA: Record<string, string> = {
  'Club Etiquette': `No Woods should be picked up until the end has been decided. Only the winning Wood and the Jack should be collected by the winner of the end. It is customary to gently kick the Woods back toward the end before they are picked up and prepared for the next end.`,
};

const SLUGS: Record<string, string> = {
  'Equipment & Clothing': 'equipment',
  'The Green': 'green',
  'The Quartiles': 'quartiles',
  'Types of Game': 'types-of-game',
  'How to Bowl': 'how-to-bowl',
  'Types of Shot': 'types-of-shot',
  'Bowl & Jack Positions': 'bowl-jack',
  'Scoring': 'scoring',
  'Club Etiquette': 'etiquette',
};

const THUMBNAILS: Record<string, () => React.ReactElement> = {
  'Equipment & Clothing': ThumbEquipment,
  'The Green': ThumbGreen,
  'The Quartiles': ThumbQuartiles,
  'Types of Game': ThumbTypesOfGame,
  'How to Bowl': ThumbHowToBowl,
  'Types of Shot': ThumbTypesOfShot,
  'Bowl & Jack Positions': ThumbBowlPositions,
  'Scoring': () => <Scoreboard />,
  'Club Etiquette': ThumbJoining,
};

/* ── card component ─────────────────────────────────────── */
export function HowToPlayCards({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
    }}>
      {sections.map((s) => {
        const Thumb = THUMBNAILS[s.title] ?? DefaultThumb;
        const isOpen = open === s.id;
        const bodyText = BODY_OVERRIDES[s.title] ?? s.body;
        const preview = bodyText.length > 110 ? bodyText.slice(0, 110).trimEnd() + '…' : bodyText;

        const hasDiagrams = s.title === 'Bowl & Jack Positions';
        const hasShots    = s.title === 'Types of Shot';
        const hasGreen    = s.title === 'The Green';
        const hasGame     = s.title === 'Types of Game';
        const hasExtra    = hasDiagrams || hasShots || hasGreen || hasGame;

        return (
          <div
            key={s.id}
            id={SLUGS[s.title]}
            className="htp-card"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {s.title === 'Scoring' && <span id="scoring" />}
            {/* Thumbnail */}
            <div style={{ lineHeight: 0, background: G }}>
              <Thumb />
            </div>

            {/* Text area */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.75rem' }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}>
                  {String(s.sort_order).padStart(2, '0')}
                </span>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '19px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  {s.title}
                </h2>
                {hasExtra && !isOpen && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    border: '1px solid rgba(201,168,76,.35)',
                    padding: '2px 6px',
                    whiteSpace: 'nowrap',
                  }}>
                    Diagrams
                  </span>
                )}
              </div>

              {/* Collapsed view */}
              {!isOpen && (
                <>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '13px',
                    lineHeight: 1.75,
                    color: 'var(--text-mid)',
                    margin: 0,
                    flex: 1,
                  }}>
                    {preview}
                  </p>
                  <button
                    onClick={() => setOpen(s.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: 'var(--green-mid)',
                      textAlign: 'left',
                    }}
                  >
                    Find out more →
                  </button>
                </>
              )}

              {/* Expanded view */}
              {isOpen && (
                <>
                  {(BODY_OVERRIDES[s.title] ?? s.body).split('\n\n').map((para, i) => (
                    <p key={i} style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: '14px',
                      lineHeight: 1.9,
                      color: 'var(--text-mid)',
                      margin: 0,
                    }}>
                      {para}
                    </p>
                  ))}

                  {BODY_EXTRA[s.title] && (
                    <p style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: '14px',
                      lineHeight: 1.9,
                      color: 'var(--text-mid)',
                      margin: 0,
                    }}>
                      {BODY_EXTRA[s.title]}
                    </p>
                  )}

                  {hasDiagrams && <div style={{ marginTop: '.5rem' }}><BowlPositionDiagrams /></div>}
                  {hasShots    && <div style={{ marginTop: '.5rem' }}><ShotDiagrams /></div>}
                  {hasGreen    && <div style={{ marginTop: '.5rem' }}><GreenDiagrams /></div>}
                  {hasGame     && <div style={{ marginTop: '.5rem' }}><GameTypeDiagrams /></div>}

                  <button
                    onClick={() => setOpen(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      textAlign: 'left',
                      marginTop: '.25rem',
                    }}
                  >
                    ↑ Close
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
