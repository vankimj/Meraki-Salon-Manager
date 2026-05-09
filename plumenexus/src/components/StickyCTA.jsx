import { useEffect, useState } from 'react';
import { C, FONT, grad, shadow } from '../theme.js';

// Slim sticky bar that fades in once the user has scrolled past the Hero.
// Hides itself near the very bottom of the page so it doesn't sit on top of
// the Footer, and stays out of the way of the chat widget.
export default function StickyCTA() {
  const [visible, setVisible]   = useState(false);
  const [dismissed, setDismiss] = useState(false);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = y + winH > docH - 600;
      // Show after ~1 viewport scroll, hide near bottom (footer/contact territory)
      setVisible(y > winH * 0.9 && !nearBottom);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label="Quick demo CTA"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 24,
        transform: visible ? 'translate(-50%, 0)' : 'translate(-50%, 120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform .35s cubic-bezier(.34, 1.4, .64, 1), opacity .25s',
        zIndex: 70,
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: 'calc(100vw - 100px)',
      }}
      className="pn-sticky-cta"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px 10px 18px',
        background: '#0f1923',
        color: '#fff',
        borderRadius: 999,
        boxShadow: '0 16px 40px rgba(15,25,35,.32), 0 4px 12px rgba(15,25,35,.18)',
        border: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: grad.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>✨</div>
        <div style={{
          fontSize: 13, fontWeight: 500, lineHeight: 1.3,
          fontFamily: FONT.body,
        }} className="pn-sticky-copy">
          See Plume Nexus on real data.
          <span style={{ color: 'rgba(255,255,255,.55)', marginLeft: 6 }}>20 min · with the founder</span>
        </div>
        <a href="#demo" style={{
          padding: '8px 18px', fontSize: 13, fontWeight: 600,
          color: '#0f1923', background: '#fff', borderRadius: 999,
          textDecoration: 'none', whiteSpace: 'nowrap',
          transition: 'transform .12s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >Book →</a>
        <button
          onClick={() => setDismiss(true)}
          aria-label="Dismiss demo prompt"
          style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,.5)',
            fontSize: 16, cursor: 'pointer', padding: '4px 6px',
            transition: 'color .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
        >×</button>
      </div>

      <style>{`
        @media (max-width: 540px) {
          .pn-sticky-copy { display: none; }
          .pn-sticky-cta  { left: 16px !important; transform: ${visible ? 'translateX(0)' : 'translateX(-130%)'} !important; }
        }
      `}</style>
    </div>
  );
}
