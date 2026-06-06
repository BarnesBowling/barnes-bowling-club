'use client';
import type { CompetitionSheet, MatchResult } from '@/data/competition-sheets';

const GOLD = '#b5924a';
const LINE_W = 1.5;

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

interface Props {
  sheet: CompetitionSheet;
  results: MatchResult[];
}

export function SheetBracketView({ sheet, results }: Props) {
  if (!sheet.rounds) return null;

  const rounds = sheet.rounds;
  const BOX_W = sheet.competition === 'pairs' ? 200 : 160;
  const BOX_H = 48;
  const BOX_GAP = 16;
  const ROUND_GAP = 80;
  const STUB = 40;

  const maxRoundMatches = Math.max(...rounds.map(r => r.matches.length));
  const totalH = maxRoundMatches * (BOX_H + BOX_GAP) - BOX_GAP;
  const svgW = rounds.length * (BOX_W + ROUND_GAP) - ROUND_GAP;
  const svgH = totalH + 60;

  function slotY(matchIndex: number, totalMatches: number): number {
    const slotH = totalH / totalMatches;
    return 60 + matchIndex * slotH + slotH / 2 - BOX_H / 2;
  }

  function boxY(roundIndex: number, matchIndex: number): number {
    const nextRound = rounds[roundIndex + 1];
    if (nextRound) {
      const target = nextRound.matches.findIndex(m => m.fromPrevRound === matchIndex);
      if (target !== -1) return slotY(target, nextRound.matches.length);
    }
    return slotY(matchIndex, rounds[roundIndex].matches.length);
  }

  function findResult(player1: string, player2: string): MatchResult | null {
    if (!player1 || !player2 || player1 === 'Bye' || player2 === 'Bye') return null;
    const np1 = norm(player1);
    const np2 = norm(player2);
    return results.find(r => {
      const na = norm(r.side_a);
      const nb = norm(r.side_b);
      const aMatchesP1 = na.includes(np1) || np1.includes(na);
      const bMatchesP2 = nb.includes(np2) || np2.includes(nb);
      const aMatchesP2 = na.includes(np2) || np2.includes(na);
      const bMatchesP1 = nb.includes(np1) || np1.includes(nb);
      return (aMatchesP1 && bMatchesP2) || (aMatchesP2 && bMatchesP1);
    }) ?? null;
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', width: '100%' }}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', minWidth: svgW }}
      >
        <defs>
          {rounds.map((round, ri) =>
            round.matches.map((_, mi) => (
              <clipPath key={`clip-${ri}-${mi}`} id={`clip-${ri}-${mi}`}>
                <rect
                  x={ri * (BOX_W + ROUND_GAP) + 8}
                  y={boxY(ri, mi)}
                  width={BOX_W - 44}
                  height={BOX_H}
                />
              </clipPath>
            ))
          )}
        </defs>

        {/* ── Pass 1: round labels + match boxes ── */}
        {rounds.map((round, ri) => {
          const x = ri * (BOX_W + ROUND_GAP);

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
                const y = boxY(ri, mi);
                const result = findResult(match.player1, match.player2);

                let p1Score: number | null = null;
                let p2Score: number | null = null;
                let p1Won = match.winner === 'player1';
                let p2Won = match.winner === 'player2';

                if (result) {
                  const na = norm(result.side_a);
                  const np1 = norm(match.player1);
                  const isP1SideA = na.includes(np1) || np1.includes(na);
                  p1Score = isP1SideA ? result.side_a_score : result.side_b_score;
                  p2Score = isP1SideA ? result.side_b_score : result.side_a_score;
                  p1Won = result.winner_side === (isP1SideA ? 'a' : 'b');
                  p2Won = result.winner_side === (isP1SideA ? 'b' : 'a');
                }

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
                      fill={p1Won ? GOLD : 'var(--green-deep, #2D5A3D)'}
                      fontWeight={p1Won ? '700' : '400'}
                      clipPath={`url(#clip-${ri}-${mi})`}
                    >
                      {match.player1 || '—'}
                    </text>
                    <text
                      x={x + 10} y={y + BOX_H / 2 + 16}
                      fontFamily="'Libre Baskerville', serif"
                      fontSize="11"
                      fill={p2Won ? GOLD : 'var(--green-deep, #2D5A3D)'}
                      fontWeight={p2Won ? '700' : '400'}
                      clipPath={`url(#clip-${ri}-${mi})`}
                    >
                      {match.player2 || '—'}
                    </text>
                    {p1Score !== null && (
                      <text
                        x={x + BOX_W - 10} y={y + BOX_H / 2 - 6}
                        textAnchor="end"
                        fontFamily="'DM Sans', sans-serif"
                        fontSize="10"
                        fontWeight={p1Won ? '700' : '400'}
                        fill={p1Won ? GOLD : 'var(--green-deep, #2D5A3D)'}
                      >
                        {p1Score}
                      </text>
                    )}
                    {p2Score !== null && (
                      <text
                        x={x + BOX_W - 10} y={y + BOX_H / 2 + 16}
                        textAnchor="end"
                        fontFamily="'DM Sans', sans-serif"
                        fontSize="10"
                        fontWeight={p2Won ? '700' : '400'}
                        fill={p2Won ? GOLD : 'var(--green-deep, #2D5A3D)'}
                      >
                        {p2Score}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* ── Pass 2: connector brackets between rounds ── */}
        {rounds.slice(0, -1).map((round, ri) => {
          const x = ri * (BOX_W + ROUND_GAP);
          const rightX = x + BOX_W;
          const vertX = rightX + STUB;
          const nextX = (ri + 1) * (BOX_W + ROUND_GAP);
          const nextRound = rounds[ri + 1];
          const nextMatchCount = nextRound.matches.length;

          const explicitTargets = nextRound.matches.reduce<{ mi: number; from: number }[]>(
            (acc, m, mi) => {
              if (m.fromPrevRound !== undefined) acc.push({ mi, from: m.fromPrevRound });
              return acc;
            },
            [],
          );

          if (explicitTargets.length > 0) {
            return (
              <g key={`connectors-${ri}`}>
                {explicitTargets.map(({ mi }) => {
                  const y = slotY(mi, nextMatchCount) + BOX_H / 2;
                  return (
                    <line
                      key={`conn-${ri}-${mi}`}
                      x1={rightX} y1={y} x2={nextX} y2={y}
                      stroke={GOLD} strokeWidth={LINE_W}
                    />
                  );
                })}
              </g>
            );
          }

          const matchCount = round.matches.length;
          return (
            <g key={`connectors-${ri}`}>
              {Array.from({ length: Math.ceil(matchCount / 2) }, (_, pairIdx) => {
                const topMi = pairIdx * 2;
                const botMi = topMi + 1;
                if (botMi >= matchCount) return null;

                const topMidY = boxY(ri, topMi) + BOX_H / 2;
                const botMidY = boxY(ri, botMi) + BOX_H / 2;
                const junctionY = (topMidY + botMidY) / 2;

                return (
                  <g key={`pair-${ri}-${pairIdx}`}>
                    <line x1={rightX} y1={topMidY} x2={vertX} y2={topMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                    <line x1={rightX} y1={botMidY} x2={vertX} y2={botMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
                    <line x1={vertX} y1={topMidY} x2={vertX} y2={botMidY}
                      stroke={GOLD} strokeWidth={LINE_W} />
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
