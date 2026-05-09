import { C } from '../theme.js';

// "Plume" feather + Nexus circuit-node monogram. Rendered as SVG so it scales.
export default function Logo({ size = 36, color }) {
  const grad = `pn-grad-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Plume Nexus" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color || C.plum} />
          <stop offset="100%" stopColor={color || C.blue} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${grad})`} />
      {/* Plume / drop silhouette */}
      <path
        d="M32 12 C24 24, 19 33, 19 42 C19 49, 24 53, 32 53 C40 53, 45 49, 45 42 C45 33, 40 24, 32 12 Z"
        fill="#fff"
        opacity="0.96"
      />
      {/* Nexus connecting node */}
      <circle cx="32" cy="42" r="3.5" fill={color || C.plum} />
      <circle cx="32" cy="42" r="6.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}
