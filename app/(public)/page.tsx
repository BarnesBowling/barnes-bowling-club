const TICKER_TEXT =
  'Season 2026 ·  25th April to early October  ✶  Playing Membership £215 · Joining Fee £100  ✶  Wednesday nights 6–8pm open to all  ✶  International Day 28 June · Guests Welcome  ';

export default function LandingPage() {
  const doubled = TICKER_TEXT + TICKER_TEXT;

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1e3a28',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @keyframes bbc-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .bbc-ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: bbc-ticker 40s linear infinite;
          will-change: transform;
        }
        .bbc-btn {
          display: block;
          width: 320px;
          padding: 18px 60px;
          background: transparent;
          color: #c9a84c;
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          text-align: center;
          border: 1px solid #c9a84c;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          box-sizing: border-box;
        }
        .bbc-btn:hover {
          background: rgba(201,168,76,0.12);
        }
        @media (max-width: 500px) {
          .bbc-btn { width: 280px; padding: 16px 32px; }
          .bbc-title {
            font-size: clamp(1.6rem, 7vw, 2.6rem) !important;
          }
        }
      `}</style>

      {/* ── Central panel ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        {/* Monogram */}
        <svg
          width="136"
          height="136"
          viewBox="0 0 136 136"
          fill="none"
          aria-hidden="true"
          style={{ marginBottom: '2rem' }}
        >
          {/* Outer ring */}
          <circle cx="68" cy="68" r="63" stroke="#b5924a" strokeWidth="1.5" />
          {/* Inner ring */}
          <circle cx="68" cy="68" r="56" stroke="#b5924a" strokeOpacity="0.3" strokeWidth="0.75" />
          {/* EST label */}
          <text
            x="68" y="46"
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize="8.5"
            fontWeight="600"
            letterSpacing="5"
            fill="#b5924a"
            fillOpacity="0.65"
          >
            EST
          </text>
          {/* Monogram */}
          <text
            x="68" y="80"
            textAnchor="middle"
            fontFamily="'Playfair Display', serif"
            fontSize="30"
            fontWeight="500"
            letterSpacing="4"
            fill="#b5924a"
          >
            BBC
          </text>
          {/* Year */}
          <text
            x="68" y="97"
            textAnchor="middle"
            fontFamily="'DM Sans', sans-serif"
            fontSize="10"
            fontWeight="300"
            letterSpacing="4"
            fill="#b5924a"
            fillOpacity="0.75"
          >
            c·1725
          </text>
          {/* Small ornament lines flanking EST */}
          <line x1="30" y1="44" x2="46" y2="44" stroke="#b5924a" strokeOpacity="0.35" strokeWidth="0.75" />
          <line x1="90" y1="44" x2="106" y2="44" stroke="#b5924a" strokeOpacity="0.35" strokeWidth="0.75" />
        </svg>

        {/* Title */}
        <h1
          className="bbc-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.9rem, 5vw, 3rem)',
            fontWeight: 500,
            color: '#f9f6f1',
            letterSpacing: '0.04em',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Barnes Bowling Club
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#b5924a',
            margin: '14px 0 0',
          }}
        >
          Est. c1725&nbsp;&nbsp;·&nbsp;&nbsp;Barnes SW13
        </p>

        {/* Gold rule */}
        <div
          style={{
            width: '52px',
            height: '1px',
            background: '#b5924a',
            opacity: 0.6,
            margin: '28px auto',
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/home" className="bbc-btn">
            View Main Website
          </a>
          <a href="/members/dashboard" className="bbc-btn">
            Visit Members&rsquo; Area
          </a>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid rgba(181,146,74,0.2)',
          padding: '12px 0',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <div className="bbc-ticker-track">
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            {doubled}
          </span>
        </div>
      </div>
    </main>
  );
}
