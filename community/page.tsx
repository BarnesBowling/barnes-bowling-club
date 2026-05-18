import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const CARDS = [
  {
    href: '/community/supporting-barnes-artists',
    title: 'Supporting Barnes Artists',
    desc: 'How Barnes Bowling Club champions local creativity and the arts in the community.',
    img: '/images/community/supporting-barnes-artists.png',
    alt: 'Supporting Barnes Artists',
  },
  {
    href: '/community/official-sport-of-darwin-200',
    title: 'The Official Sport of Darwin 200',
    desc: "Barnes Bowling Club's role in the bicentenary celebrations of Charles Darwin.",
    img: '/images/community/darwin-200.png',
    alt: 'The Official Sport of Darwin 200',
  },
  {
    href: '/community/fish-open-gardens',
    title: 'FISH Open Gardens',
    desc: 'Our annual participation in the Friends in Surrey Hills open gardens event.',
    img: '/images/community/fish-open-gardens.png',
    alt: 'FISH Open Gardens',
  },
  {
    href: '/community/supporting-the-oso',
    title: 'Supporting the OSO',
    desc: "The club's partnership with and support for the OSO and what it means to us.",
    img: '/images/community/oso-theatre.png',
    alt: 'Supporting the OSO',
  },
];

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              Barnes Bowling Club
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Community
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Barnes Bowling Club has been part of the fabric of Barnes since 1725. Here we share
              the stories, partnerships and events that connect us with the wider local community.
            </p>
          </div>
        </div>

        {/* Icon + cards */}
        <div style={{ padding: '3.5rem 2rem 5.5rem' }}>

          {/* Centred community icon */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
            <svg
              width="58" height="54" viewBox="0 0 58 54"
              fill="none" xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* centre figure */}
              <circle cx="29" cy="13" r="7.5" stroke="#1a3a2a" strokeWidth="1.5"/>
              <path d="M14 50c0-8.3 6.7-15 15-15s15 6.7 15 15" stroke="#1a3a2a" strokeWidth="1.5" strokeLinecap="round"/>
              {/* left figure */}
              <circle cx="8.5" cy="20" r="5.5" stroke="#1a3a2a" strokeWidth="1.25" strokeOpacity="0.42"/>
              <path d="M0 50c0-5.8 4.6-10.5 10.5-10.5" stroke="#1a3a2a" strokeWidth="1.25" strokeLinecap="round" strokeOpacity="0.42"/>
              {/* right figure */}
              <circle cx="49.5" cy="20" r="5.5" stroke="#1a3a2a" strokeWidth="1.25" strokeOpacity="0.42"/>
              <path d="M58 50c0-5.8-4.6-10.5-10.5-10.5" stroke="#1a3a2a" strokeWidth="1.25" strokeLinecap="round" strokeOpacity="0.42"/>
            </svg>
            <div style={{ marginTop: '1.1rem', width: '48px', height: '1px', background: 'rgba(45,90,61,.2)' }} />
          </div>

          {/* Card grid */}
          <div className="community-grid">
            {CARDS.map(card => (
              <a key={card.href} href={card.href} className="community-card" target="_blank" rel="noopener noreferrer">
                <div className="community-card-img">
                  <img src={card.img} alt={card.alt} />
                </div>
                <div className="community-card-body">
                  <h2 className="community-card-title">{card.title}</h2>
                  <p className="community-card-desc">{card.desc}</p>
                  <span className="community-card-cta">
                    Read more
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                      <path d="M7 1l4 4-4 4M1 5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
