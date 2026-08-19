import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const dimension = 180;
  const s = dimension / 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          background: '#1b3b2a',
          color: '#c9a84c',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 52 * s,
            top: 52 * s,
            width: 408 * s,
            height: 408 * s,
            border: `${7 * s}px solid #c9a84c`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 75 * s,
            top: 75 * s,
            width: 362 * s,
            height: 362 * s,
            border: `${4 * s}px solid rgba(201,168,76,.34)`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 161 * s,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            fontSize: 30 * s,
            fontWeight: 600,
            letterSpacing: 14 * s,
            opacity: .75,
          }}
        >
          EST
        </div>
        <div
          style={{
            position: 'absolute',
            top: 211 * s,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'serif',
            fontSize: 104 * s,
            fontWeight: 500,
            letterSpacing: 8 * s,
          }}
        >
          BBC
        </div>
        <div
          style={{
            position: 'absolute',
            top: 323 * s,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            fontSize: 34 * s,
            fontWeight: 300,
            letterSpacing: 8 * s,
            opacity: .85,
          }}
        >
          c·1725
        </div>
        <div style={{ position: 'absolute', left: 123 * s, top: 182 * s, width: 55 * s, height: 4 * s, background: 'rgba(201,168,76,.42)' }} />
        <div style={{ position: 'absolute', left: 334 * s, top: 182 * s, width: 55 * s, height: 4 * s, background: 'rgba(201,168,76,.42)' }} />
      </div>
    ),
    size,
  );
}
