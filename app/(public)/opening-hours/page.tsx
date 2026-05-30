import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function OpeningHours() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Green header ── */}
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

        {/* ── Content ── */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
          <div className="section-inner" style={{ padding: '4rem 2rem 5rem' }}>
            <style>{`
              @media (max-width: 768px) {
                .oh-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
            <div className="oh-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr)', gap: '2rem', alignItems: 'start' }}>

              {/* ── Left: main content ── */}
              <div>
                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    Daily Hours
                  </h2>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: 0 }}>
                    <strong>Monday – Sunday:</strong> 11am – 11pm
                  </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    Season
                  </h2>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: 0 }}>
                    The bowling season runs from <strong>25th April</strong> to <strong>early October</strong>.
                  </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    Wednesday Roll Ups
                  </h2>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.75rem' }}>
                    <strong>Every Wednesday, 6–8pm — Club Night.</strong>
                  </p>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.75rem' }}>
                    Every Wednesday from 6–8pm, we open the green to anyone over 16 who wants to try their hand. Bring flat-soled shoes and a willingness to have a go — that&apos;s it.
                  </p>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: 0 }}>
                    The BBQ is usually fired up, drinks are usually flowing, and it&apos;s the perfect way to meet our members in a relaxed setting.
                  </p>
                </section>

                <section>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    Before You Visit
                  </h2>
                  <ul style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>Check the website for current green playing conditions.</li>
                    <li>Before arriving to play, we suggest checking the website to confirm that no competition matches are scheduled on the green.</li>
                  </ul>
                </section>

                <section style={{ marginTop: '3rem' }}>
                  <svg viewBox="0 0 48 28" width="40" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.75rem' }}>
                    {/* Male — left */}
                    <circle cx="14" cy="11" r="7" stroke="var(--gold)" strokeWidth="1.8"/>
                    {/* Short hair — flat top with slight peaks */}
                    <path d="M7.5 8 Q14 4 20.5 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    {/* Male shoulders */}
                    <path d="M4 27 Q14 22 24 27" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    {/* Female — right */}
                    <circle cx="34" cy="11" r="7" stroke="var(--gold)" strokeWidth="1.8"/>
                    {/* Long hair — flowing sides */}
                    <path d="M27.5 8 Q34 3 40.5 8" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                    <path d="M27.2 11 Q25 18 27 24" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    <path d="M40.8 11 Q43 18 41 24" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    {/* Female shoulders */}
                    <path d="M24 27 Q34 22 44 27" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  </svg>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                    Guests
                  </h2>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.75rem' }}>
                    Guests are always welcome — we just ask that you sign them into the book in the clubhouse when they arrive.
                  </p>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.75rem' }}>
                    If they play, there&apos;s a modest fee of £5 per guest. We tally these up each month and you can see your running total on your account on the website, with the full amount billed towards the end of the season.
                  </p>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.75rem' }}>
                    The fee doesn&apos;t apply on our Club Open Nights (Wednesdays, 5 – 8pm), Opening Day, Barnes Fair Day, or International Day — guests play free on those occasions.
                  </p>
                  <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: 0 }}>
                    Children under 16 aren&apos;t able to play, and we ask that little ones are kept off the green.
                  </p>
                </section>
              </div>

              {/* ── Right: sidebar ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.75rem' }}>
                  {/* Floppy left ear */}
                  <path d="M9 24 C6 13 13 8 17 17" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--gold)" fillOpacity="0.2"/>
                  {/* Floppy right ear */}
                  <path d="M39 24 C42 13 35 8 31 17" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--gold)" fillOpacity="0.2"/>
                  {/* Head */}
                  <circle cx="24" cy="28" r="15" stroke="var(--gold)" strokeWidth="2"/>
                  {/* Eyes */}
                  <circle cx="19" cy="25" r="2" fill="var(--gold)"/>
                  <circle cx="29" cy="25" r="2" fill="var(--gold)"/>
                  {/* Nose */}
                  <ellipse cx="24" cy="31" rx="3.5" ry="2.5" fill="var(--gold)"/>
                  {/* Mouth */}
                  <path d="M21 34.5 Q24 37.5 27 34.5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>

                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                  Dog Policy
                </h2>
                <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 1rem' }}>
                  We love dogs at the Club, and many Members bring theirs along — but a calm, comfortable environment for everyone has to come first.
                </p>
                <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 1rem' }}>
                  Most dogs settle in beautifully. A few take more time. Either way, we ask owners to help by following a few simple guidelines so all Members can enjoy their visit.
                </p>
                <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 0.5rem' }}>
                  <strong>Please:</strong>
                </p>
                <ul style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, paddingLeft: '1.25rem', margin: '0 0 1rem' }}>
                  <li style={{ marginBottom: '0.4rem' }}>Keep your dog on a lead at all times — never on the green.</li>
                  <li style={{ marginBottom: '0.4rem' }}>Make sure they&apos;re calm and quiet (no barking, whining, or pulling), and don&apos;t need to be held back.</li>
                  <li style={{ marginBottom: '0.4rem' }}>No toileting on Club premises.</li>
                  <li style={{ marginBottom: '0.4rem' }}>If your dog gets unsettled, move to a quieter spot. If that doesn&apos;t help, please head home.</li>
                  <li style={{ marginBottom: '0.4rem' }}>Avoid grouping up — no more than two dogs together near the bowling platforms.</li>
                  <li style={{ marginBottom: '0.4rem' }}>If your dog becomes disruptive while you&apos;re playing, come straight off the green to settle them.</li>
                  <li style={{ marginBottom: '0.4rem' }}>During Shield, Cup, Pairs, or Plus Challenger Cup matches, please respect any player&apos;s wish to play without dogs present and take yours home for the match.</li>
                </ul>
                <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'var(--green-deep)', lineHeight: 1.8, margin: '0 0 1rem' }}>
                  If you have any concerns about a particular dog, just have a quiet word with a Committee Member and we&apos;ll sort it out together.
                </p>
                <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '15px', color: 'rgba(45,90,61,0.7)', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
                  Last updated: May 2026
                </p>
              </div>

            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
