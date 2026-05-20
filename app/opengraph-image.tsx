import { ImageResponse } from 'next/og';

export const alt = 'Healthy with Diet — Food Science, Nutrition & Education';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#faf8f1',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-40px',
            width: '320px',
            height: '320px',
            display: 'flex',
            opacity: 0.18,
          }}
        >
          <svg width="320" height="320" viewBox="0 0 200 220">
            <g
              stroke="#507d2a"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M100 210 C 100 180, 100 130, 100 60" />
              <path
                d="M100 170 C 80 160, 60 150, 50 130 C 70 130, 90 145, 100 170 Z"
                fill="#507d2a"
                fillOpacity="0.5"
              />
              <path
                d="M100 140 C 120 130, 140 120, 150 100 C 130 100, 110 115, 100 140 Z"
                fill="#507d2a"
                fillOpacity="0.5"
              />
              <path
                d="M100 110 C 78 102, 58 92, 50 70 C 72 72, 92 86, 100 110 Z"
                fill="#507d2a"
                fillOpacity="0.4"
              />
              <path
                d="M100 85 C 120 76, 140 66, 148 44 C 128 44, 110 60, 100 85 Z"
                fill="#507d2a"
                fillOpacity="0.4"
              />
            </g>
          </svg>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#507d2a',
            fontWeight: 700,
          }}
        >
          Healthy with Diet
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 78,
            color: '#1a1f15',
            lineHeight: 1.05,
            letterSpacing: -1,
            marginTop: 32,
            maxWidth: 880,
          }}
        >
          Practical food science for real Nigerian kitchens.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            fontSize: 22,
            color: '#5c6358',
          }}
        >
          <span style={{ marginRight: 16 }}>Recipes</span>
          <span style={{ color: '#c19236', marginRight: 16 }}>·</span>
          <span style={{ marginRight: 16 }}>Nutrition</span>
          <span style={{ color: '#c19236', marginRight: 16 }}>·</span>
          <span style={{ marginRight: 16 }}>Catering</span>
          <span style={{ color: '#c19236', marginRight: 16 }}>·</span>
          <span>Food Business</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
