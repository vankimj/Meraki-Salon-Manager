import { C, FONT, grad, shadow } from '../theme.js';
import Logo from './Logo.jsx';
import Footer from './Footer.jsx';

export default function NotFoundPage() {
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
          maxWidth: 1240, margin: '0 auto', padding: '14px 28px',
          display: 'flex', alignItems: 'center',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={32} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, letterSpacing: '.04em', fontSize: 17, color: C.ink }}>
              PLUME <span style={{ color: C.plum }}>NEXUS</span>
            </span>
          </a>
        </div>
      </header>

      <main style={{
        minHeight: 'calc(100vh - 360px)',
        background: `radial-gradient(900px 500px at 50% 20%, rgba(109,76,184,.08), transparent 70%), #fff`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '64px 28px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 540 }}>
          <div style={{
            fontFamily: FONT.display,
            fontSize: 'clamp(80px, 14vw, 140px)',
            fontWeight: 700,
            lineHeight: 1,
            background: grad.primary,
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            marginBottom: 14,
          }}>404</div>

          <h1 style={{
            fontFamily: FONT.display, fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 600, color: C.ink, margin: '0 0 14px',
            letterSpacing: '-.005em',
          }}>This page took the day off.</h1>

          <p style={{
            fontSize: 16, lineHeight: 1.6, color: C.muted,
            margin: '0 0 32px',
          }}>
            Either the link is wrong or we moved something. Either way,
            here's how to get back on the schedule:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <a href="/" style={{
              padding: '12px 24px', fontSize: 15, fontWeight: 600,
              color: '#fff', background: grad.primary,
              borderRadius: 999, textDecoration: 'none',
              boxShadow: shadow.brand,
            }}>← Back to home</a>
            <a href="/#contact" style={{
              padding: '12px 22px', fontSize: 15, fontWeight: 600,
              color: C.ink, background: '#fff',
              border: `1px solid ${C.rule}`, borderRadius: 999,
              textDecoration: 'none',
            }}>Contact us</a>
          </div>

          <div style={{
            marginTop: 48, paddingTop: 24,
            borderTop: `1px solid ${C.ruleSoft}`,
            fontSize: 13, color: C.mutedSoft,
          }}>
            Looking for something specific? Try{' '}
            <a href="/#features" style={{ color: C.plum, fontWeight: 500 }}>Features</a>,{' '}
            <a href="/#pricing" style={{ color: C.plum, fontWeight: 500 }}>Pricing</a>, or{' '}
            <a href="/#faq" style={{ color: C.plum, fontWeight: 500 }}>FAQ</a>.
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
