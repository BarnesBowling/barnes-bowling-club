'use client';

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

        .bbc-sketch path {
          fill: none;
          stroke: rgba(245,240,232,0.22);
          stroke-width: 1px;
          stroke-dasharray: 10000;
          stroke-dashoffset: 10000;
          animation: drawPath 1.5s ease-in-out forwards;
        }
        .bbc-sketch path:first-child {
          stroke-width: 1.8px;
          animation-duration: 2.5s;
          animation-delay: 0s;
        }
        .bbc-sketch path:nth-child(2) { animation-delay: 0.05s; }
        .bbc-sketch path:nth-child(3) { animation-delay: 0.1s; }
        .bbc-sketch path:nth-child(4) { animation-delay: 0.15s; }
        .bbc-sketch path:nth-child(5) { animation-delay: 0.2s; }
        .bbc-sketch path:nth-child(6) { animation-delay: 0.25s; }
        .bbc-sketch path:nth-child(7) { animation-delay: 0.3s; }
        .bbc-sketch path:nth-child(8) { animation-delay: 0.35s; }
        .bbc-sketch path:nth-child(9) { animation-delay: 0.4s; }
        .bbc-sketch path:nth-child(10) { animation-delay: 0.45s; }
        .bbc-sketch path:nth-child(11) { animation-delay: 0.5s; }
        .bbc-sketch path:nth-child(12) { animation-delay: 0.55s; }
        .bbc-sketch path:nth-child(13) { animation-delay: 0.6s; }
        .bbc-sketch path:nth-child(14) { animation-delay: 0.65s; }
        .bbc-sketch path:nth-child(15) { animation-delay: 0.7s; }
        .bbc-sketch path:nth-child(16) { animation-delay: 0.75s; }
        .bbc-sketch path:nth-child(17) { animation-delay: 0.8s; }
        .bbc-sketch path:nth-child(18) { animation-delay: 0.85s; }
        .bbc-sketch path:nth-child(19) { animation-delay: 0.9s; }
        .bbc-sketch path:nth-child(20) { animation-delay: 0.95s; }
        .bbc-sketch path:nth-child(21) { animation-delay: 1.0s; }
        .bbc-sketch path:nth-child(22) { animation-delay: 1.05s; }
        .bbc-sketch path:nth-child(23) { animation-delay: 1.1s; }
        .bbc-sketch path:nth-child(24) { animation-delay: 1.15s; }
        .bbc-sketch path:nth-child(25) { animation-delay: 1.2s; }
        .bbc-sketch path:nth-child(26) { animation-delay: 1.25s; }
        .bbc-sketch path:nth-child(27) { animation-delay: 1.3s; }
        .bbc-sketch path:nth-child(28) { animation-delay: 1.35s; }
        .bbc-sketch path:nth-child(29) { animation-delay: 1.4s; }
        .bbc-sketch path:nth-child(30) { animation-delay: 1.45s; }
        .bbc-sketch path:nth-child(31) { animation-delay: 1.5s; }
        .bbc-sketch path:nth-child(32) { animation-delay: 1.55s; }
        .bbc-sketch path:nth-child(33) { animation-delay: 1.6s; }
        .bbc-sketch path:nth-child(34) { animation-delay: 1.65s; }
        .bbc-sketch path:nth-child(35) { animation-delay: 1.7s; }
        .bbc-sketch path:nth-child(36) { animation-delay: 1.75s; }
        .bbc-sketch path:nth-child(37) { animation-delay: 1.8s; }
        .bbc-sketch path:nth-child(38) { animation-delay: 1.85s; }
        .bbc-sketch path:nth-child(39) { animation-delay: 1.9s; }
        .bbc-sketch path:nth-child(40) { animation-delay: 1.95s; }
        .bbc-sketch path:nth-child(41) { animation-delay: 2.0s; }
        .bbc-sketch path:nth-child(42) { animation-delay: 2.05s; }
        .bbc-sketch path:nth-child(43) { animation-delay: 2.1s; }
        .bbc-sketch path:nth-child(44) { animation-delay: 2.15s; }
        .bbc-sketch path:nth-child(45) { animation-delay: 2.2s; }
        .bbc-sketch path:nth-child(46) { animation-delay: 2.25s; }
        .bbc-sketch path:nth-child(47) { animation-delay: 2.3s; }
        .bbc-sketch path:nth-child(48) { animation-delay: 2.35s; }
        .bbc-sketch path:nth-child(49) { animation-delay: 2.4s; }
        .bbc-sketch path:nth-child(50) { animation-delay: 2.45s; }
        .bbc-sketch path:nth-child(51) { animation-delay: 2.5s; }
        .bbc-sketch path:nth-child(52) { animation-delay: 2.55s; }
        .bbc-sketch path:nth-child(53) { animation-delay: 2.6s; }
        .bbc-sketch path:nth-child(54) { animation-delay: 2.65s; }
        .bbc-sketch path:nth-child(55) { animation-delay: 2.7s; }
        .bbc-sketch path:nth-child(56) { animation-delay: 2.75s; }
        .bbc-sketch path:nth-child(57) { animation-delay: 2.8s; }
        .bbc-sketch path:nth-child(58) { animation-delay: 2.85s; }
        .bbc-sketch path:nth-child(59) { animation-delay: 2.9s; }
        .bbc-sketch path:nth-child(60) { animation-delay: 2.95s; }
        .bbc-sketch path:nth-child(61) { animation-delay: 3.0s; }
        .bbc-sketch path:nth-child(62) { animation-delay: 3.05s; }
        .bbc-sketch path:nth-child(63) { animation-delay: 3.1s; }
        .bbc-sketch path:nth-child(64) { animation-delay: 3.15s; }
        .bbc-sketch path:nth-child(65) { animation-delay: 3.2s; }
        .bbc-sketch path:nth-child(66) { animation-delay: 3.25s; }
        .bbc-sketch path:nth-child(67) { animation-delay: 3.3s; }
        .bbc-sketch path:nth-child(68) { animation-delay: 3.35s; }
        .bbc-sketch path:nth-child(69) { animation-delay: 3.4s; }
        .bbc-sketch path:nth-child(70) { animation-delay: 3.45s; }
        .bbc-sketch path:nth-child(71) { animation-delay: 3.5s; }
        .bbc-sketch path:nth-child(72) { animation-delay: 3.55s; }
        .bbc-sketch path:nth-child(73) { animation-delay: 3.6s; }
        .bbc-sketch path:nth-child(74) { animation-delay: 3.65s; }
        .bbc-sketch path:nth-child(75) { animation-delay: 3.7s; }
        .bbc-sketch path:nth-child(76) { animation-delay: 3.75s; }
        .bbc-sketch path:nth-child(77) { animation-delay: 3.8s; }
        .bbc-sketch path:nth-child(78) { animation-delay: 3.85s; }
        .bbc-sketch path:nth-child(79) { animation-delay: 3.9s; }
        .bbc-sketch path:nth-child(80) { animation-delay: 3.95s; }
        .bbc-sketch path:nth-child(81) { animation-delay: 4.0s; }
        .bbc-sketch path:nth-child(82) { animation-delay: 4.05s; }
        .bbc-sketch path:nth-child(83) { animation-delay: 4.1s; }
        .bbc-sketch path:nth-child(84) { animation-delay: 4.15s; }
        .bbc-sketch path:nth-child(85) { animation-delay: 4.2s; }
        .bbc-sketch path:nth-child(86) { animation-delay: 4.25s; }
        .bbc-sketch path:nth-child(87) { animation-delay: 4.3s; }
        .bbc-sketch path:nth-child(88) { animation-delay: 4.35s; }
        .bbc-sketch path:nth-child(89) { animation-delay: 4.4s; }
        .bbc-sketch path:nth-child(90) { animation-delay: 4.45s; }
        .bbc-sketch path:nth-child(91) { animation-delay: 4.5s; }
        .bbc-sketch path:nth-child(92) { animation-delay: 4.55s; }
        .bbc-sketch path:nth-child(93) { animation-delay: 4.6s; }
        .bbc-sketch path:nth-child(94) { animation-delay: 4.65s; }
        .bbc-sketch path:nth-child(95) { animation-delay: 4.7s; }
        .bbc-sketch path:nth-child(96) { animation-delay: 4.75s; }
        .bbc-sketch path:nth-child(97) { animation-delay: 4.8s; }
      `}</style>

      {/* ── Sketch backdrop ── */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/images/clubhouse_sketch.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 46%',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/images/clubhouse_sketch.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 46%',
          opacity: 0.25,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: "url('/images/clubhouse_sketch.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 46%',
          opacity: 0.12,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to left, rgba(27,59,42,0) 0%, rgba(27,59,42,0.35) 50%, rgba(27,59,42,0.7) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to top, rgba(8,24,15,0.75) 0%, rgba(8,24,15,0.4) 25%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* ── Stage ── */}
      <div

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
