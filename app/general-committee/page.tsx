import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'General Committee — Barnes Bowling Club',
};

const OPTIMA = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const GOLD   = '#A89560';
const GREEN  = '#1a3a2a';

interface Member { name: string; role: string; email?: string }

function Card({ m }: { m: Member }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      width: '200px',
    }}>
      {/* Portrait photo rectangle — full oblong, light grey placeholder */}
      <div style={{
        width: '200px', height: '260px',
        background: '#e8e8e8',
        borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1"
          style={{ width: 72, height: 72 }}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      {/* Name and role below the photo */}
      <div style={{
        fontFamily: OPTIMA, fontSize: '15px', fontWeight: 700,
        color: '#2d2d2d', marginTop: '12px', lineHeight: 1.3,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      }}>{m.name}</div>
      <div style={{
        fontFamily: OPTIMA, fontSize: '12px', fontWeight: 400,
        color: '#999999', marginTop: '6px', lineHeight: 1.4,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
      }}>{m.role}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap' as const,
      justifyContent: 'center', gap: '1.5rem',
      marginBottom: '2.5rem',
    }}>
      {children}
    </div>
  );
}

export default function GeneralCommitteePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Header */}
        <div style={{ background: GREEN, padding: '1rem 2rem 4rem', color: '#f5f0e8' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: GOLD, borderTopColor: GOLD }}>Club</div>
            <h1 className="section-h2" style={{ color: '#f5f0e8', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              General <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Committee</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              The officers and volunteers who run Barnes Bowling Club.
            </p>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '15px',
              lineHeight: 1.75,
              color: 'rgba(245,240,232,.7)',
              maxWidth: '580px',
              marginTop: '1.25rem',
              marginBottom: 0,
            }}>
              <span style={{ color: '#A89560' }}>Elected annually at the AGM</span>{' '}
              — the committee meets monthly throughout the playing season. Members are welcome
              to raise issues directly with a committee member or via the suggestions box in
              the clubhouse.
            </p>
          </div>
        </div>

        {/* Card grid */}
        <div style={{
          backgroundImage: "url('/images/texture.png')", backgroundRepeat: 'repeat', backgroundSize: '43px 43px',
          backgroundColor: '#f9f7f4', padding: '4rem 2rem 6rem',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Row 1 — Honorary President */}
            <Row>
              <Card m={{ name: 'Judith Heaton', role: 'Honorary President (Non-Voting / Advisory)' }} />
            </Row>

            {/* Row 2 — Chair */}
            <Row>
              <Card m={{ name: 'Andrew Fox', role: 'Chair' }} />
            </Row>

            {/* Row 3 — Secretary · Treasurer · Captain */}
            <Row>
              <Card m={{ name: 'Tracy Greasley', role: 'Secretary' }} />
              <Card m={{ name: 'Ginnette Grimes', role: 'Treasurer' }} />
              <Card m={{ name: 'Alaric Evans',    role: 'Captain'   }} />
            </Row>

            {/* Row 4 — Vice Captain */}
            <Row>
              <Card m={{ name: 'Mark Hunter', role: 'Vice Captain' }} />
            </Row>

            {/* Row 5 — General Committee Members */}
            <Row>
              <Card m={{ name: 'Brian Coles',      role: 'General Committee Member' }} />
              <Card m={{ name: 'Jeremy Frearson',  role: 'General Committee Member' }} />
              <Card m={{ name: 'David Priestley',  role: 'General Committee Member' }} />
              <Card m={{ name: 'Gerry Summers',    role: 'General Committee Member' }} />
            </Row>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
