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
        {/* Logo - Ziq with lightning bolt dotting the i */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            fontSize: '180px',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          <span>Z</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="80" height="120" viewBox="0 0 100 150" style={{ marginBottom: '-30px' }}>
              <path d="M 50 10 L 30 60 L 45 60 L 30 110 L 70 60 L 55 60 Z" fill="#22c55e"/>
            </svg>
            <span style={{ marginTop: '0' }}>q</span>
          </div>
        </div>
        
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
          Research in speed of thought
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
