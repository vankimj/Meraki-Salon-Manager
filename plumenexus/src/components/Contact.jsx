import { useState } from 'react';
import { C, FONT, grad, shadow, radius } from '../theme.js';
import Section from './Section.jsx';
import { callContactInquiry } from '../lib/firebase.js';

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', salon: '', staff: '', message: '',
    // Honeypot — bots fill this; humans don't see it
    website: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error,  setError]  = useState('');

  function update(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (form.website) {
      // honeypot tripped — pretend we sent
      setStatus('sent');
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Name, email, and a short message are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError('That email address looks off — please double-check.');
      return;
    }

    setStatus('sending');
    try {
      await callContactInquiry({
        name:    form.name.trim(),
        email:   form.email.trim(),
        salon:   form.salon.trim(),
        staff:   form.staff.trim(),
        message: form.message.trim(),
      });
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(err?.message || 'Something went wrong. Please try again or email jvankim@gmail.com directly.');
    }
  }

  return (
    <Section
      id="contact"
      eyebrow="Get in touch"
      title="Let's talk."
      subtitle="Tell us about your salon. We'll get back within one business day with a custom demo plan."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)',
        gap: 56,
        maxWidth: 1080, margin: '0 auto',
        alignItems: 'start',
      }} className="pn-contact-grid">

        {/* Left rail — alt contact channels */}
        <div>
          <h3 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 600, margin: '0 0 22px', color: C.ink }}>
            Other ways to reach us
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ContactRow icon="✉️"
              label="Email"
              value="hello@plumenexus.com"
              href="mailto:hello@plumenexus.com" />
            <ContactRow icon="📞"
              label="Phone"
              value="Schedule via demo"
              hint="Calendar booking after your inquiry."
            />
            <ContactRow icon="💬"
              label="Live chat"
              value="Bottom-right of every page"
              hint="AI handles 90% — escalates to founder for the rest."
            />
            <ContactRow icon="📍"
              label="Based in"
              value="Columbus, Ohio"
              hint="Built and tested at Meraki Nail Studio."
            />
          </div>

          <div style={{
            marginTop: 32, padding: '20px 22px',
            background: C.bgSoft, borderRadius: radius.md,
            border: `1px solid ${C.rule}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.plum, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Founder direct</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>
              Plume Nexus is small enough that the founder still answers email himself.
              Worth saying out loud, because most of our competitors stopped doing this years ago.
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{
          background: '#fff',
          border: `1px solid ${C.rule}`,
          borderRadius: radius.lg,
          padding: 28,
          boxShadow: shadow.md,
        }}>
          {status === 'sent' ? (
            <div style={{ padding: '40px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
              <h3 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 600, margin: '0 0 10px', color: C.ink }}>
                Got it — thanks for reaching out.
              </h3>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                Jonathan will personally reply within one business day.<br />
                Keep an eye on your inbox (and your spam folder, just in case).
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="pn-form-row">
                <Field label="Your name *" value={form.name} onChange={update('name')} placeholder="Your name" />
                <Field label="Email *" type="email" value={form.email} onChange={update('email')} placeholder="sarah@yoursalon.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 14 }} className="pn-form-row">
                <Field label="Salon / business name" value={form.salon} onChange={update('salon')} placeholder="Sarah's Beauty Bar" />
                <Field label="# of staff" value={form.staff} onChange={update('staff')} placeholder="e.g. 4" />
              </div>
              <Field label="What can we help with? *" value={form.message} onChange={update('message')} placeholder="Tell us about your current setup and what you're hoping to fix..." textarea />

              {/* Honeypot — visually hidden, scraped by bots */}
              <input type="text" name="website" autoComplete="off" tabIndex={-1}
                value={form.website} onChange={update('website')}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  borderRadius: 10, fontSize: 13, color: '#b91c1c',
                }}>{error}</div>
              )}

              <button type="submit" disabled={status === 'sending'} style={{
                marginTop: 20, width: '100%',
                padding: '14px 20px', fontSize: 15, fontWeight: 600,
                color: '#fff', background: status === 'sending' ? C.plumSoft : grad.primary,
                border: 'none', borderRadius: 999,
                cursor: status === 'sending' ? 'default' : 'pointer',
                fontFamily: FONT.body,
                boxShadow: shadow.brand,
                transition: 'transform .12s',
              }}
                onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {status === 'sending' ? 'Sending…' : 'Send inquiry →'}
              </button>

              <div style={{ marginTop: 12, fontSize: 11.5, color: C.mutedSoft, textAlign: 'center' }}>
                We use your info only to reply. We never sell or share contact data.
              </div>
            </>
          )}
        </form>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .pn-contact-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pn-form-row     { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

function ContactRow({ icon, label, value, hint, href }) {
  const inner = (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${C.plum}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.mutedSoft, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{value}</div>
        {hint && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{hint}</div>}
      </div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: 'none' }}>{inner}</a> : <div>{inner}</div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', textarea }) {
  const baseStyle = {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    fontFamily: FONT.body,
    color: C.ink,
    background: '#fff',
    border: `1px solid ${C.rule}`,
    borderRadius: 10,
    outline: 'none',
    transition: 'border-color .12s, box-shadow .12s',
  };
  const onFocus = (e) => { e.target.style.borderColor = C.plum; e.target.style.boxShadow = `0 0 0 3px ${C.plum}20`; };
  const onBlur  = (e) => { e.target.style.borderColor = C.rule; e.target.style.boxShadow = 'none'; };

  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder}
          rows={5}
          onFocus={onFocus} onBlur={onBlur}
          style={{ ...baseStyle, resize: 'vertical', minHeight: 110, lineHeight: 1.5 }} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={onFocus} onBlur={onBlur}
          style={baseStyle} />
      )}
    </label>
  );
}
