import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Ziq - Research in speed of thought';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          padding: '80px',
        }}
      >
        {/* Logo - Ziq with lightning bolt above the I */}
        <svg width="480" height="240" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Z letter - white */}
          <path
            d="M 10 15 L 70 15 L 70 30 L 30 70 L 70 70 L 70 90 L 10 90 L 10 75 L 50 35 L 10 35 Z"
            fill="#ffffff"
          />
          
          {/* Green lightning bolt - positioned above I */}
          <path
            d="M 115 -10 L 85 15 L 98 15 L 80 35 L 115 10 L 102 10 Z"
            fill="#22c55e"
          />
          
          {/* I letter - white rectangle */}
          <path
            d="M 85 38 L 115 38 L 115 90 L 85 90 Z"
            fill="#ffffff"
          />
          
          {/* Q letter - white circle with diagonal stem */}
          <path
            d="M 165 15 C 145 15 130 30 130 52.5 C 130 75 145 90 165 90 C 185 90 200 75 200 52.5 C 200 30 185 15 165 15 Z M 165 33 C 173 33 180 40 180 52.5 C 180 65 173 72 165 72 C 157 72 150 65 150 52.5 C 150 40 157 33 165 33 Z"
            fill="#ffffff"
          />
          {/* Q stem - diagonal tail */}
          <path
            d="M 172 65 L 195 90"
            stroke="#ffffff"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        
        {/* Tagline */}
        <div
          style={{
            marginTop: '40px',
            fontSize: '48px',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          Think it. Find it. Cite it.
        </div>
        
        {/* Description */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '28px',
            color: '#a3a3a3',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          AI-powered search across X, Reddit, YouTube, research papers, and the web
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
