import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

interface SitemapLink {
  label: string;
  href: string;
  desc?: string;
}

interface SitemapSection {
  heading: string;
  links: SitemapLink[];
}

const SECTIONS: SitemapSection[] = [
  {
    heading: 'Club',
    links: [
      { label: 'Home',                href: '/',               desc: 'Welcome to Barnes Bowling Club' },
      { label: 'History',             href: '/history',        desc: 'The club\'s history since c.1725' },
      { label: 'How to Play',         href: '/how-to-play',    desc: 'A guide to lawn bowls' },
      { label: 'Opening Hours',       href: '/opening-hours',  desc: 'When the green is open' },
      { label: 'Contact',             href: '/contact',        desc: 'Get in touch with the club' },
    ],
  },
  {
    heading: 'Play',
    links: [
      { label: 'Roll-Ups',            href: '/roll-ups',       desc: 'Wednesday evening roll-ups — open to all' },
      { label: 'Events 2026',         href: '/events',         desc: 'Fixtures and competition schedule' },
    ],
  },
  {
    heading: 'Membership',
    links: [
      { label: 'Membership',          href: '/membership',         desc: 'Join Barnes Bowling Club' },
      { label: 'Apply',               href: '/apply',              desc: 'Start your membership application' },
      { label: 'Membership Application', href: '/membership-application', desc: 'Full application form' },
    ],
  },
  {
    heading: 'News & Community',
    links: [
      { label: 'News',                href: '/news',           desc: 'Latest club news' },
      { label: 'Newsletter',          href: '/newsletter',     desc: 'On the Green — past editions' },
      { label: 'Notices',             href: '/notices',        desc: 'Club notices and announcements' },
      { label: 'Gallery',             href: '/gallery',        desc: 'Photos from the green' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Community',                        href: '/community',                                        desc: 'Barnes Bowling Club in the community' },
      { label: 'Fish Open Gardens',                href: '/community/fish-open-gardens',                      desc: 'Supporting the Fish Open Gardens' },
      { label: 'Darwin 200',                       href: '/community/official-sport-of-darwin-200',           desc: 'Official sport of Darwin 200' },
      { label: 'Supporting Barnes Artists',        href: '/community/supporting-barnes-artists',              desc: 'Our support for local artists' },
      { label: 'Supporting the OSO',               href: '/community/supporting-the-oso',                     desc: 'The Old Sorting Office partnership' },
    ],
  },
  {
    heading: 'Governance',
    links: [
      { label: 'General Committee',   href: '/general-committee',   desc: 'Club committee members' },
      { label: 'Handicap Committee',  href: '/handicap-committee',  desc: 'Handicap committee members' },
      { label: 'Privacy Policy',      href: '/privacy-policy',      desc: 'How we handle your data' },
      { label: 'Social Media Policy', href: '/social-media-policy', desc: 'Our social media guidelines' },
    ],
  },
  {
    heading: 'Members\' Area',
    links: [
      { label: 'Dashboard',           href: '/members/dashboard',   desc: 'Members\' home page — login required' },
      { label: 'Calendar',            href: '/members/calendar',    desc: '2026 season calendar — login required' },
      { label: 'Competitions',        href: '/members/competitions', desc: 'Competition entries — login required' },
      { label: 'Results',             href: '/members/results',     desc: 'Match and competition results — login required' },
      { label: 'Handicaps',           href: '/members/handicaps',   desc: 'Member handicap ratings — login required' },
      { label: 'Book a Game',         href: '/members/book-a-game', desc: 'Reserve a slot on the green — login required' },
      { label: 'Payment',             href: '/members/payment',     desc: 'Subscription and fee payments — login required' },
      { label: 'My Details',          href: '/members/my-details',  desc: 'Update your member profile — login required' },
      { label: 'Archive',             href: '/members/archive',     desc: 'Club records and archives — login required' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              Site Index
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Sitemap
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.72)', maxWidth: '540px', lineHeight: 1.7 }}>
              All pages on the Barnes Bowling Club website.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: '#fff' }}>
          <div className="section-inner" style={{ padding: '4rem 2rem 5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '3rem 4rem',
            }}>
              {SECTIONS.map((section) => (
                <div key={section.heading}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    borderTop: '2px solid var(--gold)',
                    paddingTop: '10px',
                    marginBottom: '1.25rem',
                  }}>
                    {section.heading}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '15px',
                            fontWeight: 500,
                            color: 'var(--green-deep)',
                            textDecoration: 'none',
                            display: 'block',
                            lineHeight: 1.3,
                          }}
                        >
                          {link.label}
                        </Link>
                        {link.desc && (
                          <div style={{
                            fontFamily: "'Libre Baskerville', serif",
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            marginTop: '2px',
                            lineHeight: 1.5,
                          }}>
                            {link.desc}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
