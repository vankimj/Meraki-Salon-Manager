// Plume Nexus brand mark: a 5-petal camellia with a gold pistil center.
// Original artwork — generic floral, no third-party trademarks.
export default function Logo({ size = 36 }) {
  const grad = `pn-camellia-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Plume Nexus" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={grad} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c19a4a" stopOpacity="0.28" />
          <stop offset="55%"  stopColor="#a288c9" />
          <stop offset="100%" stopColor="#5b3b8c" />
        </radialGradient>
      </defs>
      <g fill={`url(#${grad})`} opacity="0.96">
        <ellipse cx="32" cy="18" rx="7.5" ry="11.7"/>
        <g transform="rotate(72 32 32)"><ellipse cx="32" cy="18" rx="7.5" ry="11.7"/></g>
        <g transform="rotate(144 32 32)"><ellipse cx="32" cy="18" rx="7.5" ry="11.7"/></g>
        <g transform="rotate(216 32 32)"><ellipse cx="32" cy="18" rx="7.5" ry="11.7"/></g>
        <g transform="rotate(288 32 32)"><ellipse cx="32" cy="18" rx="7.5" ry="11.7"/></g>
      </g>
      <circle cx="32" cy="32" r="5.9" fill="#ffffff" opacity="0.95"/>
      <circle cx="32" cy="32" r="2.7" fill="#c19a4a"/>
    </svg>
  );
}
