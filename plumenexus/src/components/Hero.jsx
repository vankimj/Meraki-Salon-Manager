import { C, FONT, grad, shadow, radius } from '../theme.js';

export default function Hero() {
  return (
    <section id="top" style={{
      position: 'relative',
      paddingTop: 132,
      paddingBottom: 72,
      overflow: 'hidden',
      background: `radial-gradient(1200px 600px at 80% -10%, rgba(109,76,184,.12), transparent 60%),
                   radial-gradient(900px 500px at 0% 30%, rgba(61,149,206,.10), transparent 60%),
                   #fff`,
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: 56,
          alignItems: 'center',
        }} className="pn-hero-grid">

          {/* Copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(91,59,140,.08)',
              border: '1px solid rgba(91,59,140,.18)',
              fontSize: 12, fontWeight: 600, color: C.plumDeep,
              letterSpacing: '.04em', textTransform: 'uppercase',
              marginBottom: 22,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, boxShadow: '0 0 10px rgba(45,122,95,.7)' }} />
              In production · 10-tech salon · Live in Columbus, OH
            </div>

            <h1 style={{
              fontFamily: FONT.display, fontSize: 'clamp(38px, 5.5vw, 64px)',
              lineHeight: 1.05, letterSpacing: '-.01em',
              margin: '0 0 18px', color: C.ink, fontWeight: 700,
            }}>
              The salon platform <br />
              <span style={{
                background: grad.primary,
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent', color: 'transparent',
                fontFamily: FONT.script, fontWeight: 400, fontSize: '1.18em',
              }}>built by salon owners.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 1.6vw, 19px)', lineHeight: 1.6,
              color: C.muted, margin: '0 0 32px', maxWidth: 560,
            }}>
              Scheduling, POS, two-way client messaging, marketing, and AI-powered reporting —
              all in one operating system. Designed by a salon owner to run your front desk
              the way you actually run it.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
              <a href="#demo" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 26px', fontSize: 15, fontWeight: 600,
                color: '#fff', background: grad.primary,
                borderRadius: 999, textDecoration: 'none',
                boxShadow: shadow.brand,
                transition: 'transform .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Book a 20-min demo →
              </a>
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 24px', fontSize: 15, fontWeight: 600,
                color: C.ink, background: '#fff',
                border: `1px solid ${C.rule}`, borderRadius: 999,
                textDecoration: 'none',
              }}>
                Tour the platform
              </a>
            </div>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 22,
              fontSize: 13, color: C.mutedSoft,
            }}>
              <Stat label="Live by lunch · or we set it up free" />
              <Stat label="No third-party accounts to create" />
              <Stat label="Cancel anytime · keep your data" />
            </div>
          </div>

          {/* Visual: stylized product card */}
          <HeroVisual />
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .pn-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

function Stat({ label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: C.success, fontSize: 14 }}>✓</span>
      <span>{label}</span>
    </div>
  );
}

