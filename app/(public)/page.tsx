const TICKER_TEXT =
  'Season 2026 ·  25th April to early October  ✶  Playing Membership £215 · Joining Fee £100  ✶  Wednesday nights 6–8pm open to all  ✶  International Day 28 June · Guests Welcome  ';

export default function LandingPage() {
  const doubled = TICKER_TEXT + TICKER_TEXT;

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1b3b2a',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Libre+Caslon+Display&display=swap');

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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 48px;
          background: transparent;
          color: #c9a84c;
          font-family: 'Cinzel', 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1.5px solid #c9a84c;
          cursor: pointer;
          transition: background 0.25s, color 0.25s;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .bbc-btn:hover {
          background: #c9a84c;
          color: #1b3b2a;
        }
        @media (max-width: 600px) {
          .bbc-btn {
            font-size: 16px;
            padding: 14px 24px;
          }
        }
        @keyframes bbc-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .bbc-sketch-fade {
          animation: bbc-fade-in 2s ease-in-out forwards;
        }
        .stage {
          animation: bbc-fade-in 1s ease-in-out 1s both;
        }
      `}</style>

      {/* ── Sketch backdrop ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <img
          src="/images/clubhouse_sketch.jpg"
          alt=""
          aria-hidden="true"
          className="bbc-sketch-fade"
          style={{
            position: 'absolute',
            top: '73%',
            left: '50%',
            transform: 'translate(-50%, -50%) perspective(1200px) rotateY(-22deg)',
            width: '145%',
            opacity: 0.6,
          }}
        />
        {/* Radial gradient wash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, rgba(27,59,42,0.25) 0%, rgba(27,59,42,0.80) 65%, #1b3b2a 100%)',
          }}
        />
        {/* Sketch perspective — right side brighter */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to left, rgba(27,59,42,0) 0%, rgba(27,59,42,0.35) 50%, rgba(27,59,42,0.7) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Lower darkening — buttons area */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(8,24,15,0.75) 0%, rgba(8,24,15,0.4) 25%, transparent 55%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Stage ── */}
      <div
        className="stage"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '0 24px 48px',
        }}
      >
        {/* Crest */}
        <svg
          width="136"
          height="136"
          viewBox="0 0 136 136"
          fill="none"
          aria-hidden="true"
          style={{ marginBottom: '2rem' }}
        >
          <circle cx="68" cy="68" r="63" stroke="#b5924a" strokeWidth="1.5" />
          <circle cx="68" cy="68" r="56" stroke="#b5924a" strokeOpacity="0.3" strokeWidth="0.75" />
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
          <line x1="30" y1="44" x2="46" y2="44" stroke="#b5924a" strokeOpacity="0.35" strokeWidth="0.75" />
          <line x1="90" y1="44" x2="106" y2="44" stroke="#b5924a" strokeOpacity="0.35" strokeWidth="0.75" />
        </svg>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Libre Caslon Display', 'Playfair Display', serif",
            fontSize: 'clamp(52px, 6.5vw, 75px)',
            fontWeight: 400,
            color: '#f5f0e8',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Barnes Bowling Club
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#b5924a',
            margin: '16px 0 0',
          }}
        >
          SW13
        </p>

        {/* Gold rule */}
        <div
          style={{
            width: '64px',
            height: '1px',
            background: '#b5924a',
            opacity: 0.6,
            margin: '28px auto 0',
          }}
        />

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 'clamp(96px, 15vh, 168px)',
          }}
        >
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
          zIndex: 2,
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
