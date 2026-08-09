'use client';
import type { CompetitionSheet, MatchResult, BracketRound } from '@/data/competition-sheets';

const GOLD = '#b5924a';
const LINE_W = 1.5;

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildProgressedRounds(
  originalRounds: BracketRound[],
  results: MatchResult[],
): BracketRound[] {
  // Deep-clone so we never mutate the imported data array
  const rounds: BracketRound[] = originalRounds.map(r => ({
    ...r,
    matches: r.matches.map(m => ({ ...m })),
  }));

  function resolveResult(p1: string, p2: string): MatchResult | null {
    if (!p1 || !p2 || p1 === 'Bye' || p2 === 'Bye') return null;
    const np1 = norm(p1);
    const np2 = norm(p2);
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

  for (let ri = 0; ri < rounds.length - 1; ri++) {
    const curr = rounds[ri];
    const next = rounds[ri + 1];

    for (let mi = 0; mi < curr.matches.length; mi++) {
      const match = curr.matches[mi];
      let winner = '';

      if (match.player2 === 'Bye' && match.player1) {
        // Bye: player1 auto-progresses
        winner = match.player1;
      } else if (match.player1 && match.player2) {
        // Prefer live DB result, fall back to static winner field
        const result = resolveResult(match.player1, match.player2);
        if (result?.winner_side) {
          const na = norm(result.side_a);
          const np1 = norm(match.player1);
          const isP1SideA = na.includes(np1) || np1.includes(na);
          winner = result.winner_side === (isP1SideA ? 'a' : 'b') ? match.player1 : match.player2;
        } else if (match.winner === 'player1') {
          winner = match.player1;
        } else if (match.winner === 'player2') {
          winner = match.player2;
        }
      }

      if (!winner) continue;

      // Determine which slot in the next round receives this winner
      const explicitIdx = next.matches.findIndex(m => m.fromPrevRound === mi);

      if (explicitIdx !== -1) {
        // Explicit fromPrevRound link: winner fills player1 of that slot
        const origSlot = originalRounds[ri + 1].matches[explicitIdx];
        if (!origSlot.player1) {
          next.matches[explicitIdx] = { ...next.matches[explicitIdx], player1: winner };
        }
      } else {
        // Standard bracket pairing: match mi → next-round match floor(mi/2)
        const nextMatchIdx = Math.floor(mi / 2);
        const slot = mi % 2 === 0 ? 'player1' : 'player2';
        if (nextMatchIdx < next.matches.length) {
          const origSlot = originalRounds[ri + 1].matches[nextMatchIdx];
          if (!origSlot[slot]) {
            next.matches[nextMatchIdx] = { ...next.matches[nextMatchIdx], [slot]: winner };
          }
        }
      }
    }
  }

  return rounds;
}

interface Props {
  sheet: CompetitionSheet;
  results: MatchResult[];
}

export function SheetBracketView({ sheet, results }: Props) {
  if (!sheet.rounds) return null;

  const BOX_W = sheet.competition === 'pairs' ? 200 : 160;
  const BOX_H = 48;
  const BOX_GAP = 16;
  const ROUND_GAP = 80;
  const STUB = 40;

  const rounds = buildProgressedRounds(sheet.rounds, results);

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
      // Bottom-align when current round has fewer matches than next (bye-entry: Pairs R1→R2).
      // Offset so R1[0]↔R2[4], R1[1]↔R2[5], etc.
      const currCount = rounds[roundIndex].matches.length;
      const nextCount = nextRound.matches.length;
      if (currCount < nextCount) {
        return slotY(nextCount - currCount + matchIndex, nextCount);
      }
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

                const isBye = match.player2 === 'Bye';
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
                    {!isBye && (
                      <line
                        x1={x + 8} y1={y + BOX_H / 2}
                        x2={x + BOX_W - 8} y2={y + BOX_H / 2}
                        stroke="rgba(201,168,76,0.3)" strokeWidth="0.75"
                      />
                    )}
                    <text
                      x={x + 10} y={isBye ? y + BOX_H / 2 + 5 : y + BOX_H / 2 - 6}
                      fontFamily="'Libre Baskerville', serif"
                      fontSize="11"
                      fill={p1Won ? GOLD : 'var(--green-deep, #2D5A3D)'}
                      fontWeight={p1Won ? '700' : '400'}
                      clipPath={`url(#clip-${ri}-${mi})`}
                    >
                      {match.player1 || '—'}
                    </text>
                    {isBye ? (
                      <text
                        x={x + BOX_W - 10} y={y + BOX_H / 2 + 5}
                        textAnchor="end"
                        fontFamily="'DM Sans', sans-serif"
                        fontSize="9"
                        fontWeight="700"
                        fill="var(--text-muted, #aaa)"
                        letterSpacing="1"
                      >
                        BYE
                      </text>
                    ) : (
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
                    )}
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

          // Bye-entry structure: R1 has fewer matches than R2 (some pairs sit out R1).
          // Draw direct lines from each R1 winner's box half to the correct R2 box half,
          // found by matching the winner's name against R2 player slots.
          if (matchCount < nextMatchCount) {
            const winnerLines = round.matches.reduce<{ fromY: number; toY: number }[]>(
              (acc, m, mi) => {
                const winnerName =
                  m.winner === 'player1' ? m.player1 :
                  m.winner === 'player2' ? m.player2 : null;
                if (!winnerName) return acc;
                const nw = norm(winnerName);
                for (let r2mi = 0; r2mi < nextRound.matches.length; r2mi++) {
                  const r2m = nextRound.matches[r2mi];
                  const np1 = norm(r2m.player1);
                  const np2 = norm(r2m.player2);
                  const inP1 = !!np1 && (np1.includes(nw) || nw.includes(np1));
                  const inP2 = !!np2 && np2 !== 'bye' && (np2.includes(nw) || nw.includes(np2));
                  if (inP1 || inP2) {
                    const fromY =
                      m.winner === 'player1' ? boxY(ri, mi) + BOX_H / 4 :
                      m.winner === 'player2' ? boxY(ri, mi) + 3 * BOX_H / 4 :
                      boxY(ri, mi) + BOX_H / 2;
                    const toY = slotY(r2mi, nextMatchCount) + (inP1 ? BOX_H / 4 : 3 * BOX_H / 4);
                    acc.push({ fromY, toY });
                    break;
                  }
                }
                return acc;
              },
              [],
            );
            if (winnerLines.length > 0) {
              return (
                <g key={`connectors-${ri}`}>
                  {winnerLines.map(({ fromY, toY }, idx) => (
                    <line
                      key={`conn-winner-${ri}-${idx}`}
                      x1={rightX} y1={fromY} x2={nextX} y2={toY}
                      stroke={GOLD} strokeWidth={LINE_W}
                    />
                  ))}
                </g>
              );
            }
          }

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