// High-fidelity Schedule UI mockup — designed to mirror the real Plume Nexus
// schedule module so the visual reads as a screenshot, not an illustration.
function HeroVisual() {
  const techs = [
    { name: 'Maya',   initials: 'MR', tint: '#e9e1f5', stroke: C.plum },
    { name: 'Riley',  initials: 'RK', tint: '#dceff1', stroke: C.teal },
    { name: 'Jordan', initials: 'JB', tint: '#fff1d6', stroke: C.gold },
    { name: 'Casey',  initials: 'CW', tint: '#fde8ee', stroke: '#d4576b' },
  ];
  const rows = [
    { t: '10:00', cells: [
      null,
      { svc: 'Gel Mani',     cli: 'Emma K.',     dur: '60m', $: '$48' },
      null,
      { svc: 'Pedicure',     cli: 'Olivia P.',   dur: '45m', $: '$38' },
    ]},
    { t: '10:30', cells: [
      { svc: 'Acrylic Set',  cli: 'Walk-in',     dur: '90m', $: '$75', vip: false },
      { svc: 'Gel Mani · cont.', cont: true },
      { svc: 'Spa Pedi',     cli: 'Sophia M.',   dur: '60m', $: '$58' },
      { svc: 'Pedicure · cont.', cont: true },
    ]},
    { t: '11:00', cells: [
      { svc: 'Acrylic · cont.', cont: true },
      null,
      { svc: 'Spa Pedi · cont.', cont: true },
      { svc: 'Gel Mani',    cli: 'VIP · Isabella R.', dur: '45m', $: '$48', vip: true },
    ]},
    { t: '11:30', cells: [
      null,
      { svc: 'Fill + Polish', cli: 'Zoe T.',      dur: '75m', $: '$62' },
      null,
      { svc: 'Gel Mani · cont.', cont: true },
    ]},
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: radius.lg,
        boxShadow: shadow.lg,
        border: `1px solid ${C.rule}`,
        overflow: 'hidden',
        transform: 'perspective(1400px) rotateY(-2.5deg) rotateX(1.5deg)',
        transformStyle: 'preserve-3d',
      }}>
        {/* Browser chrome */}
        <div style={{ background: '#f8f6fb', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${C.ruleSoft}` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          <div style={{ marginLeft: 14, padding: '4px 12px', background: '#fff', borderRadius: 6, fontSize: 11, color: C.mutedSoft, border: `1px solid ${C.ruleSoft}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: C.success }}>🔒</span> app.plumenexus.com/schedule
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.ruleSoft}`, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>Today · Thursday</div>
                <div style={{ fontSize: 10, color: C.mutedSoft, marginTop: 1 }}>May 8, 2026</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Metric label="Booked"  value="32" />
            <Metric label="Revenue" value="$1,847" hi />
            <Metric label="Open"    value="6" />
          </div>
        </div>

        {/* Tech column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '46px repeat(4, 1fr)', borderBottom: `1px solid ${C.ruleSoft}`, background: '#fcfbfd' }}>
          <div />
          {techs.map(t => (
            <div key={t.name} style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: t.tint, color: t.stroke,
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.initials}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink }}>{t.name}</div>
            </div>
          ))}
        </div>

        {/* Slot grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '46px repeat(4, 1fr)' }}>
          {rows.map((row, ri) => (
            <Row key={ri} time={row.t} cells={row.cells} techs={techs} />
          ))}
        </div>

        {/* AI notice */}
        <div style={{
          margin: '4px 14px 14px', padding: '10px 12px',
          background: 'linear-gradient(90deg, rgba(91,59,140,.07), rgba(61,149,206,.07))',
          borderRadius: 12, border: '1px solid rgba(91,59,140,.16)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 16 }}>✨</div>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.4, flex: 1 }}>
            <strong style={{ color: C.plumDeep }}>AI:</strong> Riley called in sick at 9:42 · 6 of 8 affected appts auto-covered.
          </div>
          <span style={{ fontSize: 10, color: C.plum, fontWeight: 700, whiteSpace: 'nowrap' }}>Draft texts →</span>
        </div>
      </div>

      {/* Floating chip — kiosk preview */}
      <div style={{
        position: 'absolute', bottom: -28, left: -22,
        background: '#fff', padding: '12px 16px',
        borderRadius: 14, boxShadow: shadow.md, border: `1px solid ${C.rule}`,
        display: 'flex', alignItems: 'center', gap: 10,
        transform: 'rotate(-3deg)',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: grad.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💳</div>
        <div>
          <div style={{ fontSize: 11, color: C.mutedSoft, fontWeight: 500 }}>Tip flow · iPad kiosk</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>$84.50 + 22% tip</div>
        </div>
      </div>

      {/* Floating chip — review */}
      <div style={{
        position: 'absolute', top: 12, right: -16,
        background: '#fff', padding: '10px 14px',
        borderRadius: 14, boxShadow: shadow.md, border: `1px solid ${C.rule}`,
        display: 'flex', alignItems: 'center', gap: 8,
        transform: 'rotate(3deg)',
      }}>
        <div style={{ fontSize: 14, color: C.gold }}>★★★★★</div>
        <div style={{ fontSize: 11, color: C.text }}>Posted to Google · 2m ago</div>
      </div>
    </div>
  );
}

function Metric({ label, value, hi }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9, color: C.mutedSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: hi ? C.success : C.ink, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

function Row({ time, cells, techs }) {
  return (
    <>
      <div style={{
        padding: '12px 10px', fontSize: 10, color: C.mutedSoft, fontWeight: 500,
        textAlign: 'right', borderTop: `1px solid ${C.ruleSoft}`,
        background: '#fcfbfd',
      }}>{time}</div>
      {cells.map((cell, i) => (
        <div key={i} style={{
          padding: 4,
          borderTop: `1px solid ${C.ruleSoft}`,
          borderLeft: `1px solid ${C.ruleSoft}`,
          minHeight: 56,
          position: 'relative',
        }}>
          {cell ? (
            cell.cont ? (
              <div style={{
                background: techs[i].tint,
                borderLeft: `3px solid ${techs[i].stroke}`,
                height: 'calc(100% - 4px)',
                marginTop: -4,
                opacity: 0.7,
              }} />
            ) : (
              <div style={{
                background: techs[i].tint,
                borderLeft: `3px solid ${techs[i].stroke}`,
                padding: '6px 8px', borderRadius: 5,
                fontSize: 10, color: C.text,
                height: 'calc(100% - 0px)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                  <div style={{ fontWeight: 700, color: techs[i].stroke, lineHeight: 1.2 }}>{cell.svc}</div>
                  {cell.$ && <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{cell.$}</div>}
                </div>
                <div style={{ color: C.muted, fontSize: 9, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {cell.vip && <span style={{ background: '#d4576b', color: '#fff', padding: '0 4px', borderRadius: 3, fontSize: 8, fontWeight: 700 }}>VIP</span>}
                  <span>{cell.cli}</span>
                  {cell.dur && <span style={{ color: C.mutedSoft }}>· {cell.dur}</span>}
                </div>
              </div>
            )
          ) : null}
        </div>
      ))}
    </>
  );
}
