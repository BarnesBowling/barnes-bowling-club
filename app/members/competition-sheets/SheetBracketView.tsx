'use client';
import type { CompetitionSheet } from '@/data/competition-sheets';

const GOLD = '#b5924a';
const LINE_W = 1.5;

export function SheetBracketView({ sheet }: { sheet: CompetitionSheet }) {
  if (!sheet.rounds) return null;

  const rounds = sheet.rounds;
  const BOX_W = 160;
  const BOX_H = 48;
  const BOX_GAP = 16;
  const ROUND_GAP = 80;
  const STUB = 40; // horizontal arm length from match box right edge to vertical column

  const firstRoundMatches = rounds[0]?.matches.length ?? 0;
  const totalH = firstRoundMatches * (BOX_H + BOX_GAP) - BOX_GAP;
  const svgW = rounds.length * (BOX_W + ROUND_GAP) - ROUND_GAP;
  const svgH = totalH + 60; // 60px for round labels

  // Returns the top-left Y of a match box. Centre = returned Y + BOX_H/2.
  function boxY(roundIndex: number, matchIndex: number, totalMatches: number) {
    const slotH = totalH / totalMatches;
    return 60 + matchIndex * slotH + slotH / 2 - BOX_H / 2;
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', width: '100%' }}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', minWidth: svgW }}
      >

        {/* ── Pass 1: round labels + match boxes ── */}
        {rounds.map((round, ri) => {
          const x = ri * (BOX_W + ROUND_GAP);
          const matchCount = round.matches.length;

          return (
            <g key={`round-${ri}`}>
              <text
                x={x + BOX_W / 2}
                y={30}
                textAnchor="middle"
                fontFamily="'DM Sans', sans-serif"
                fontSize="10"
                fontWeight="700"
                letterSpacing="2"
                fill="var(--gold, #C9A84C)"
                style={{ textTransform: 'uppercase' }}
              >
                {round.name.toUpperCase()}
              </text>

              {round.matches.map((match, mi) => {
                const y = boxY(ri, mi, matchCount);
                return (
                  <g key={`box-${ri}-${mi}`}>
                    <rect
                      x={x} y={y}
                      width={BOX_W} height={BOX_H}
                      fill="#fff"
                      stroke="none"
                      filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.10))"
                      rx="2"
                    />
                    <line
                      x1={x + 8} y1={y + BOX_H / 2}
                      x2={x + BOX_W - 8} y2={y + BOX_H / 2}
                      stroke="rgba(201,168,76,0.3)" strokeWidth="0.75"
                    />
                    <text
                      x={x + 10} y={y + BOX_H / 2 - 6}
                      fontFamily="'Libre Baskerville', serif"
                      fontSize="11"
                      fill={match.winner === 'player1' ? 'var(--gold, #C9A84C)' : 'var(--green-deep, #2D5A3D)'}
                      fontWeight={match.winner === 'player1' ? '700' : '400'}
                    >
                      {match.player1 || '—'}
                    </text>
                    <text
                      x={x + 10} y={y + BOX_H / 2 + 16}
                      fontFamily="'Libre Baskerville', serif"
                      fontSize="11"
                      fill={match.winner === 'player2' ? 'var(--gold, #C9A84C)' : 'var(--green-deep, #2D5A3D)'}
                      fontWeight={match.winner === 'player2' ? '700' : '400'}
                    >
                      {match.player2 || '—'}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* ── Pass 2: connector brackets between rounds ── */}
        {rounds.slice(0, -1).map((round, ri) => {
          const x = ri * (BOX_W + ROUND_GAP);
          const matchCount = round.matches.length;
          const rightX = x + BOX_W;       // right edge of boxes in this round
          const vertX = rightX + STUB;    // x-position of the vertical connector column
          const nextX = (ri + 1) * (BOX_W + ROUND_GAP); // left edge of next round boxes

          // Process matches in pairs: [0,1], [2,3], ...
          return (
            <g key={`connectors-${ri}`}>
              {Array.from({ length: Math.ceil(matchCount / 2) }, (_, pairIdx) => {
                const topMi = pairIdx * 2;
                const botMi = topMi + 1;
                if (botMi >= matchCount) return null;

                const topMidY = boxY(ri, topMi, matchCount) + BOX_H / 2;
                const botMidY = boxY(ri, botMi, matchCount) + BOX_H / 2;
                // Junction is the geometric midpoint — equals the next round match's centre
                // for any standard power-of-2 bracket.
                const junctionY = (topMidY + botMidY) / 2;

                return (
                  <g key={`pair-${ri}-${pairIdx}`}>
                    {/* Horizontal stub: top match → vertical column */}
                    <line x1={rightX} y1={topMidY} x2={vertX} y2={topMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                    {/* Horizontal stub: bottom match → vertical column */}
                    <line x1={rightX} y1={botMidY} x2={vertX} y2={botMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                    {/* Vertical connector joining the two stubs */}
                    <line x1={vertX} y1={topMidY} x2={vertX} y2={botMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                    {/* Output horizontal from midpoint of vertical to next round box */}
                    <line x1={vertX} y1={junctionY} x2={nextX} y2={junctionY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                  </g>
                );
              })}
            </g>
          );
        })}

      </svg>
    </div>
  );
}
