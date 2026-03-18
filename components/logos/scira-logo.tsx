export function SciraLogo({
  className,
  width,
  height,
  color = 'currentColor',
}: {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={width}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Z letter - bold and modern */}
      <path
        d="M 10 15 L 70 15 L 70 30 L 30 70 L 70 70 L 70 90 L 10 90 L 10 75 L 50 35 L 10 35 Z"
        fill={color}
      />
      
      {/* Green lightning bolt - positioned above I like a dot (with space, more traditional shape, larger) */}
      <path
        d="M 115 -10 L 85 15 L 98 15 L 80 35 L 115 10 L 102 10 Z"
        fill="#22c55e"
      />
      
      {/* I letter - bold rectangle (starts lower to create more space from lightning bolt) */}
      <path
        d="M 85 38 L 115 38 L 115 90 L 85 90 Z"
        fill={color}
      />
      
      {/* Q letter - circle with diagonal stem */}
      <path
        d="M 165 15 C 145 15 130 30 130 52.5 C 130 75 145 90 165 90 C 185 90 200 75 200 52.5 C 200 30 185 15 165 15 Z M 165 33 C 173 33 180 40 180 52.5 C 180 65 173 72 165 72 C 157 72 150 65 150 52.5 C 150 40 157 33 165 33 Z"
        fill={color}
      />
      {/* Q stem - diagonal tail */}
      <path
        d="M 172 65 L 195 90"
        stroke={color}
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
