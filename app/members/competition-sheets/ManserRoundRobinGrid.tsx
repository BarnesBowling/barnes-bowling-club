'use client';

import { useState } from 'react';
import type { MatchResult } from '@/data/competition-sheets';

const CELL = 30;
const NAME_W = 148;
const NUM_W  = 26;
const HEADER_H = 160;

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildLiveScores(players: string[], results: MatchResult[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of results) {
    const na = norm(r.side_a);
    const nb = norm(r.side_b);
    const ri = players.findIndex(p => { const np = norm(p); return na.includes(np) || np.includes(na); });
    const ci = players.findIndex(p => { const np = norm(p); return nb.includes(np) || np.includes(nb); });
    if (ri !== -1 && ci !== -1 && ri !== ci) {
      out[`${ri}:${ci}`] = String(r.side_a_score);
      out[`${ci}:${ri}`] = String(r.side_b_score);
    }
  }
  return out;
}

interface Props {
  players: string[];
  rules?: string;
  results: MatchResult[];
}

export function ManserRoundRobinGrid({ players, rules, results }: Props) {
  const [scores, setScores] = useState<Record<string, string>>(() => buildLiveScores(players, results));
  const n = players.length;

  function cellKey(r: number, c: number) { return `${r}:${c}`; }

  return (
    <div style={{ width: '100%', overflowX: 'auto', overflowY: 'visible' }}>

      {rules && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '.04em',
          }}>
            {rules}
          </span>
        </div>
      )}

      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: NUM_W + NAME_W + n * CELL }}>
        <thead>
          <tr style={{ height: HEADER_H }}>
            <th style={{ width: NUM_W, minWidth: NUM_W }} />
            <th style={{ width: NAME_W, minWidth: NAME_W }} />
            {players.map((name, ci) => (
              <th
                key={ci}
                style={{
                  width: CELL,
                  minWidth: CELL,
                  height: HEADER_H,
                  padding: '4px 2px',
                  verticalAlign: 'bottom',
                  textAlign: 'center',
                  border: '1px solid rgba(45,90,61,.12)',
                  borderBottom: 'none',
                  overflow: 'visible',
                }}
              >
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  whiteSpace: 'nowrap',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--green-deep, #2D5A3D)',
                  lineHeight: 1,
                  display: 'inline-block',
                }}>
                  <span style={{
                    fontWeight: 400,
                    color: 'rgba(45,90,61,.45)',
                  }}>{ci + 1}. </span>
                  {name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, ri) => (
            <tr key={ri} style={{ height: CELL }}>
              <td style={{
                width: NUM_W,
                textAlign: 'right',
                paddingRight: '5px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: 'rgba(45,90,61,.45)',
                whiteSpace: 'nowrap',
                border: 'none',
              }}>
                {ri + 1}
              </td>
              <td style={{
                width: NAME_W,
                paddingRight: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-dark, #272727)',
                whiteSpace: 'nowrap',
                border: 'none',
                borderRight: '1px solid rgba(45,90,61,.12)',
              }}>
                {player}
              </td>
              {players.map((_, ci) => {
                const diagonal = ri === ci;
                return (
                  <td
                    key={ci}
                    style={{
                      width: CELL,
                      height: CELL,
                      padding: 0,
                      textAlign: 'center',
                      border: '1px solid rgba(45,90,61,.12)',
                      background: diagonal ? 'var(--green-deep, #2D5A3D)' : '#fff',
                    }}
                  >
                    {!diagonal && (
                      <input
                        type="text"
                        value={scores[cellKey(ri, ci)] ?? ''}
                        onChange={e => setScores(s => ({ ...s, [cellKey(ri, ci)]: e.target.value }))}
                        maxLength={5}
                        aria-label={`${players[ri]} vs ${players[ci]}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          textAlign: 'center',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '11px',
                          color: 'var(--text-dark, #272727)',
                          padding: 0,
                          cursor: 'text',
                          boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
