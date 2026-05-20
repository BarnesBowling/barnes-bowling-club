'use client';

import Link from 'next/link';

const PRIVACY_LINKS = [
  { label: 'Privacy Policy',      href: '/privacy-policy'              },
  { label: 'Social Media Policy', href: '/social-media-policy'         },
  { label: 'Disclaimer',          href: '/privacy-policy#disclaimer'   },
  { label: 'Sitemap',             href: '/sitemap'                     },
];

const OPTIMA = "'Optima', 'Helvetica Neue', Arial, sans-serif";

const colHeading: React.CSSProperties = {
  fontFamily:    OPTIMA,
  fontSize:      '14px',
  fontWeight:    700,
  color:         'var(--green-deep)',
  letterSpacing: '.01em',
  marginBottom:  '14px',
};

const BODY_COLOR = '#2a5a35';

const bodyText: React.CSSProperties = {
  fontFamily:  OPTIMA,
  fontSize:    '13px',
  color:       BODY_COLOR,
  lineHeight:  1.7,
  margin:      0,
};

const smallLink: React.CSSProperties = {
  fontFamily:          OPTIMA,
  fontSize:            '13px',
  color:               BODY_COLOR,
  textDecoration:      'underline',
  textUnderlineOffset: '3px',
  cursor:              'pointer',
};

export function Footer() {
  return (
    <>
      {/* ── Upper grey section ── */}
      <footer style={{
        background: '#f4f4f4',
      }}>
        <div style={{
          maxWidth:   '1200px',
          margin:     '0 auto',
          padding:    '4rem 24px',
          display:    'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap:        '2.5rem',
          alignItems: 'flex-start',
        }}>

          {/* ── Col 1: Brand ── */}
          <div style={{ justifySelf: 'start' }}>
            <Link href="/" className="nav-brand" style={{ marginLeft: '-2px', top: 0 }}>
              <span className="nav-brand-name">BBC</span>
              <span className="nav-brand-sub">Est.&nbsp;<span className="nav-brand-sup">c</span>1725</span>
            </Link>
          </div>

          {/* ── Col 2: Address ── */}
          <div>
            <div style={colHeading}>Address</div>
            <address style={{ ...bodyText, fontStyle: 'normal', marginBottom: '10px' }}>
              The Sun Inn<br />
              Church Road<br />
              Barnes SW13
            </address>
            <a
              href="https://maps.google.com/?q=The+Sun+Inn+Church+Road+Barnes+London+SW13+9HE"
              target="_blank"
              rel="noopener noreferrer"
              style={smallLink}
            >
              View Map
            </a>
          </div>

          {/* ── Col 3: Contact + Members' Area ── */}
          <div>
            <div style={colHeading}>Contact Us</div>

            {/* Email with envelope icon */}
            <a
              href="mailto:info@barnesbowling.com"
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '7px',
                textDecoration: 'none',
                color:          BODY_COLOR,
                fontFamily:     OPTIMA,
                fontSize:       '13px',
                marginBottom:   '18px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-deep)')}
              onMouseLeave={e => (e.currentTarget.style.color = BODY_COLOR)}
            >
              <svg viewBox="0 0 512 512" fill="#A89560" stroke="none" style={{ width: 15, height: 15, flexShrink: 0 }}>
                <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
              </svg>
              info@barnesbowling.com
            </a>

            {/* Members' Area button */}
            <Link
              href="/members/dashboard"
              style={{
                display:        'inline-block',
                background:     '#A89560',
                color:          '#fff',
                fontFamily:     "'DM Sans', sans-serif",
                fontSize:       '12px',
                fontWeight:     600,
                letterSpacing:  '.07em',
                textTransform:  'uppercase',
                padding:        '11px 24px',
                marginTop:      '8px',
                textDecoration: 'none',
                borderRadius:   '4px',
                whiteSpace:     'nowrap',
                transition:     'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6E6338')}
              onMouseLeave={e => (e.currentTarget.style.background = '#A89560')}
            >
              Members&apos; Area
            </Link>
          </div>

          {/* ── Col 4: Social ── */}
          <div style={{ paddingLeft: '4rem' }}>
            <div style={colHeading}>Follow Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/barnesbowlingclub"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '10px',
                  textDecoration: 'none',
                  color:          BODY_COLOR,
                  fontFamily:     OPTIMA,
                  fontSize:       '13px',
                  transition:     'color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-deep)')}
                onMouseLeave={e => (e.currentTarget.style.color = BODY_COLOR)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, flexShrink: 0 }}>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Follow us on Facebook
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/barnesbowlingclub"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '10px',
                  textDecoration: 'none',
                  color:          BODY_COLOR,
                  fontFamily:     OPTIMA,
                  fontSize:       '13px',
                  transition:     'color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--green-deep)')}
                onMouseLeave={e => (e.currentTarget.style.color = BODY_COLOR)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ width: 20, height: 20, flexShrink: 0 }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                Follow us on Instagram
              </a>

            </div>
          </div>

        </div>
      </footer>

      {/* ── White bottom bar ── */}
      <div style={{
        background:     '#fff',
        borderTop:      '1px solid rgba(0,0,0,.09)',
        minHeight:      '90px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '25px 40px',
      }}>
        <div style={{ textAlign: 'center' }}>

          {/* Privacy links — spaced, no separators */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '14px', flexWrap: 'wrap' }}>
            {PRIVACY_LINKS.map(l => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontFamily:     OPTIMA,
                  fontSize:       '14px',
                  color:          'var(--green-deep)',
                  textDecoration: 'none',
                  opacity:        0.75,
                  transition:     'opacity .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p style={{
            fontFamily: OPTIMA,
            fontSize:   '14px',
            color:      'var(--green-deep)',
            margin:     0,
          }}>
            © 2026 Barnes Bowling Club. All rights reserved.
          </p>

        </div>
      </div>
    </>
  );
}
