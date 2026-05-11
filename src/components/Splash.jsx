import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { settings } = useApp();
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2600);
    const t2 = setTimeout(() => setGone(true),   3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: '#0f1923',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 0,
      opacity: fading ? 0 : 1,
      transition: 'opacity .7s ease',
      pointerEvents: fading ? 'none' : 'auto',
    }}>

      {/* Ambient gradient glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 520, height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(45,122,95,.28) 0%, rgba(61,149,206,.14) 50%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>

        <svg viewBox="0 0 120 120" width="200" height="200"
          style={{ marginBottom: 8, filter: 'drop-shadow(0 8px 24px rgba(91,59,140,.45))' }}>
          <defs>
            <radialGradient id="splash-camellia" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#c19a4a" stopOpacity="0.28" />
              <stop offset="55%"  stopColor="#a288c9" />
              <stop offset="100%" stopColor="#5b3b8c" />
            </radialGradient>
          </defs>
          <g fill="url(#splash-camellia)" opacity="0.96">
            <ellipse cx="60" cy="34" rx="14" ry="22"/>
            <g transform="rotate(72 60 60)"><ellipse cx="60" cy="34" rx="14" ry="22"/></g>
            <g transform="rotate(144 60 60)"><ellipse cx="60" cy="34" rx="14" ry="22"/></g>
            <g transform="rotate(216 60 60)"><ellipse cx="60" cy="34" rx="14" ry="22"/></g>
            <g transform="rotate(288 60 60)"><ellipse cx="60" cy="34" rx="14" ry="22"/></g>
          </g>
          <circle cx="60" cy="60" r="11" fill="#ffffff" opacity="0.95"/>
          <circle cx="60" cy="60" r="5"  fill="#c19a4a"/>
        </svg>

        <div style={{ position: 'relative', textAlign: 'center', userSelect: 'none' }}>

          {settings?.brandTaglineTop && (
            <div style={{
              fontFamily: '"Great Vibes", cursive',
              fontSize: 30,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1,
              marginBottom: -4,
              letterSpacing: '0.02em',
            }}>
              {settings.brandTaglineTop}
            </div>
          )}

          <div style={{
            fontFamily: '"Great Vibes", cursive',
            fontSize: 88,
            color: '#ffffff',
            lineHeight: 0.95,
            textShadow: '0 2px 24px rgba(91,59,140,.55), 0 0 48px rgba(61,149,206,.3)',
            letterSpacing: '0.01em',
          }}>
            {settings?.brandName || settings?.salonName || 'Plume Nexus'}
          </div>

          {settings?.brandTagline && (
            <>
              <div style={{ height: 14 }} />
              <div style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
              }}>
                {settings.brandTagline}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Bottom subtitle ── */}
      <div style={{
        marginTop: 28,
        fontFamily: '"Cinzel", serif',
        fontSize: 10,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        Salon Manager
      </div>

    </div>
  );
}
