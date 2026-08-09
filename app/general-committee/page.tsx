import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'General Committee — Barnes Bowling Club',
};

const OPTIMA = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const GOLD   = '#A89560';
const GREEN  = '#1a3a2a';
const LINE   = 'rgba(168,149,96,.45)';

const CW = 160; // card wrapper width px
const CG = 24;  // gap between cards px
const CH = 40;  // connector zone height px

const IMG: Record<string, { fit: 'contain' | 'cover'; pos: string; bg?: string; scale?: number }> = {
  'Tracy Greasley': { fit: 'contain', pos: '15% center', bg: '#e8e8e8' },
  'Judith Heaton':  { fit: 'cover',   pos: 'center 35%', scale: 1.3 },
  'Brian Coles':    { fit: 'cover',   pos: 'center 35%', scale: 1.3 },
};
const IMG_DEFAULT = { fit: 'cover' as const, pos: 'center top' };

function Card({ name, role, photo }: { name: string; role: string; photo?: string }) {
  const img = IMG[name] ?? IMG_DEFAULT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: `${CW}px` }}>
      <div style={{ width: '120px', height: '120px', background: '#e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
        {photo ? (
          <img
            src={photo}
            alt={name}
            style={{
              width: '100%', height: '100%', display: 'block',
              objectFit: img.fit,
              objectPosition: img.pos,
              background: img.bg,
              ...(img.scale ? { transform: `scale(${img.scale})`, transformOrigin: 'center top' } : {}),
            }}
          />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1" style={{ width: 52, height: 52 }}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        )}
      </div>
      <div style={{ fontFamily: OPTIMA, fontSize: '13px', fontWeight: 700, color: '#2d2d2d', marginTop: '10px', lineHeight: 1.3, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
        {name}
      </div>
      <div style={{ fontFamily: OPTIMA, fontSize: '11px', fontWeight: 400, color: '#999999', marginTop: '5px', lineHeight: 1.4, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>
        {role}
      </div>
    </div>
  );
}

/* Vertical line between a single parent and what comes below */
function VLine() {
  return <div className="org-vline" />;
}

/*
 * Horizontal fan connector: a horizontal bar spanning card centres,
 * with a vertical stub dropping to each card below.
 * Width = count * CW + (count-1) * CG so it exactly matches the card row.
 */
function HConnector({ count }: { count: number }) {
  const width = count * CW + (count - 1) * CG;
  const stubs = Array.from({ length: count }, (_, i) => i * (CW + CG) + CW / 2);
  return (
    <div className="org-hconn" style={{ width }}>
      {stubs.map((left, i) => (
        <div key={i} className="org-stub" style={{ left }} />
      ))}
    </div>
  );
}

export default async function GeneralCommitteePage() {
  const { data: officers } = await supabaseAdmin
    .from('officers')
    .select('id, name, role, sort_order, photo_filename')
    .eq('group_name', 'Committee')
    .order('sort_order');

  const all = officers ?? [];
  const photoUrl = (o: (typeof all)[0]) =>
    o.photo_filename ? `/committee/${o.photo_filename}` : undefined;

  /* Bucket into rows by role keyword */
  const row1 = all.filter((o) => /president/i.test(o.role));
  const row2 = all.filter((o) => /chair/i.test(o.role));
  const row3 = all.filter((o) => /(captain|treasurer|secretary)/i.test(o.role));
  const row4 = all.filter(
    (o) => !row1.includes(o) && !row2.includes(o) && !row3.includes(o),
  );

  return (
    <>
      <Navbar />
      <main>
        <style>{`
          .org-vline {
            width: 1px;
            height: ${CH}px;
            background: ${LINE};
            margin: 0 auto;
          }
          /* Connector zone: horizontal bar across card centres + vertical stubs down */
          .org-hconn {
            position: relative;
            height: ${CH}px;
            margin: 0 auto;
            flex-shrink: 0;
          }
          .org-hconn::before {
            content: '';
            position: absolute;
            top: 0;
            left: ${CW / 2}px;
            right: ${CW / 2}px;
            height: 1px;
            background: ${LINE};
          }
          .org-stub {
            position: absolute;
            top: 0;
            width: 1px;
            height: 100%;
            background: ${LINE};
            transform: translateX(-50%);
          }
          /* Mobile: collapse to a single centred column, hide all lines */
          @media (max-width: 700px) {
            .org-vline,
            .org-hconn { display: none; }
            .org-row {
              flex-direction: column !important;
              align-items: center;
              gap: 1.75rem !important;
            }
          }
        `}</style>

        {/* ── Header ── */}
        <div style={{ background: GREEN, padding: '1rem 2rem 4rem', color: '#f5f0e8' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: GOLD, borderTopColor: GOLD }}>Club</div>
            <h1 className="section-h2" style={{ color: '#f5f0e8', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Committee</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              The Committee of volunteers who run Barnes Bowling Club.
            </p>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.75, color: 'rgba(245,240,232,.7)', maxWidth: '580px', marginTop: '1.25rem', marginBottom: 0 }}>
              <span style={{ color: '#A89560' }}>Elected annually at the AGM</span>{' '}
              — the committee meets monthly throughout the playing season. Members are welcome
              to raise issues directly with a committee member or via the suggestions box in
              the clubhouse.
            </p>
          </div>
        </div>

        {/* ── Org chart ── */}
        <div style={{
          backgroundImage: "url('/images/texture.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '43px 43px',
          backgroundColor: '#f9f7f4',
          padding: '4rem 2rem 6rem',
          overflowX: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>

            {/* Row 1 — President */}
            {row1.length > 0 && (
              <div className="org-row" style={{ display: 'flex', gap: `${CG}px` }}>
                {row1.map((o) => (
                  <Card key={o.id} name={o.name} role={o.role} photo={photoUrl(o)} />
                ))}
              </div>
            )}

            {/* ↕ President → Chair */}
            {row1.length > 0 && row2.length > 0 && <VLine />}

            {/* Row 2 — Chair */}
            {row2.length > 0 && (
              <div className="org-row" style={{ display: 'flex', gap: `${CG}px` }}>
                {row2.map((o) => (
                  <Card key={o.id} name={o.name} role={o.role} photo={photoUrl(o)} />
                ))}
              </div>
            )}

            {/* ↕ Chair → Officers (fan) */}
            {row2.length > 0 && row3.length > 0 && (
              <>
                <VLine />
                <HConnector count={row3.length} />
              </>
            )}

            {/* Row 3 — Captain / Vice Captain / Treasurer / Secretary */}
            {row3.length > 0 && (
              <div className="org-row" style={{ display: 'flex', gap: `${CG}px` }}>
                {row3.map((o) => (
                  <Card key={o.id} name={o.name} role={o.role} photo={photoUrl(o)} />
                ))}
              </div>
            )}

            {/* ↕ Officers → General members (fan) */}
            {row3.length > 0 && row4.length > 0 && (
              <>
                <VLine />
                <HConnector count={row4.length} />
              </>
            )}

            {/* Row 4 — General Committee Members */}
            {row4.length > 0 && (
              <div className="org-row" style={{ display: 'flex', gap: `${CG}px` }}>
                {row4.map((o) => (
                  <Card key={o.id} name={o.name} role={o.role} photo={photoUrl(o)} />
                ))}
              </div>
            )}

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
