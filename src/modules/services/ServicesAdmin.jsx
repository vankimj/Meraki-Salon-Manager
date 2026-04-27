import { useState, useEffect, useRef } from 'react';
import { fetchServices, createService, saveService, deleteService, servicesExist, clearServices } from '../../lib/firestore';
import { groupByCategory, formatPrice, formatDuration, validateService, blankService } from '../../utils/serviceHelpers';
import { SEED_SERVICES, CATEGORY_ORDER } from '../../data/seedServices';
import { logActivity } from '../../lib/logger';
import { resizeImg } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

export default function ServicesAdmin() {
  const { isTech } = useApp();
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      let svcs = await fetchServices();
      if (!svcs.length) {
        await seedAll();
        svcs = await fetchServices();
      }
      setServices(svcs);
    } catch (e) {
      console.error('[ServicesAdmin] load failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function seedAll() {
    const exists = await servicesExist();
    if (exists) return;
    for (const [i, svc] of SEED_SERVICES.entries()) {
      await createService({ ...svc, sortOrder: i });
    }
    logActivity('services_seeded', `${SEED_SERVICES.length} services`);
  }

  async function handleReseed() {
    if (!confirm(`Replace all ${services.length} services with the Meraki Nail Studio defaults? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await clearServices();
      for (const [i, svc] of SEED_SERVICES.entries()) {
        await createService({ ...svc, sortOrder: i });
      }
      logActivity('services_reseeded', `${SEED_SERVICES.length} services`);
      const svcs = await fetchServices();
      setServices(svcs);
    } catch (e) {
      console.error('[ServicesAdmin] reseed failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const { valid, errors: errs } = validateService(editing);
    if (!valid) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const { id, ...data } = editing;
      if (id) {
        await saveService(id, data);
        logActivity('service_updated', editing.name);
      } else {
        await createService(data);
        logActivity('service_added', editing.name);
      }
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(svc) {
    if (!confirm(`Delete "${svc.name}"?`)) return;
    await deleteService(svc.id);
    logActivity('service_deleted', svc.name);
    setServices(s => s.filter(x => x.id !== svc.id));
  }

  async function toggleActive(svc) {
    await saveService(svc.id, { active: !svc.active });
    setServices(s => s.map(x => x.id === svc.id ? { ...x, active: !x.active } : x));
  }

  const groups = groupByCategory(services);

  if (loading) return <Empty>Loading services…</Empty>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {!isTech && (
          <button onClick={handleReseed} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #d0d0d0', background: '#fafafa', color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↺ Reset to defaults
          </button>
        )}
        {isTech
          ? <div style={{ fontSize: 12, color: '#aaa' }}>{services.length} services · view only</div>
          : <Btn color="#3D95CE" onClick={() => { setEditing(blankService()); setErrors({}); }}>+ Add Service</Btn>
        }
      </div>

      {groups.length === 0 && <Empty>No services yet — click Add Service to start.</Empty>}

      {groups.map(({ category, services: svcs }) => (
        <div key={category} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #e8e8e8', fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '.06em', textTransform: 'uppercase', background: '#fafafa' }}>
            {category}
          </div>
          {svcs.map(svc => (
            <div key={svc.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, opacity: svc.active ? 1 : .45 }}>
              <ServiceThumb image={svc.image} name={svc.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{svc.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {formatPrice(svc.basePrice, svc.priceFrom)} · {formatDuration(svc.duration, svc.durationMin)}
                </div>
                {svc.description && (
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>{svc.description}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                {!isTech && <Toggle active={svc.active} onChange={() => toggleActive(svc)} />}
                {!isTech && <Btn onClick={() => { setEditing({ ...svc }); setErrors({}); }}>Edit</Btn>}
                {!isTech && <Btn color="#ef4444" onClick={() => handleDelete(svc)}>Del</Btn>}
              </div>
            </div>
          ))}
        </div>
      ))}

      {editing && (
        <ServiceModal
          svc={editing}
          errors={errors}
          saving={saving}
          onChange={patch => setEditing(e => ({ ...e, ...patch }))}
          onSave={handleSave}
          onClose={() => { setEditing(null); setErrors({}); }}
        />
      )}
    </div>
  );
}

function ServiceThumb({ image, name }) {
  const [err, setErr] = useState(false);
  if (image && !err) {
    return (
      <img
        src={image} alt={name}
        onError={() => setErr(true)}
        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: '#f0f0f0' }}
      />
    );
  }
  const colors = { M: '#4A7DB5', P: '#2D7A5F', A: '#B57A4A' };
  const bg = colors[name?.[0]?.toUpperCase()] || '#999';
  return (
    <div style={{ width: 48, height: 48, borderRadius: 8, background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
      💅
    </div>
  );
}

function ServiceModal({ svc, errors, saving, onChange, onSave, onClose }) {
  const isNew = !svc.id;
  const fileRef = useRef(null);
  const [imgErr, setImgErr] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await resizeImg(file, 600, 400, 0.82);
      onChange({ image: b64 });
      setImgErr(false);
    } catch { /* ignore */ }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '92%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{isNew ? 'Add Service' : 'Edit Service'}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #d0d0d0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
        </div>

        {/* Image preview + controls */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Service photo</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0, border: '1px solid #e8e8e8' }}>
              {svc.image && !imgErr
                ? <img src={svc.image} alt="" onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💅</div>
              }
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                value={svc.image || ''}
                onChange={e => { onChange({ image: e.target.value }); setImgErr(false); }}
                placeholder="Paste image URL…"
                style={{ ...inputStyle, fontSize: 11 }}
              />
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #d0d0d0', background: '#fafafa', cursor: 'pointer', fontFamily: 'inherit', color: '#555', textAlign: 'left' }}>
                ↑ Upload photo…
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>
        </div>

        <Field label="Service name" error={errors.name}>
          <input value={svc.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. Gel Manicure" style={inputStyle} />
        </Field>

        <Field label="Category" error={errors.category}>
          <select value={svc.category} onChange={e => onChange({ category: e.target.value })} style={inputStyle}>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="custom">Custom…</option>
          </select>
          {svc.category === 'custom' && (
            <input placeholder="Category name" style={{ ...inputStyle, marginTop: 6 }} onChange={e => onChange({ category: e.target.value })} />
          )}
        </Field>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Field label="Base price ($)" error={errors.basePrice} style={{ flex: 1 }}>
            <input type="number" min={0} value={svc.basePrice} onChange={e => onChange({ basePrice: Number(e.target.value) })} style={inputStyle} />
          </Field>
          <Field label="Duration (min)" error={errors.duration} style={{ flex: 1 }}>
            <input type="number" min={1} value={svc.duration} onChange={e => onChange({ duration: Number(e.target.value) })} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', cursor: 'pointer' }}>
            <input type="checkbox" checked={svc.priceFrom} onChange={e => onChange({ priceFrom: e.target.checked })} />
            Price is "starting from" ($X+)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', cursor: 'pointer' }}>
            <input type="checkbox" checked={svc.durationMin} onChange={e => onChange({ durationMin: e.target.checked })} />
            Duration is minimum (Xmin+)
          </label>
        </div>

        <Field label="Description">
          <textarea value={svc.description || ''} onChange={e => onChange({ description: e.target.value })} rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} placeholder="Brief description of what's included…" />
        </Field>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', cursor: 'pointer', marginBottom: 18 }}>
          <input type="checkbox" checked={svc.active} onChange={e => onChange({ active: e.target.checked })} />
          Active (visible to clients)
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, ...btnBase }}>Cancel</button>
          <button onClick={onSave} disabled={saving} style={{ flex: 2, ...btnBase, background: '#3D95CE', color: '#fff', borderColor: '#3D95CE', opacity: saving ? .6 : 1 }}>
            {saving ? 'Saving…' : (isNew ? 'Add Service' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ active, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 34, height: 20, borderRadius: 10, background: active ? '#22c55e' : '#d0d0d0', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: active ? 16 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{error}</div>}
    </div>
  );
}

function Btn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', background: color || '#e8e8e8', color: color ? '#fff' : '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
      {children}
    </button>
  );
}

function Empty({ children }) {
  return <div style={{ padding: 16, textAlign: 'center', color: '#bbb', fontSize: 13 }}>{children}</div>;
}

const inputStyle = { fontFamily: 'inherit', width: '100%', border: '1px solid #d8d8d8', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#333', outline: 'none', background: '#fafafa', boxSizing: 'border-box' };
const btnBase    = { fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#fff', border: '1px solid #d0d0d0', borderRadius: 8, padding: '8px 14px', color: '#333' };
