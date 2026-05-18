import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Handicap Committee — Barnes Bowling Club',
};

const OPTIMA = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const GOLD   = '#A89560';
const GREEN  = '#1a3a2a';

interface Member { name: string; role: string }

function Card({ m }: { m: Member }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      width: '200px',
    }}>
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

export default function HandicapCommitteePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Header */}
        <div style={{ background: GREEN, padding: '1rem 2rem 4rem', color: '#f5f0e8' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: GOLD, borderTopColor: GOLD }}>Club</div>
            <h1 className="section-h2" style={{ color: '#f5f0e8', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Handicap <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Committee</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              The members responsible for managing handicaps at Barnes Bowling Club.
            </p>
          </div>
        </div>

        {/* Card grid */}
        <div style={{
          backgroundImage: "url('/images/texture.png')", backgroundRepeat: 'repeat', backgroundSize: '43px 43px',
          backgroundColor: '#f9f7f4', padding: '4rem 2rem 6rem',
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Row 1 — Captain · Vice Captain · President */}
            <Row>
              <Card m={{ name: 'Alaric Evans',  role: 'Captain'      }} />
              <Card m={{ name: 'Mark Hunter',   role: 'Vice Captain' }} />
              <Card m={{ name: 'Judith Heaton', role: 'President'    }} />
            </Row>

            {/* Row 2 — Members */}
            <Row>
              <Card m={{ name: 'Toby Steedman',      role: 'Member' }} />
              <Card m={{ name: 'Catherine Mitrenas', role: 'Member' }} />
            </Row>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
