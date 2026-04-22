import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontSize: '130px',
          fontWeight: 700,
          color: '#000000',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
