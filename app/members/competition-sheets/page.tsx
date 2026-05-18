import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { competitionSheets } from '@/data/competition-sheets';
import { CompetitionSheetsClient } from './CompetitionSheetsClient';

export default async function CompetitionSheetsPage() {
  const cookieStore = await cookies();
  const sc = cookieStore.get(SESSION_COOKIE);
  const session = sc ? await verifyMemberSession(sc.value) : null;
  if (!session) redirect('/login?redirect=/members/competition-sheets');

  return (
    <>
      <Navbar />
      <main>
        {/* Green header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
              Members Area
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Competition <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Sheets</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Draw sheets and competition records for the 2026 season.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <CompetitionSheetsClient sheets={competitionSheets} />
        </div>
      </main>
      <Footer />
    </>
  );
}
