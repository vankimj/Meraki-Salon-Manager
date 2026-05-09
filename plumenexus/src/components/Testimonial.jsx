import { C, FONT, radius } from '../theme.js';
import Section from './Section.jsx';

export default function Testimonial() {
  return (
    <Section>
      <div style={{
        maxWidth: 880, margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 88, lineHeight: 0.7, color: C.plumSoft,
          fontFamily: FONT.display, marginBottom: 4,
        }}>"</div>
        <blockquote style={{
          fontFamily: FONT.display, fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.4, fontWeight: 500, color: C.ink,
          margin: '0 0 28px', letterSpacing: '-.005em',
        }}>
          I'm a software engineer who bought a nail salon. After two years
          of stitching together half a dozen tools, I built what I actually
          needed. The Saturday morning it handled its first sick call —
          eight clients rebooked and two apology texts sent before I'd even
          parked the car — I knew I had to share it with other owners.
        </blockquote>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c4afe4, #8db9d8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: FONT.display, fontSize: 18, fontWeight: 600,
          }}>JV</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Jonathan VanKim</div>
            <div style={{ fontSize: 12, color: C.muted }}>Owner · Meraki Nail Studio · Columbus, OH</div>
          </div>
        </div>

        <div style={{
          marginTop: 56, display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '20px 56px',
        }}>
          <Stat n="10" label="Active techs" />
          <Stat n="600+" label="Active clients" />
          <Stat n="2,500+" label="Appointments scheduled" />
          <Stat n="99.99%" label="Uptime since launch" />
        </div>
      </div>
    </Section>
  );
}

function Stat({ n, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: FONT.display, fontSize: 32, fontWeight: 700,
        color: C.plum, lineHeight: 1, marginBottom: 4,
      }}>{n}</div>
      <div style={{ fontSize: 11, color: C.mutedSoft, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
