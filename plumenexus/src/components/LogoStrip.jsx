import { C } from '../theme.js';

// "Built for" credibility strip — anchors the platform across multi-industry positioning.
const TAGS = [
  'Hair Salons',
  'Nail Studios',
  'Med Spas',
  'Barbershops',
  'Brow & Lash',
  'Wellness Studios',
  'Tattoo Parlors',
  'Pet Grooming',
];

export default function LogoStrip() {
  return (
    <section style={{
      borderTop: `1px solid ${C.ruleSoft}`,
      borderBottom: `1px solid ${C.ruleSoft}`,
      padding: '34px 28px',
      background: '#fff',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '.12em',
          textTransform: 'uppercase', color: C.mutedSoft,
          marginBottom: 18,
        }}>
          One platform. Every personal-services business.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '14px 36px',
          fontSize: 15, fontWeight: 500,
          color: C.muted,
        }}>
          {TAGS.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.plumSoft }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
