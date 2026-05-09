import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  createService, createEmployee,
} from '../lib/firestore';
import { logActivity } from '../lib/logger';
import { SERVICE_TEMPLATES, TEMPLATE_DEFAULTS } from '../data/serviceTemplates';

// First-login setup wizard for a brand-new tenant. Detected and triggered
// from App.jsx when the signed-in admin's tenant has < 3 services and < 1
// active employee (the "you're staring at an empty system" state).
//
// Six steps:
//   1. Welcome
//   2. Brand: name, color, tagline (writes to settings)
//   3. Services: pick a template + bulk-create
//   4. Employees: add the first techs (name + email) inline
//   5. Hours: per-day open/close (writes to settings.storeHours)
//   6. Done — link out to next things
//
// Owner can skip any step; each save writes immediately so we never lose
// progress if the wizard is closed mid-flow.
export default function FirstLoginWizard({ onClose }) {
  const { settings, updateSettings, gUser, showToast } = useApp();
  const [step, setStep] = useState(0);

  // Step 2 — branding
  const [brandName,    setBrandName]    = useState(settings.brandName    || '');
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline || '');
  const [brandColor,   setBrandColor]   = useState(settings.brandColor   || '#2D7A5F');

  // Step 3 — service template
  const [templateId, setTemplateId] = useState(null);
  const [templateImporting, setTemplateImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Step 4 — first employees
  const [techs, setTechs] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ]);
  const [techsSaving, setTechsSaving] = useState(false);
  const [techsSavedCount, setTechsSavedCount] = useState(0);

  // Step 5 — hours
  const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const initialHours = {};
  WEEK_DAYS.forEach(d => {
    initialHours[d] = settings.storeHours?.[d] || { open: '10:00', close: '18:00', closed: d === 'Sun' };
  });
  const [hours, setHours] = useState(initialHours);
  const [hoursSaving, setHoursSaving] = useState(false);

  async function saveBrand() {
    await updateSettings({
      ...settings,
      brandName: brandName.trim() || null,
      brandTagline: brandTagline.trim() || null,
      brandColor: brandColor || '#2D7A5F',
    });
    logActivity('onboarding_brand_saved', `${brandName || '(no name)'}`);
  }

  async function importTemplate() {
    if (!templateId) return;
    setTemplateImporting(true);
    try {
      const tpl = SERVICE_TEMPLATES.find(t => t.id === templateId);
      if (!tpl) return;
      let count = 0;
      for (const svc of tpl.services) {
        await createService({ ...TEMPLATE_DEFAULTS, ...svc });
        count++;
      }
      setImportedCount(count);
      logActivity('onboarding_services_imported', `${count}× from "${tpl.label}" template`);
      showToast(`${count} services added`);
    } finally {
      setTemplateImporting(false);
    }
  }

  async function saveTechs() {
    const valid = techs.filter(t => t.name.trim());
    if (valid.length === 0) return;
    setTechsSaving(true);
    try {
      let count = 0;
      for (const t of valid) {
        await createEmployee({
          name: t.name.trim(),
          email: (t.email || '').trim().toLowerCase() || null,
          active: true,
          serviceIds: [],
          createdBy: gUser?.email || null,
        });
        count++;
      }
      setTechsSavedCount(count);
      logActivity('onboarding_employees_added', `${count} techs`);
      showToast(`${count} team member${count === 1 ? '' : 's'} added`);
    } finally {
      setTechsSaving(false);
    }
  }

  async function saveHours() {
    setHoursSaving(true);
    try {
      await updateSettings({
        ...settings,
        storeHours: hours,
        apptHours: settings.apptHours || { open: '09:00', close: '20:00' },
      });
      logActivity('onboarding_hours_saved', '');
    } finally {
      setHoursSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────
  const Frame = ({ title, body, footer }) => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,25,35,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '94%', maxWidth: 560, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.3)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #5b3b8c 0%, #4a8dc1 100%)', color: '#fff',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .85 }}>
              Setup · Step {Math.min(step + 1, 6)} of 6
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
          </div>
          <button onClick={onClose} title="Close — you can finish later"
            style={{ background: 'rgba(255,255,255,.18)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', fontSize: 16, cursor: 'pointer' }}>
            ×
          </button>
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: '#f0ecf5' }}>
          <div style={{ height: '100%', width: `${((step + 1) / 6) * 100}%`, background: '#5b3b8c', transition: 'width .25s' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{body}</div>
        <div style={{ borderTop: '1px solid #f0ecf5', padding: '14px 24px', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {footer}
        </div>
      </div>
    </div>
  );

  // STEP 0 — Welcome
  if (step === 0) return (
    <Frame
      title="Welcome to your salon"
      body={
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
            Let's get you up and running.
          </div>
          <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            Five quick steps — about <strong>10 minutes</strong>:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18, textAlign: 'left', maxWidth: 380, margin: '18px auto 0' }}>
            {[
              ['🏷️', 'Brand it', 'Salon name, color, tagline'],
              ['💅', 'Pick a service menu', 'Start from a template — edit later'],
              ['👥', 'Add your team', 'First few techs (you can add more anytime)'],
              ['🕐', 'Set store hours', 'When you\'re open'],
              ['✓', "You're done", 'Start booking right away'],
            ].map(([i, t, s], idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8f5fc', borderRadius: 10 }}>
                <div style={{ fontSize: 22 }}>{i}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{t}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          <button onClick={onClose} style={btnGhost}>Skip — I'll set up later</button>
          <button onClick={() => setStep(1)} style={btnPrimary}>Let's go →</button>
        </>
      }
    />
  );

  // STEP 1 — Brand
  if (step === 1) return (
    <Frame
      title="Make it yours"
      body={
        <div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.55 }}>
            This shows up on your booking page, receipts, and emails to clients. You can change it anytime in Admin → Settings.
          </div>
          <Field label="Salon name">
            <input autoFocus value={brandName} onChange={e => setBrandName(e.target.value)}
              placeholder="Meraki Nail Studio" style={inp} />
          </Field>
          <Field label="Tagline (optional)">
            <input value={brandTagline} onChange={e => setBrandTagline(e.target.value)}
              placeholder="Where Beauty Meets Modern Wellness" style={inp} />
          </Field>
          <Field label="Brand color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                style={{ width: 50, height: 38, border: '1px solid #d8d8d8', borderRadius: 8, background: '#fff', cursor: 'pointer' }} />
              <input value={brandColor} onChange={e => setBrandColor(e.target.value)}
                style={{ ...inp, flex: 1 }} />
              <div style={{ width: 38, height: 38, borderRadius: 8, background: brandColor, border: '1px solid #e8e8e8' }} />
            </div>
          </Field>
        </div>
      }
      footer={
        <>
          <button onClick={() => setStep(0)} style={btnGhost}>← Back</button>
          <button onClick={async () => { await saveBrand(); setStep(2); }} style={btnPrimary}>
            Save & continue →
          </button>
        </>
      }
    />
  );

  // STEP 2 — Services from template
  if (step === 2) return (
    <Frame
      title="Pick a starting service menu"
      body={
        <div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.55 }}>
            Pick the template that's closest to your business. We'll create the services with reasonable defaults — you can edit prices, durations, and add/remove anything afterwards.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {SERVICE_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplateId(t.id)}
                disabled={importedCount > 0}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                  padding: 14, borderRadius: 12,
                  border: templateId === t.id ? '2px solid #5b3b8c' : '1px solid #e8e8e8',
                  background: templateId === t.id ? '#f3eafc' : '#fafafa',
                  cursor: importedCount > 0 ? 'default' : 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  opacity: importedCount > 0 && templateId !== t.id ? .4 : 1,
                }}>
                <div style={{ fontSize: 24 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{t.description}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{t.services.length} services</div>
              </button>
            ))}
          </div>
          {importedCount > 0 && (
            <div style={{ marginTop: 16, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#166534' }}>
              ✓ {importedCount} services added. You can edit them in <strong>Services</strong> after the wizard.
            </div>
          )}
        </div>
      }
      footer={
        <>
          <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
          {importedCount > 0 ? (
            <button onClick={() => setStep(3)} style={btnPrimary}>Next: Add team →</button>
          ) : templateId ? (
            <button onClick={importTemplate} disabled={templateImporting} style={btnPrimary}>
              {templateImporting ? 'Importing…' : `Import ${SERVICE_TEMPLATES.find(t => t.id === templateId)?.services.length} services →`}
            </button>
          ) : (
            <button onClick={() => setStep(3)} style={btnGhostBlue}>Skip — I'll add manually →</button>
          )}
        </>
      }
    />
  );

  // STEP 3 — Employees
  if (step === 3) return (
    <Frame
      title="Add your team"
      body={
        <div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.55 }}>
            Add your first 1-3 techs. Email is optional — if you provide it, they'll be able to sign in to see their own schedule. You can add more team members anytime in <strong>Employees</strong>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {techs.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa', padding: 10, borderRadius: 10, border: '1px solid #f0f0f0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#5b3b8c', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                  {t.name ? t.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : i + 1}
                </div>
                <input value={t.name} onChange={e => setTechs(ts => ts.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  placeholder="Name" style={{ ...inp, flex: 1 }} />
                <input value={t.email} onChange={e => setTechs(ts => ts.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                  placeholder="email (optional)" style={{ ...inp, flex: 1.4 }} />
              </div>
            ))}
            <button onClick={() => setTechs(ts => [...ts, { name: '', email: '' }])}
              style={{ ...btnGhost, alignSelf: 'flex-start', fontSize: 12, padding: '6px 12px' }}>
              + Add another
            </button>
          </div>
          {techsSavedCount > 0 && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#166534' }}>
              ✓ {techsSavedCount} team member{techsSavedCount === 1 ? '' : 's'} added.
            </div>
          )}
        </div>
      }
      footer={
        <>
          <button onClick={() => setStep(2)} style={btnGhost}>← Back</button>
          {techsSavedCount > 0 ? (
            <button onClick={() => setStep(4)} style={btnPrimary}>Next: Set hours →</button>
          ) : techs.some(t => t.name.trim()) ? (
            <button onClick={saveTechs} disabled={techsSaving} style={btnPrimary}>
              {techsSaving ? 'Saving…' : 'Save team →'}
            </button>
          ) : (
            <button onClick={() => setStep(4)} style={btnGhostBlue}>Skip — I'll add later →</button>
          )}
        </>
      }
    />
  );

  // STEP 4 — Hours
  if (step === 4) return (
    <Frame
      title="When are you open?"
      body={
        <div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.55 }}>
            Set your regular store hours. You can edit them anytime from Schedule → 🕐 Hours, and override them per-day for holidays.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {WEEK_DAYS.map(day => {
              const h = hours[day] || { open: '10:00', close: '18:00', closed: false };
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                  <div style={{ width: 38, fontSize: 13, fontWeight: 700, color: h.closed ? '#bbb' : '#333' }}>{day}</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888', cursor: 'pointer', minWidth: 60 }}>
                    <input type="checkbox" checked={!!h.closed}
                      onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], closed: e.target.checked } }))} />
                    Closed
                  </label>
                  {!h.closed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                      <input type="time" value={h.open}
                        onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))}
                        style={{ ...inp, width: 110, padding: '5px 8px', fontSize: 12 }} />
                      <span style={{ color: '#bbb' }}>–</span>
                      <input type="time" value={h.close}
                        onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))}
                        style={{ ...inp, width: 110, padding: '5px 8px', fontSize: 12 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      }
      footer={
        <>
          <button onClick={() => setStep(3)} style={btnGhost}>← Back</button>
          <button onClick={async () => { await saveHours(); setStep(5); }} disabled={hoursSaving} style={btnPrimary}>
            {hoursSaving ? 'Saving…' : 'Save & finish →'}
          </button>
        </>
      }
    />
  );

  // STEP 5 — Done
  return (
    <Frame
      title="You're set up"
      body={
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Welcome aboard, {(gUser?.displayName || gUser?.email || 'there').split(' ')[0].split('@')[0]}!
          </div>
          <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 18px' }}>
            Your salon is ready to take bookings. Here are good next steps:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', maxWidth: 420, margin: '0 auto' }}>
            {[
              ['📅', 'Open Schedule', 'Block off time and start booking appointments'],
              ['🔗', 'Share your booking link', 'Find it under Admin → Settings → Online Booking'],
              ['💳', 'Connect Stripe', 'Take card payments — Admin → Settings → Financial'],
              ['📨', 'Verify your email domain', 'Send appointment reminders from your own brand'],
              ['📥', 'Import past clients', 'Admin → Settings → Data Imports if migrating from another system'],
            ].map(([i, t, s], idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8f5fc', borderRadius: 10 }}>
                <div style={{ fontSize: 22 }}>{i}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{t}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          <div />
          <button onClick={onClose} style={btnPrimary}>Open Schedule →</button>
        </>
      }
    />
  );
}

// ── Styles ───────────────────────────────────────────
const inp = {
  width: '100%', fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
  borderRadius: 8, border: '1px solid #d8d8d8', background: '#fff',
  outline: 'none', boxSizing: 'border-box', marginBottom: 0,
};
const btnPrimary = {
  padding: '9px 18px', borderRadius: 10, border: 'none',
  background: '#5b3b8c', color: '#fff', fontWeight: 600, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhost = {
  padding: '9px 14px', borderRadius: 10, border: '1px solid #d8d8d8',
  background: '#fff', color: '#666', fontWeight: 500, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit',
};
const btnGhostBlue = {
  padding: '9px 14px', borderRadius: 10, border: '1px solid #c7dff7',
  background: '#f0f7ff', color: '#1a5f8a', fontWeight: 500, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}
