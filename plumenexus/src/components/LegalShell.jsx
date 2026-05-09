import { C, FONT } from '../theme.js';
import Logo from './Logo.jsx';
import Footer from './Footer.jsx';

// Minimal shell for /terms and /privacy. Re-uses Footer; replaces full Nav
// with a slim top bar — these pages are read once, not navigated through.
export default function LegalShell({ title, lastUpdated, children }) {
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 60,
        background: 'rgba(255,255,255,.95)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: `1px solid ${C.rule}`,
      }}>
        <div style={{
          maxWidth: 880, margin: '0 auto', padding: '14px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={30} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, letterSpacing: '.04em', fontSize: 16, color: C.ink }}>
              PLUME <span style={{ color: C.plum }}>NEXUS</span>
            </span>
          </a>
          <a href="/" style={{
            fontSize: 13, color: C.muted, fontWeight: 500, textDecoration: 'none',
          }}>← Back to home</a>
        </div>
      </header>

      <main style={{ background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 28px 80px' }}>
          <h1 style={{
            fontFamily: FONT.display, fontSize: 'clamp(30px, 4vw, 44px)',
            margin: '0 0 8px', color: C.ink, fontWeight: 600, letterSpacing: '-.005em',
          }}>{title}</h1>
          <div style={{ fontSize: 13, color: C.mutedSoft, marginBottom: 40 }}>
            Last updated: {lastUpdated}
          </div>
          <div style={{
            fontSize: 15, lineHeight: 1.75, color: C.text,
          }} className="pn-legal-body">
            {children}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .pn-legal-body h2 {
          font-family: ${FONT.display};
          font-size: 22px;
          color: ${C.ink};
          font-weight: 600;
          margin: 36px 0 12px;
          letter-spacing: -.005em;
        }
        .pn-legal-body h3 {
          font-size: 16px;
          color: ${C.ink};
          font-weight: 700;
          margin: 22px 0 8px;
        }
        .pn-legal-body p {
          margin: 0 0 14px;
        }
        .pn-legal-body ul {
          padding-left: 22px;
          margin: 0 0 14px;
        }
        .pn-legal-body li {
          margin: 4px 0;
        }
        .pn-legal-body a {
          color: ${C.plum};
          font-weight: 500;
        }
        .pn-legal-body strong {
          color: ${C.ink};
        }
      `}</style>
    </>
  );
}
