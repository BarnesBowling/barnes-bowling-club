'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SECTIONS, GROUND_RULES_DOC, type Block, type RuleSection } from './constitutionData';
import { DownloadConstitutionButton } from './DownloadConstitutionButton';

const paraStyle: React.CSSProperties = {
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  lineHeight: 2,
  color: 'var(--text-mid)',
  margin: '0 0 0.75rem 0',
};

function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === 'para') {
          return <p key={i} style={paraStyle}>{b.text}</p>;
        }
        if (b.kind === 'bullets') {
          return (
            <ul key={i} style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', listStyle: 'disc' }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ ...paraStyle, margin: '0 0 0.25rem 0' }}>{item}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'sub') {
          if (b.title) {
            return (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    color: 'var(--gold)',
                    flexShrink: 0,
                  }}>{b.num}</span>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'var(--green-deep)',
                  }}>{b.title}</span>
                </div>
                <div style={{ paddingLeft: '2.5rem' }}>
                  <RenderBlocks blocks={b.blocks} />
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr', gap: '0 0.5rem', marginBottom: '0.6rem' }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.06em',
                color: 'var(--text-muted)',
                paddingTop: '5px',
                textAlign: 'right',
              }}>{b.num}</span>
              <div><RenderBlocks blocks={b.blocks} /></div>
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

function RenderRuleDoc({ sections }: { sections: RuleSection[] }) {
  return (
    <div>
      {sections.map((section, si) => (
        <div key={section.heading} style={{ marginBottom: si < sections.length - 1 ? '2rem' : 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--green-deep)',
            letterSpacing: '.02em',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(45,90,61,.1)',
          }}>
            {section.heading}
          </div>
          {section.items.map(item => (
            <div key={item.num} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr', gap: '0 0.5rem', marginBottom: '0.6rem' }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.06em',
                color: 'var(--text-muted)',
                paddingTop: '5px',
                textAlign: 'right',
              }}>{item.num}.</span>
              <div><RenderBlocks blocks={item.blocks} /></div>
            </div>
          ))}
        </div>
      ))}
      <p style={{
        fontFamily: "'Libre Baskerville', serif",
        fontSize: '13px',
        lineHeight: 1.8,
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        margin: '1.5rem 0 0',
      }}>
        Amended at AGM November 27th 2025
      </p>
    </div>
  );
}

export default function ConstitutionPage() {
  const [groundRulesOpen, setGroundRulesOpen] = useState(false);

  return (
    <>
      <style>{`
        @media print {
          nav, footer, .no-print { display: none !important; }
          .print-header {
            background: white !important;
            border-bottom: 2px solid #2D5A3D;
            padding-bottom: 1rem !important;
          }
          .print-header h1, .print-header p, .print-header a, .print-header em {
            color: #2D5A3D !important;
          }
          .print-header .section-tag { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
      <Navbar />
      <main>
        {/* Header */}
        <div className="print-header" style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Club Constitution — <em style={{ color: 'var(--gold-light)' }}>November 2025</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              The governing constitution of Barnes Bowling Club, adopted by resolution of members at the AGM held on 27th November 2025.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '760px' }}>

          {SECTIONS.map((s) => (
            <div key={s.num} style={{ marginBottom: '2.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', marginBottom: '0.75rem' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}>
                  {String(s.num).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: 0,
                }}>
                  {s.title}
                </h2>
              </div>
              <div style={{ marginLeft: '3rem' }}>
                <RenderBlocks blocks={s.blocks} />
              </div>
            </div>
          ))}

          {/* Date of adoption */}
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem 2rem',
            background: 'rgba(45,90,61,.04)',
            borderLeft: '3px solid rgba(45,90,61,.2)',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '6px',
            }}>
              Date of Adoption
            </div>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '13px',
              lineHeight: 1.8,
              color: 'var(--text-mid)',
              margin: 0,
            }}>
              Revised following AGM – 27 November 2025.
            </p>
          </div>

          {/* Download PDF */}
          <div className="no-print" style={{ marginTop: '1.5rem' }}>
            <DownloadConstitutionButton />
          </div>

          {/* Ground Rules accordion */}
          <div style={{ marginTop: '2.75rem' }}>
            <button
              onClick={() => setGroundRulesOpen(o => !o)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1.25rem',
                background: 'none',
                border: 'none',
                borderTop: '2px solid rgba(45,90,61,.12)',
                padding: '1.5rem 0 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '.12em',
                color: 'var(--gold)',
                flexShrink: 0,
              }}>GR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)', alignSelf: 'center' }} />
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                margin: 0,
                flexShrink: 0,
              }}>
                Ground Rules
              </h2>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: 'var(--text-muted)',
                flexShrink: 0,
                marginLeft: '0.25rem',
                lineHeight: 1,
              }}>
                {groundRulesOpen ? '−' : '+'}
              </span>
            </button>

            {groundRulesOpen && (
              <div style={{ marginTop: '0.5rem', marginLeft: '3rem' }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '.05em',
                  color: 'var(--text-muted)',
                  marginBottom: '1.5rem',
                }}>
                  Playing and Ground Rules 2025
                </div>
                <RenderRuleDoc sections={GROUND_RULES_DOC} />
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="no-print" style={{ marginTop: '3rem' }}>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-mid)',
              textDecoration: 'none',
              letterSpacing: '.05em',
            }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
