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
        {/* Logo */}
        <svg viewBox="0 0 1024 512" width="500" height="250" xmlns="http://www.w3.org/2000/svg">
          {/* Z letter - white */}
          <path d="M 212 223 L 422 223 L 422 283 L 292 413 L 422 413 L 422 503 L 212 503 L 212 443 L 342 313 L 212 313 Z" fill="#ffffff"/>
          
          {/* Lightning bolt - green */}
          <path d="M 495 95 L 440 220 L 485 220 L 440 345 L 550 220 L 505 220 Z" fill="#22c55e"/>
          
          {/* Q letter - white with tail */}
          <path d="M 680 223 C 620 223 575 268 575 363 C 575 458 620 503 680 503 C 740 503 785 458 785 363 C 785 268 740 223 680 223 Z M 680 283 C 705 283 725 303 725 363 C 725 423 705 443 680 443 C 655 443 635 423 635 363 C 635 303 655 283 680 283 Z" fill="#ffffff"/>
          {/* Q tail */}
          <path d="M 710 420 L 785 503" stroke="#ffffff" strokeWidth="50" strokeLinecap="round" fill="none"/>
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
