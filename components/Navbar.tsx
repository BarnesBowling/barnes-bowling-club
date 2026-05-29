'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SEARCH_PAGES = [
  { title: 'Home',                  href: '/',                    keywords: 'home welcome bowls bowling club barnes pond' },
  { title: 'History',               href: '/history',             keywords: 'history heritage 1725 established oldest pub green founding' },
  { title: 'Events',                href: '/events',              keywords: 'events season competitions fixtures calendar international day' },
  { title: 'How to Play',           href: '/how-to-play',         keywords: 'how to play rules equipment clothing rink green bowl jack etiquette game' },
  { title: 'Gallery',               href: '/gallery',             keywords: 'gallery photos photography pictures images club' },
  { title: 'News',                  href: '/news',                keywords: 'news updates announcements newsletter latest' },
  { title: 'Community',             href: '/community',           keywords: 'community local barnes residents neighbours' },
  { title: 'Contact',               href: '/contact',             keywords: 'contact get in touch email address phone' },
  { title: 'Membership',            href: '/membership',          keywords: 'membership join subscribe fee playing member annual' },
  { title: 'Wednesday Roll-ups',    href: '/roll-ups',            keywords: 'roll ups wednesday beginners try experience visitors taster' },
  { title: 'Membership Enquiry',     href: '/apply',               keywords: 'apply enquiry membership enquire interested joining' },
  { title: 'Membership Application', href: '/membership-application', keywords: 'membership application form apply join formal' },
  { title: 'Opening Hours',         href: '/opening-hours',       keywords: 'opening hours visit season winter daily hours green' },
  { title: "Members' Area Area",      href: '/members/dashboard',   keywords: 'members dashboard portal login sign in account' },
  { title: 'Make a Payment',        href: '/members/payment',     keywords: 'payment subscription fee pay stripe guest' },
  { title: 'Results & Leaderboard', href: '/members/results',     keywords: 'results leaderboard manser shield cup pairs match scores winners fixtures standings' },
];

const KEYWORD_ROUTES: { keywords: string[]; href: string }[] = [
  { keywords: ['history', '1725', 'founded', 'about'],                       href: '/history' },
  { keywords: ['how to play', 'shots', 'draw', 'drive', 'bowls', 'rules'],   href: '/how-to-play' },
  { keywords: ['gallery', 'photos', 'pictures'],                             href: '/gallery' },
  { keywords: ['events', 'fixtures', 'calendar', 'season'], href: '/events' },
  { keywords: ['results', 'leaderboard', 'scores', 'winners', 'standings', 'manser leaderboard', 'match results'], href: '/members/results' },
  { keywords: ['news', 'newsletter'],                                         href: '/news' },
  { keywords: ['community'],                                                  href: '/community' },
  { keywords: ['opening hours', 'hours', 'season', 'winter meet'],           href: '/opening-hours' },
  { keywords: ['contact', 'visit', 'location', 'address'],                   href: '/contact' },
  { keywords: ['membership', 'join', 'apply'],                               href: '/apply' },
  { keywords: ['handicap'],                                                   href: '/members/handicaps' },
  { keywords: ['constitution', 'ground rules'],                               href: '/members/constitution' },
  { keywords: ['book', 'match', 'game'],                                      href: '/members/book-a-game' },
  { keywords: ['payment', 'fees', 'subscription'],                           href: '/members/payment' },
  { keywords: ['competitions', 'shield', 'cup', 'pairs', 'manser', 'competition', 'trophy'], href: '/members/competitions' },
  { keywords: ['members', 'dashboard', 'login'],                             href: '/members/dashboard' },
];

function resolveSearch(q: string): string {
  const lower = q.trim().toLowerCase();
  if (!lower) return '/contact';
  const sorted = KEYWORD_ROUTES.flatMap(({ keywords, href }) =>
    keywords.map(k => ({ k, href }))
  ).sort((a, b) => b.k.length - a.k.length);
  for (const { k, href } of sorted) {
    if (lower.includes(k)) return href;
  }
  return '/contact';
}

const NEWS_EVENTS_LINKS = [
  { href: '/events',      label: 'Events' },
  { href: '/notices',     label: 'Notices' },
  { href: '/newsletter',  label: 'Newsletter' },
];

const MEMBERSHIP_LINKS = [
  { href: '/apply',                    label: 'Membership Enquiry' },
  { href: '/membership-application',   label: 'Application Form' },
];

const ABOUT_US_LINKS = [
  { href: '/history',           label: 'History' },
  { href: '/general-committee', label: 'General Committee' },
  { href: '/opening-hours',     label: 'Opening Hours' },
  { href: '/contact',           label: 'Contact Us' },
];

