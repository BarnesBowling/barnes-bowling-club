'use client';
import type { CompetitionSheet } from '@/data/competition-sheets';

export function SheetBracketView({ sheet }: { sheet: CompetitionSheet }) {
  if (!sheet.rounds) return null;

  const rounds = sheet.rounds;
  const BOX_W = 160;
  const BOX_H = 48;
  const BOX_GAP = 16;
  const ROUND_GAP = 80;

  // Calculate total height needed for first round
  const firstRoundMatches = rounds[0]?.matches.length ?? 0;
  const totalH = firstRoundMatches * (BOX_H + BOX_GAP) - BOX_GAP;
  const svgW = rounds.length * (BOX_W + ROUND_GAP) - ROUND_GAP;
  const svgH = totalH + 60; // 60px for round labels

  function getMatchY(roundIndex: number, matchIndex: number, totalMatches: number) {
    const scale = Math.pow(2, roundIndex);
    const slotH = totalH / (totalMatches);
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
        {rounds.map((round, ri) => {
          const x = ri * (BOX_W + ROUND_GAP);
          const matchCount = round.matches.length;

          return (
            <g key={round.name}>
              {/* Round label */}
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
                const y = getMatchY(ri, mi, matchCount);
                const midY = y + BOX_H / 2;

                // Draw connecting line to next round
                if (ri < rounds.length - 1) {
                  const nextMatchCount = rounds[ri + 1].matches.length;
                  const nextMi = Math.floor(mi / 2);
                  const nextY = getMatchY(ri + 1, nextMi, nextMatchCount);
                  const nextMidY = nextY + BOX_H / 2;
                  const rightX = x + BOX_W;
                  const nextX = (ri + 1) * (BOX_W + ROUND_GAP);
                  const midX = rightX + ROUND_GAP / 2;

                  return (
                    <g key={mi}>
                      {/* Match box */}
                      <rect
                        x={x} y={y}
                        width={BOX_W} height={BOX_H}
                        fill="#fff"
                        stroke="none"
                        filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.10))"
                        rx="2"
                      />
                      {/* Divider line between players */}
                      <line
                        x1={x + 8} y1={y + BOX_H / 2}
                        x2={x + BOX_W - 8} y2={y + BOX_H / 2}
                        stroke="rgba(201,168,76,0.3)" strokeWidth="0.75"
                      />
                      {/* Player 1 */}
                      <text
                        x={x + 10} y={y + BOX_H / 2 - 6}
                        fontFamily="'Libre Baskerville', serif"
                        fontSize="11"
                        fill={match.winner === 'player1' ? 'var(--gold, #C9A84C)' : 'var(--green-deep, #2D5A3D)'}
                        fontWeight={match.winner === 'player1' ? '700' : '400'}
                      >
                        {match.player1 || '—'}
                      </text>
                      {/* Player 2 */}
                      <text
                        x={x + 10} y={y + BOX_H / 2 + 16}
                        fontFamily="'Libre Baskerville', serif"
                        fontSize="11"
                        fill={match.winner === 'player2' ? 'var(--gold, #C9A84C)' : 'var(--green-deep, #2D5A3D)'}
                        fontWeight={match.winner === 'player2' ? '700' : '400'}
                      >
                        {match.player2 || '—'}
                      </text>

                      {/* Connector lines — gold */}
                      {/* Horizontal line from right of box to midpoint */}
                      <line
                        x1={rightX} y1={midY}
                        x2={midX} y2={midY}
                        stroke="var(--gold, #C9A84C)" strokeWidth="1.5"
                      />
                      {/* Vertical line connecting pairs at midpoint */}
                      {mi % 2 === 0 && (
                        <line
                          x1={midX} y1={midY}
                          x2={midX} y2={nextMidY}
                          stroke="var(--gold, #C9A84C)" strokeWidth="1.5"
                        />
                      )}
                      {/* Horizontal line from midpoint to next round box */}
                      {mi % 2 === 1 && (
                        <line
                          x1={midX} y1={nextMidY}
                          x2={nextX} y2={nextMidY}
                          stroke="var(--gold, #C9A84C)" strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                }

                // Final round — no connector
                return (
                  <g key={mi}>
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
      </svg>
    </div>
  );
}
