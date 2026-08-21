import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Row = { section_key: string; title: string; body: string };

function get(rows: Row[], key: string, defaultTitle: string, defaultBody: string) {
  const row = rows.find(r => r.section_key === key);
  return { title: row?.title ?? defaultTitle, body: row?.body ?? defaultBody };
}

function paras(text: string): string[] {
  return text.split('\n\n').map(p => p.trim()).filter(Boolean);
}

export default async function OpeningHours() {
  const { data } = await supabaseAdmin
    .from('page_content')
    .select('section_key, title, body')
    .eq('page', 'opening-hours')
    .order('sort_order');

  const rows = data ?? [];

  const dailyHours    = get(rows, 'daily_hours',    'Daily Hours',             'Monday – Sunday: 11am – 11pm');
  const season        = get(rows, 'season',          'Season',                  'The bowling season runs from 25th April to early October.');
  const wedNights     = get(rows, 'wednesday_nights','Wednesday Club Nights',   'Every Wednesday, 6–8pm — Club Night.\n\nEvery Wednesday from 6–8pm, we open the green to anyone over 18 who wants to try their hand. Bring flat-soled shoes and a willingness to have a go — that\'s it.\n\nThe BBQ is usually fired up, drinks are usually flowing, and it\'s the perfect way to meet our members in a relaxed setting.');
  const beforeVisit   = get(rows, 'before_you_visit','Before You Visit',        'Check the website for current green playing conditions.\n\nBefore arriving to play, we suggest checking the website to confirm that no competition matches are scheduled on the green.');
  const guests        = get(rows, 'guests',          'Guests',                  'Guests are always welcome — we just ask that you sign them into the book in the clubhouse when they arrive.\n\nIf they play, there\'s a modest fee of £5 per guest. We tally these up each month and you can see your running total on your account on the website, with the full amount billed towards the end of the season.\n\nThe fee doesn\'t apply on our Club Open Nights (Wednesdays, 6–8pm), Opening Day, Barnes Fair Day, or International Day — guests play free on those occasions.\n\nChildren under 16 aren\'t able to play, and we ask that little ones are kept off the green.');
  const dogPolicy     = get(rows, 'dog_policy',      'Dog Policy',              'We love dogs at the Club, and many Members bring theirs along — but a calm, comfortable environment for everyone has to come first.\n\nMost dogs settle in beautifully. A few take more time. Either way, we ask owners to help by following a few simple guidelines so all Members can enjoy their visit.\n\nKeep your dog on a lead at all times — never on the green. Make sure they\'re calm and quiet (no barking, whining, or pulling), and don\'t need to be held back. No toileting on Club premises. If your dog gets unsettled, move to a quieter spot. If that doesn\'t help, please head home. Avoid grouping up — no more than two dogs together near the bowling platforms. If your dog becomes disruptive while you\'re playing, come straight off the green to settle them. During Shield, Cup, Pairs, or Plus Challenger Cup matches, please respect any player\'s wish to play without dogs present and take yours home for the match.\n\nIf you have any concerns about a particular dog, just have a quiet word with a Committee Member and we\'ll sort it out together.');
  const dogNote       = get(rows, 'dog_policy_note', '',                        'May 2026');

  const pStyle: React.CSSProperties = {
    fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: '17px',
    color: 'var(--green-deep)',
    lineHeight: 1.8,
    margin: '0 0 0.75rem',
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--green-deep)',
    marginBottom: '1rem',
  };

  return (
    <>
      <Navbar />
      <main>

        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <Link href="/contact" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
              Visit Us
            </Link>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Opening <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Hours</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.72)', maxWidth: '540px', lineHeight: 1.7 }}>
              When you can find us at the green and how to keep in touch through winter.
            </p>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
          <div className="section-inner" style={{ padding: '4rem 2rem 5rem' }}>
            <style>{`
              @media (max-width: 768px) { .oh-grid { grid-template-columns: 1fr !important; } }
            `}</style>
            <div className="oh-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr)', gap: '2rem', alignItems: 'start' }}>

              {/* Left column */}
              <div>
                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={h2Style}>{dailyHours.title}</h2>
                  {paras(dailyHours.body).map((p, i) => <p key={i} style={{ ...pStyle, marginBottom: 0 }}>{p}</p>)}
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={h2Style}>{season.title}</h2>
                  {paras(season.body).map((p, i) => <p key={i} style={{ ...pStyle, marginBottom: 0 }}>{p}</p>)}
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={h2Style}>{wedNights.title}</h2>
                  {paras(wedNights.body).map((p, i, arr) => (
                    <p key={i} style={{ ...pStyle, marginBottom: i < arr.length - 1 ? '0.75rem' : 0 }}>{p}</p>
                  ))}
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={h2Style}>{beforeVisit.title}</h2>
                  {paras(beforeVisit.body).map((p, i, arr) => (
                    <p key={i} style={{ ...pStyle, marginBottom: i < arr.length - 1 ? '0.75rem' : 0 }}>{p}</p>
                  ))}
                </section>

                <section style={{ marginTop: '3rem' }}>
                  <svg viewBox="0 0 48 28" width="40" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.75rem' }}>
                    <circle cx="14" cy="11" r="7" stroke="var(--gold)" strokeWidth="1.8"/>
                    <path d="M7.5 8 Q14 4 20.5 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <path d="M4 27 Q14 22 24 27" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <circle cx="34" cy="11" r="7" stroke="var(--gold)" strokeWidth="1.8"/>
                    <path d="M27.5 8 Q34 3 40.5 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <path d="M27.2 11 Q25 18 27 24" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    <path d="M40.8 11 Q43 18 41 24" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    <path d="M24 27 Q34 22 44 27" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  </svg>
                  <h2 style={h2Style}>{guests.title}</h2>
                  {paras(guests.body).map((p, i, arr) => (
                    <p key={i} style={{ ...pStyle, marginBottom: i < arr.length - 1 ? '0.75rem' : 0 }}>{p}</p>
                  ))}
                </section>
              </div>

              {/* Right column — dog policy */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.75rem' }}>
                  <path d="M9 24 C6 13 13 8 17 17" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--gold)" fillOpacity="0.2"/>
                  <path d="M39 24 C42 13 35 8 31 17" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--gold)" fillOpacity="0.2"/>
                  <circle cx="24" cy="28" r="15" stroke="var(--gold)" strokeWidth="2"/>
                  <circle cx="19" cy="25" r="2" fill="var(--gold)"/>
                  <circle cx="29" cy="25" r="2" fill="var(--gold)"/>
                  <ellipse cx="24" cy="31" rx="3.5" ry="2.5" fill="var(--gold)"/>
                  <path d="M21 34.5 Q24 37.5 27 34.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
                <h2 style={h2Style}>{dogPolicy.title}</h2>
                {paras(dogPolicy.body).map((p, i, arr) => (
                  <p key={i} style={{ ...pStyle, marginBottom: i < arr.length - 1 ? '1rem' : '1rem' }}>{p}</p>
                ))}
                {dogNote.body && (
                  <p style={{ ...pStyle, fontSize: '15px', color: 'rgba(45,90,61,0.7)', fontStyle: 'italic', margin: 0 }}>
                    Last updated: {dogNote.body}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
