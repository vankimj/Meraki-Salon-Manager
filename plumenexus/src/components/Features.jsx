import { C, FONT, shadow, radius } from '../theme.js';
import Section from './Section.jsx';

const FEATURES = [
  {
    icon: '📅',
    title: 'Smart Scheduling',
    body: 'Drag-to-reschedule, recurring bookings, smart walk-in management, time-off blocks, store-hours guard. Every front-desk move you actually make — handled in one click.',
    accent: C.plum,
  },
  {
    icon: '👥',
    title: 'Client CRM',
    body: 'Profiles, full visit history, photos, social handles, notes, allergies, marketing preferences. Birthdays, lapsed-client alerts, and referral tracking — automatic.',
    accent: C.blue,
  },
  {
    icon: '💳',
    title: 'POS & Checkout',
    body: 'Multi-tech credit splits, tips per service, gift cards, promo codes, store credit, refunds with photos. Tap-to-Pay coming on iOS.',
    accent: C.teal,
  },
  {
    icon: '💬',
    title: 'Communications Hub',
    body: 'Two-way SMS + email in one threaded inbox. Per-client channel preferences. Inbound messages route to the right thread automatically — no more lost texts.',
    accent: C.gold,
  },
  {
    icon: '📣',
    title: 'Marketing Engine',
    body: 'Email + SMS campaigns with audience segmentation, AI-drafted copy, personalized promo codes, scheduled sends, real-time delivery analytics, and CAN-SPAM-compliant unsubscribe.',
    accent: C.plum,
  },
  {
    icon: '🎁',
    title: 'Gift Cards & Loyalty',
    body: 'Digital gift cards with auto-emailed delivery, points-per-dollar loyalty, tier perks, birthday bonuses. No extra fees — built into the platform.',
    accent: C.blue,
  },
  {
    icon: '📊',
    title: 'AI-Powered Reports',
    body: 'Revenue, leaderboards, IRS-ready tax exports, cancellation analysis, and a chatbot that answers any question about your salon data in plain English.',
    accent: C.teal,
  },
  {
    icon: '🎙️',
    title: 'Voice Commands',
    body: '"Book Emma Klein with Riley tomorrow at 2pm for a gel mani." Hands-free booking, rescheduling, and check-ins — straight from the front desk.',
    accent: C.plumDeep,
  },
  {
    icon: '👤',
    title: 'Employee & Payroll',
    body: 'Profiles, photos, social links, compensation models, performance reviews, 1099-NEC PDF export, Gusto sync. Per-tech earnings dashboards your team will love.',
    accent: C.gold,
  },
  {
    icon: '🌐',
    title: 'Online Booking',
    body: 'Public booking page, embeddable widget, magic-link self-service reschedule, geo check-in, post-visit Google review prompts. Your front desk works while you sleep.',
    accent: C.blue,
  },
  {
    icon: '🛍️',
    title: 'TipFlow Kiosk',
    body: 'A dedicated front-desk iPad mode for tip selection, queue display, and walk-in turn rotation. Custom branding per location.',
    accent: C.teal,
  },
  {
    icon: '🔐',
    title: 'Roles & Permissions',
    body: 'Admin, scheduler, tech, and read-only roles. View-as impersonation. PIN-locked HR & Reports. Verbose activity log on every action.',
    accent: C.plum,
  },
];

export default function Features() {
  return (
    <Section
      id="features"
      eyebrow="Everything in one place"
      title="The whole salon, on one platform."
      subtitle="Twelve modules, one login, one bill. Built to replace the patchwork of scheduling apps, marketing tools, and spreadsheets you've cobbled together."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 18,
      }}>
        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </Section>
  );
}

function FeatureCard({ icon, title, body, accent }) {
  return (
    <div style={{
      padding: 24,
      background: '#fff',
      border: `1px solid ${C.rule}`,
      borderRadius: radius.md,
      transition: 'transform .2s, box-shadow .2s, border-color .2s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = shadow.md;
        e.currentTarget.style.borderColor = accent + '40';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = C.rule;
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${accent}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 16,
      }}>{icon}</div>
      <h3 style={{
        fontFamily: FONT.body, fontSize: 17, fontWeight: 700,
        margin: '0 0 8px', color: C.ink, letterSpacing: '-.005em',
      }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, margin: 0 }}>{body}</p>
    </div>
  );
}
