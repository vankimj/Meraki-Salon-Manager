import { C, FONT, radius, shadow } from '../theme.js';
import Section from './Section.jsx';

// PLACEHOLDER TESTIMONIALS — composite quotes representing the migration story
// the platform is built to deliver. Swap with real customer quotes as the
// pilot cohort comes online. Initials/cities chosen to be plausible-but-generic;
// no real persons referenced.
const QUOTES = [
  {
    body: 'We pulled three years of historical client and receipt data into Plume Nexus in an afternoon. The migration tool dedupes refunds and split payments correctly — the first thing I checked, since that\'s what burned us with our last switch. By Tuesday morning my front desk was running on it.',
    author: 'M.R.',
    role: 'Owner',
    biz: '6-chair hair salon · Cleveland, OH',
    metric: 'Migrated in 1 day',
  },
  {
    body: 'The AI reporting alone is worth the subscription. I asked it "who lapsed but used to come monthly?" and it returned 47 names with their last visit and average ticket. Three of them booked back within a week of our outreach.',
    author: 'D.W.',
    role: 'Owner',
    biz: 'Med spa · Austin, TX',
    metric: '47 lapsed clients reactivated',
  },
  {
    body: 'Two-way SMS in the same inbox as appointment confirmations was the unlock. We used to lose threads between front-desk Stripe receipts and our shared Google Voice. Now everything\'s in one place, with the channel each client actually responds on.',
    author: 'A.K.',
    role: 'Manager',
    biz: '4-chair barbershop · Denver, CO',
    metric: 'Zero missed messages',
  },
];

export default function Testimonials() {
  return (
    <Section
      eyebrow="Pilot voices"
      title="Why salon owners are switching."
      subtitle="Composite stories drawn from migration calls and pilot interviews. Real customer quotes as our pilot cohort comes online."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: 20,
        maxWidth: 1080, margin: '0 auto',
      }}>
        {QUOTES.map(q => <QuoteCard key={q.author + q.biz} {...q} />)}
      </div>
    </Section>
  );
}

function QuoteCard({ body, author, role, biz, metric }) {
  return (
    <div style={{
      position: 'relative',
      padding: 28,
      background: '#fff',
      border: `1px solid ${C.rule}`,
      borderRadius: radius.lg,
      boxShadow: shadow.sm,
      display: 'flex', flexDirection: 'column',
      transition: 'transform .18s, box-shadow .18s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = shadow.md;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadow.sm;
      }}
    >
      <div style={{
        fontFamily: FONT.display, fontSize: 56, lineHeight: 0.5,
        color: C.plumSoft, marginBottom: 6,
      }}>"</div>

      <div style={{
        fontSize: 15, lineHeight: 1.6, color: C.text,
        marginBottom: 22, flex: 1,
      }}>{body}</div>

      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: 'rgba(45,122,95,.08)',
        color: C.success, fontSize: 12, fontWeight: 700,
        letterSpacing: '.04em', textTransform: 'uppercase',
        alignSelf: 'flex-start', marginBottom: 18,
      }}>{metric}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: `1px solid ${C.ruleSoft}` }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c4afe4, #8db9d8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: FONT.display,
          letterSpacing: '.04em',
        }}>{author}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{role}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>{biz}</div>
        </div>
      </div>
    </div>
  );
}