const HOW_TO_PLAY_LINKS = [
  { href: '/how-to-play#equipment',     label: 'Equipment & Clothing' },
  { href: '/how-to-play#green',         label: 'The Green' },
  { href: '/how-to-play#types-of-game', label: 'Types of Game' },
  { href: '/how-to-play#how-to-bowl',   label: 'How to Bowl' },
  { href: '/how-to-play#types-of-shot', label: 'Types of Shot' },
  { href: '/how-to-play#bowl-jack',     label: 'Bowl & Jack Positions' },
  { href: '/how-to-play#scoring',       label: 'Scoring' },
  { href: '/how-to-play#etiquette',     label: 'Club Etiquette' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [query, setQuery]             = useState('');
  const [mobileQuery, setMobileQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  const results = query.trim().length > 1
    ? SEARCH_PAGES.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.keywords.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const mobileResults = mobileQuery.trim().length > 1
    ? SEARCH_PAGES.filter(p =>
        p.title.toLowerCase().includes(mobileQuery.toLowerCase()) ||
        p.keywords.toLowerCase().includes(mobileQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const closeSearch = useCallback(() => { setQuery(''); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeSearch(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) closeSearch();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [closeSearch]);

  function navigate(href: string) {
    router.push(href);
    closeSearch();
    setMenuOpen(false);
    setMobileQuery('');
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(resolveSearch(query));
  }

  function handleMobileSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mobileQuery.trim()) navigate(resolveSearch(mobileQuery));
  }

  return (
    <header className="navbar-root">

      {/* ── Top utility bar ── */}
      <div className="nav-topbar">
        <div className="nav-topbar-inner">

          {/* Email */}
          <a href="mailto:info@barnesbowling.com" className="nav-topbar-email">
            <svg viewBox="0 0 512 512" fill="currentColor" stroke="none">
              <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
            </svg>
            info@barnesbowling.com
          </a>

          {/* Search */}
          <div className="nav-topbar-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="nav-topbar-search-form">
              <button type="submit" className="nav-topbar-search-btn" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <input
                className="nav-topbar-search-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search here..."
                autoComplete="off"
              />
            </form>
            {(results.length > 0 || query.trim().length > 1) && (
              <div className="nav-search-dropdown">
                {results.length === 0
                  ? <p className="nav-search-no-results">No pages found</p>
                  : results.map(r => (
                      <button key={r.href} className="nav-search-result" onClick={() => navigate(r.href)}>
                        {r.title}
                      </button>
                    ))
                }
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Main nav ── */}
      <nav className="nav-main">
        <div className="nav-main-inner">

          {/* Brand */}
          <Link href="/" className="nav-brand">
            <span className="nav-brand-name">BBC</span>
            <span className="nav-brand-sub">Est.&nbsp;<span className="nav-brand-sup">c</span>1725</span>
          </Link>

          {/* Desktop links */}
          <div className="navlinks">
            <div className="nav-has-dropdown">
              <Link href="/history">About Us</Link>
              <div className="nav-dropdown-menu">
                {ABOUT_US_LINKS.map(l => (
                  <a key={l.href + l.label} href={l.href}>{l.label}</a>
                ))}
              </div>
            </div>
            <div className="nav-has-dropdown">
              <Link href="/how-to-play">How to Play</Link>
              <div className="nav-dropdown-menu">
                {HOW_TO_PLAY_LINKS.map(l => (
                  <a key={l.href} href={l.href}>{l.label}</a>
                ))}
              </div>
            </div>
            <Link href="/gallery">Gallery</Link>
            <div className="nav-has-dropdown">
              <Link href="/events">News &amp; Events</Link>
              <div className="nav-dropdown-menu">
                {NEWS_EVENTS_LINKS.map(l => (
                  <a key={l.href + l.label} href={l.href}>{l.label}</a>
                ))}
              </div>
            </div>
            <div className="nav-has-dropdown">
              <a href="/membership">Membership</a>
              <div className="nav-dropdown-menu">
                {MEMBERSHIP_LINKS.map(l => (
                  <a key={l.href + l.label} href={l.href}>{l.label}</a>
                ))}
              </div>
            </div>
            <Link href="/community">Community</Link>
            <Link href="/contact">Contact</Link>
          </div>

          {/* Members' Area */}
          <div className="nav-right">
            <Link className="nav-members-btn" href="/members/dashboard">Members' Area</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            )}
          </button>

        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="nav-mobile-panel">

          {/* Mobile search */}
          <form onSubmit={handleMobileSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.65rem 0', borderBottom: '1px solid rgba(27,59,38,.08)', marginBottom: '.25rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, opacity: .45, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={mobileQuery}
              onChange={e => setMobileQuery(e.target.value)}
              placeholder="Search pages…"
              autoComplete="off"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--green-deep)', flex: 1, padding: '2px 0' }}
            />
          </form>
          {mobileResults.map(r => (
            <button key={r.href} onClick={() => navigate(r.href)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '.4rem 1rem', background: 'rgba(27,59,38,.04)', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'var(--green-deep)', letterSpacing: '.04em' }}>
              {r.title}
            </button>
          ))}

          {/* Nav links */}
          <span className="nav-mobile-section">About Us</span>
          {ABOUT_US_LINKS.map(l => (
            <a key={l.href + l.label} href={l.href} className="nav-mobile-sub-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <span className="nav-mobile-section">News &amp; Events</span>
          {NEWS_EVENTS_LINKS.map(l => (
            <a key={l.href + l.label} href={l.href} className="nav-mobile-sub-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <span className="nav-mobile-section">How to Play</span>
          {HOW_TO_PLAY_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-mobile-sub-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href="/gallery"    className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Gallery</a>
          <span className="nav-mobile-section">Membership</span>
          {MEMBERSHIP_LINKS.map(l => (
            <a key={l.href + l.label} href={l.href} className="nav-mobile-sub-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href="/community" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Community</a>
          <a href="/contact"   className="nav-mobile-link" onClick={() => setMenuOpen(false)}>Contact</a>

          <div className="nav-mobile-bottom">
            <Link className="nav-members-btn" href="/members/dashboard" onClick={() => setMenuOpen(false)}>
              Members' Area
            </Link>
          </div>

        </div>
      )}

    </header>
  );
}
