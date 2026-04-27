import { useState, useEffect, useRef } from 'react';
import { fetchClients, createClient, saveClient, deleteClient, fetchServices } from '../../lib/firestore';
import { resizeImg, formatTime } from '../../utils/helpers';
import { logActivity } from '../../lib/logger';
import { useApp } from '../../context/AppContext';

// ── helpers ────────────────────────────────────────────
function blankClient() {
  return {
    name: '', phone: '', email: '', address: '', birthday: '', notes: '',
    picture: '',
    instagram: '', facebook: '', tiktok: '', venmo: '',
    instagramTags: [],
    googleReviews: [],
    visits: [],
  };
}

function blankTag()    { return { url: '', note: '' }; }
function blankReview() { return { url: '', rating: 5, date: new Date().toISOString().slice(0, 10), text: '' }; }

function blankVisit() {
  return {
    id: Date.now().toString(),
    date: new Date().toISOString().slice(0, 10),
    tech: '',
    notes: '',
    services: [{ name: '', price: '', notes: '' }],
  };
}

function matchesSearch(c, q) {
  const s = q.toLowerCase();
  return (
    c.name?.toLowerCase().includes(s) ||
    c.phone?.toLowerCase().includes(s) ||
    c.email?.toLowerCase().includes(s)
  );
}

const PAGE_SIZE = 50;

// ── main list ──────────────────────────────────────────
export default function ClientsAdmin() {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(0);
  // modal: null | { client, mode: 'view'|'edit' }
  const [modal,    setModal]    = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setClients(await fetchClients()); }
    catch (e) { console.error('[Clients] load failed:', e); }
    finally { setLoading(false); }
  }

  async function handleSave(client) {
    try {
      if (client.id) {
        const { id, createdAt, ...data } = client;
        await saveClient(id, data);
        logActivity('client_updated', client.name);
      } else {
        await createClient(client);
        logActivity('client_added', client.name);
      }
      await load();
      setModal(null);
    } catch (e) { console.error('[Clients] save failed:', e); }
  }

  async function handleDelete(client) {
    if (!confirm(`Delete client "${client.name}"? This cannot be undone.`)) return;
    await deleteClient(client.id);
    logActivity('client_deleted', client.name);
    setClients(cs => cs.filter(c => c.id !== client.id));
  }

  function handleSearch(val) {
    setSearch(val);
    setPage(0);
  }

  const visible   = search ? clients.filter(c => matchesSearch(c, search)) : clients;
  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const pageSlice  = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = visible.length ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd   = Math.min((page + 1) * PAGE_SIZE, visible.length);

  if (loading) return <Empty>Loading clients…</Empty>;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, phone, or email…"
          style={{ flex: 1, fontFamily: 'inherit', border: '1px solid #d8d8d8', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', background: '#fafafa' }}
        />
        <Btn color="#3D95CE" onClick={() => setModal({ client: blankClient(), mode: 'edit' })}>+ Add Client</Btn>
      </div>

      {/* List */}
      {visible.length === 0
        ? <Empty>{search ? 'No clients match that search.' : 'No clients yet — click Add Client to start.'}</Empty>
        : (
          <>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              {pageSlice.map((c, i) => (
                <ClientRow
                  key={c.id}
                  client={c}
                  last={i === pageSlice.length - 1}
                  onView={() => setModal({ client: { ...c }, mode: 'view' })}
                  onEdit={() => setModal({ client: { ...c }, mode: 'edit' })}
                  onDelete={() => handleDelete(c)}
                />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, padding: '0 2px' }}>
                <button
                  onClick={() => setPage(p => p - 1)} disabled={page === 0}
                  style={{ fontSize: 12, padding: '5px 14px', borderRadius: 8, border: '1px solid #d8d8d8', background: '#fff', color: page === 0 ? '#ccc' : '#333', cursor: page === 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  ← Prev
                </button>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {rangeStart}–{rangeEnd} of {visible.length} clients
                </span>
                <button
                  onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                  style={{ fontSize: 12, padding: '5px 14px', borderRadius: 8, border: '1px solid #d8d8d8', background: '#fff', color: page >= totalPages - 1 ? '#ccc' : '#333', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  Next →
                </button>
              </div>
            )}
            {totalPages <= 1 && visible.length > 0 && (
              <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>
                {visible.length} client{visible.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )
      }

      {modal && (
        <ClientModal
          client={modal.client}
          initialMode={modal.mode}
          onChange={patch => setModal(m => ({ ...m, client: { ...m.client, ...patch } }))}
          onSave={() => handleSave(modal.client)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function ClientRow({ client, last, onView, onEdit, onDelete }) {
  const lastVisit = client.visits?.slice(-1)[0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: last ? 'none' : '1px solid #f0f0f0' }}>
      <div onClick={onView} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <Avatar picture={client.picture} name={client.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{client.name || '—'}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
            {[client.phone, client.email].filter(Boolean).join(' · ') || 'No contact info'}
          </div>
          {lastVisit && (
            <div style={{ fontSize: 10, color: '#bbb', marginTop: 1 }}>Last visit: {formatDate(lastVisit.date)}</div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Btn onClick={onEdit}>Edit</Btn>
        <Btn color="#ef4444" onClick={onDelete}>Del</Btn>
      </div>
    </div>
  );
}

// ── modal ──────────────────────────────────────────────
function ClientModal({ client, initialMode = 'edit', onChange, onSave, onClose }) {
  const [mode,      setMode]      = useState(initialMode);
  const [tab,       setTab]       = useState('profile');
  const [saving,    setSaving]    = useState(false);
  const [services,  setServices]  = useState([]);
  const [addingVisit, setAddingVisit] = useState(false);
  const [newVisit,  setNewVisit]  = useState(blankVisit());
  const fileRef = useRef(null);
  const isNew   = !client.id;
  const isView  = mode === 'view';
  const TABS    = ['profile', 'social', 'visits'];

  useEffect(() => {
    fetchServices().then(s => setServices(s.map(sv => sv.name))).catch(() => {});
  }, []);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { onChange({ picture: await resizeImg(file, 300, 300, 0.82) }); }
    catch {}
  }

  async function submit() {
    if (!client.name?.trim()) return;
    setSaving(true);
    try { await onSave(); } finally { setSaving(false); }
  }

  function addVisit() {
    const visits = [...(client.visits || []), { ...newVisit, id: Date.now().toString() }];
    onChange({ visits });
    setNewVisit(blankVisit());
    setAddingVisit(false);
  }

  function removeVisit(id) {
    onChange({ visits: (client.visits || []).filter(v => v.id !== id) });
  }

  function patchNewVisitService(i, patch) {
    const svcs = newVisit.services.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    setNewVisit(v => ({ ...v, services: svcs }));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '94%', maxWidth: 460, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              {isNew ? 'New Client' : isView ? client.name || 'Client' : 'Edit Client'}
            </span>
            {isView && !isNew && (
              <span style={{ fontSize: 10, background: '#f0f0f0', color: '#888', borderRadius: 20, padding: '2px 8px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>view</span>
            )}
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #d0d0d0', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px 0', fontSize: 12, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#3D95CE' : '#888', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #3D95CE' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
              {t}{t === 'visits' && client.visits?.length ? ` (${client.visits.length})` : ''}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <>
              {/* Photo + name row */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <div
                    onClick={isView ? undefined : () => fileRef.current?.click()}
                    style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', cursor: isView ? 'default' : 'pointer', border: '2px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {client.picture
                      ? <img src={client.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>👤</span>
                    }
                  </div>
                  {!isView && (
                    <>
                      <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 3, cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>photo</div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                    </>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Full name">
                    {isView
                      ? <ViewVal>{client.name || '—'}</ViewVal>
                      : <input value={client.name} onChange={e => onChange({ name: e.target.value })} placeholder="Jane Smith" style={inp} />
                    }
                  </Field>
                  <Field label="Birthday">
                    {isView
                      ? <ViewVal>{client.birthday ? formatDate(client.birthday) : '—'}</ViewVal>
                      : <input type="date" value={client.birthday || ''} onChange={e => onChange({ birthday: e.target.value })} style={inp} />
                    }
                  </Field>
                </div>
              </div>

              <Field label="Phone">
                {isView
                  ? <ViewVal>{client.phone || '—'}</ViewVal>
                  : <input value={client.phone || ''} onChange={e => onChange({ phone: e.target.value })} placeholder="(555) 000-0000" style={inp} />
                }
              </Field>
              <Field label="Email">
                {isView
                  ? <ViewVal>{client.email || '—'}</ViewVal>
                  : <input type="email" value={client.email || ''} onChange={e => onChange({ email: e.target.value })} placeholder="jane@example.com" style={inp} />
                }
              </Field>
              <Field label="Address">
                {isView
                  ? <ViewVal>{client.address || '—'}</ViewVal>
                  : <input value={client.address || ''} onChange={e => onChange({ address: e.target.value })} placeholder="123 Main St, City, State" style={inp} />
                }
              </Field>
              <Field label="Notes">
                {isView
                  ? <ViewVal style={{ whiteSpace: 'pre-wrap' }}>{client.notes || '—'}</ViewVal>
                  : <textarea value={client.notes || ''} onChange={e => onChange({ notes: e.target.value })} rows={3} placeholder="Allergies, preferences, special notes…" style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                }
              </Field>
            </>
          )}

          {/* ── Social tab ── */}
          {tab === 'social' && (
            <>
              {/* Handles */}
              {[
                { key: 'instagram', label: 'Instagram',  icon: '📸', placeholder: '@username' },
                { key: 'facebook',  label: 'Facebook',   icon: '👥', placeholder: 'username or profile URL' },
                { key: 'tiktok',    label: 'TikTok',     icon: '🎵', placeholder: '@username' },
                { key: 'venmo',     label: 'Venmo',      icon: '💸', placeholder: '@username' },
              ].map(({ key, label, icon, placeholder }) => (
                <Field key={key} label={`${icon} ${label}`}>
                  {isView
                    ? <ViewVal>{client[key] || '—'}</ViewVal>
                    : <input value={client[key] || ''} onChange={e => onChange({ [key]: e.target.value })} placeholder={placeholder} style={inp} />
                  }
                </Field>
              ))}

              <Divider />

              {/* Instagram tags */}
              <SectionHeader icon="🏷️" title="Instagram Posts Tagged In" />
              {(client.instagramTags || []).length === 0 && isView && (
                <div style={{ fontSize: 12, color: '#bbb', marginBottom: 8 }}>None recorded.</div>
              )}
              {(client.instagramTags || []).map((tag, i) => (
                <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8', padding: 10, marginBottom: 8 }}>
                  {isView ? (
                    <>
                      {tag.url
                        ? <a href={tag.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#3D95CE', wordBreak: 'break-all', display: 'block', marginBottom: tag.note ? 4 : 0 }}>{tag.url}</a>
                        : <div style={{ fontSize: 12, color: '#bbb' }}>No URL</div>
                      }
                      {tag.note && <div style={{ fontSize: 11, color: '#888' }}>{tag.note}</div>}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input
                          value={tag.url}
                          onChange={e => onChange({ instagramTags: client.instagramTags.map((t, idx) => idx === i ? { ...t, url: e.target.value } : t) })}
                          placeholder="https://instagram.com/p/…"
                          style={{ ...inp, flex: 1 }}
                        />
                        <button onClick={() => onChange({ instagramTags: client.instagramTags.filter((_, idx) => idx !== i) })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 }}>×</button>
                      </div>
                      <input
                        value={tag.note}
                        onChange={e => onChange({ instagramTags: client.instagramTags.map((t, idx) => idx === i ? { ...t, note: e.target.value } : t) })}
                        placeholder="Note (e.g. red coffin nails, gel-x)…"
                        style={inp}
                      />
                    </>
                  )}
                </div>
              ))}
              {!isView && (
                <AddRowBtn onClick={() => onChange({ instagramTags: [...(client.instagramTags || []), blankTag()] })} label="+ Add Instagram post" />
              )}

              <Divider />

              {/* Google reviews */}
              <SectionHeader icon="⭐" title="Google Reviews" />
              {(client.googleReviews || []).length === 0 && isView && (
                <div style={{ fontSize: 12, color: '#bbb', marginBottom: 8 }}>None recorded.</div>
              )}
              {(client.googleReviews || []).map((rev, i) => (
                <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8', padding: 10, marginBottom: 8 }}>
                  {isView ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: rev.text ? 6 : 0 }}>
                        <span style={{ fontSize: 13, color: '#f59e0b' }}>{'★'.repeat(rev.rating)}</span>
                        <span style={{ fontSize: 11, color: '#888' }}>{formatDate(rev.date)}</span>
                        {rev.url && <a href={rev.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3D95CE', marginLeft: 'auto' }}>link</a>}
                      </div>
                      {rev.text && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{rev.text}</div>}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input
                          value={rev.url}
                          onChange={e => onChange({ googleReviews: client.googleReviews.map((r, idx) => idx === i ? { ...r, url: e.target.value } : r) })}
                          placeholder="Google review URL (optional)…"
                          style={{ ...inp, flex: 1 }}
                        />
                        <button onClick={() => onChange({ googleReviews: client.googleReviews.filter((_, idx) => idx !== i) })}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0 }}>×</button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <Field label="Date" style={{ flex: 1, marginBottom: 0 }}>
                          <input type="date" value={rev.date}
                            onChange={e => onChange({ googleReviews: client.googleReviews.map((r, idx) => idx === i ? { ...r, date: e.target.value } : r) })}
                            style={inp} />
                        </Field>
                        <Field label="Rating" style={{ width: 90, marginBottom: 0 }}>
                          <select value={rev.rating}
                            onChange={e => onChange({ googleReviews: client.googleReviews.map((r, idx) => idx === i ? { ...r, rating: Number(e.target.value) } : r) })}
                            style={inp}>
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                          </select>
                        </Field>
                      </div>
                      <textarea
                        value={rev.text}
                        onChange={e => onChange({ googleReviews: client.googleReviews.map((r, idx) => idx === i ? { ...r, text: e.target.value } : r) })}
                        rows={2} placeholder="Review text…"
                        style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}
                      />
                    </>
                  )}
                </div>
              ))}
              {!isView && (
                <AddRowBtn onClick={() => onChange({ googleReviews: [...(client.googleReviews || []), blankReview()] })} label="+ Add Google review" />
              )}
            </>
          )}

          {/* ── Visits tab ── */}
          {tab === 'visits' && (
            <>
              {(client.visits || []).length === 0 && !addingVisit && (
                <Empty>No visits recorded yet.</Empty>
              )}
              {[...(client.visits || [])].reverse().map(v => (
                <VisitCard key={v.id} visit={v} onRemove={() => removeVisit(v.id)} readOnly={isView} />
              ))}

              {!isView && (
                addingVisit ? (
                  <div style={{ background: '#f8f9fa', borderRadius: 10, border: '1px solid #e8e8e8', padding: 14, marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 10 }}>New Visit</div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <Field label="Date" style={{ flex: 1 }}>
                        <input type="date" value={newVisit.date} onChange={e => setNewVisit(v => ({ ...v, date: e.target.value }))} style={inp} />
                      </Field>
                      <Field label="Tech" style={{ flex: 1 }}>
                        <input value={newVisit.tech} onChange={e => setNewVisit(v => ({ ...v, tech: e.target.value }))} placeholder="Tech name" style={inp} />
                      </Field>
                    </div>

                    <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Services</div>
                    {newVisit.services.map((svc, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8', padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <select value={svc.name} onChange={e => patchNewVisitService(i, { name: e.target.value })} style={{ ...inp, flex: 2 }}>
                            <option value="">Pick service…</option>
                            {services.map(s => <option key={s} value={s}>{s}</option>)}
                            <option value="__custom__">Other (type below)</option>
                          </select>
                          <input
                            type="number" min={0} value={svc.price} onChange={e => patchNewVisitService(i, { price: e.target.value })}
                            placeholder="$" style={{ ...inp, width: 60 }}
                          />
                          {newVisit.services.length > 1 && (
                            <button onClick={() => setNewVisit(v => ({ ...v, services: v.services.filter((_, idx) => idx !== i) }))}
                              style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
                          )}
                        </div>
                        {svc.name === '__custom__' && (
                          <input value={svc.customName || ''} onChange={e => patchNewVisitService(i, { customName: e.target.value })} placeholder="Service name" style={{ ...inp, marginBottom: 6 }} />
                        )}
                        <textarea value={svc.notes} onChange={e => patchNewVisitService(i, { notes: e.target.value })} rows={2}
                          placeholder="Notes for this service (color, shape, design…)" style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                      </div>
                    ))}
                    <button onClick={() => setNewVisit(v => ({ ...v, services: [...v.services, { name: '', price: '', notes: '' }] }))}
                      style={{ fontSize: 11, color: '#3D95CE', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginBottom: 8 }}>
                      + Add another service
                    </button>

                    <Field label="Visit notes">
                      <textarea value={newVisit.notes} onChange={e => setNewVisit(v => ({ ...v, notes: e.target.value }))} rows={2}
                        placeholder="Overall visit notes…" style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
                    </Field>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => setAddingVisit(false)} style={{ flex: 1, ...btnBase }}>Cancel</button>
                      <button onClick={addVisit} style={{ flex: 2, ...btnBase, background: '#3D95CE', color: '#fff', borderColor: '#3D95CE' }}>Save Visit</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingVisit(true); setNewVisit(blankVisit()); }}
                    style={{ marginTop: 10, width: '100%', ...btnBase, color: '#3D95CE', borderStyle: 'dashed' }}>
                    + Record Visit
                  </button>
                )
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexShrink: 0 }}>
          {isView ? (
            <>
              <button onClick={onClose} style={{ flex: 1, ...btnBase }}>Close</button>
              {!isNew && (
                <button onClick={() => setMode('edit')} style={{ flex: 2, ...btnBase, background: '#3D95CE', color: '#fff', borderColor: '#3D95CE' }}>
                  Edit
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={onClose} style={{ flex: 1, ...btnBase }}>Cancel</button>
              <button onClick={submit} disabled={saving || !client.name?.trim()}
                style={{ flex: 2, ...btnBase, background: '#3D95CE', color: '#fff', borderColor: '#3D95CE', opacity: (saving || !client.name?.trim()) ? .6 : 1 }}>
                {saving ? 'Saving…' : (isNew ? 'Add Client' : 'Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VisitCard({ visit, onRemove, readOnly }) {
  const [open, setOpen] = useState(false);
  const total = visit.services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8e8e8', marginBottom: 8, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{formatDate(visit.date)}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
            {visit.tech && `${visit.tech} · `}
            {visit.services?.map(s => s.name === '__custom__' ? s.customName : s.name).filter(Boolean).join(', ') || 'No services'}
            {total > 0 && ` · $${total}`}
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#bbb' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 12px' }}>
          {visit.services?.map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>
                {s.name === '__custom__' ? s.customName : s.name}
                {s.price ? <span style={{ color: '#888', fontWeight: 400 }}> · ${s.price}</span> : ''}
              </div>
              {s.notes && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.notes}</div>}
            </div>
          ))}
          {visit.notes && <div style={{ fontSize: 11, color: '#888', borderTop: '1px solid #f5f5f5', paddingTop: 8, marginTop: 4 }}>{visit.notes}</div>}
          {!readOnly && (
            <button onClick={onRemove} style={{ marginTop: 8, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove visit</button>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({ picture, name, size = 36 }) {
  const [err, setErr] = useState(false);
  if (picture && !err) {
    return <img src={picture} alt="" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  const initials = name?.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const colors = ['#4A7DB5', '#2D7A5F', '#B57A4A', '#7A4AB5', '#B54A7A'];
  const bg = colors[name?.charCodeAt(0) % colors.length] || '#888';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 600, color: '#fff' }}>
      {initials}
    </div>
  );
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>{label}</label>
      {children}
    </div>
  );
}

function ViewVal({ children, style }) {
  return (
    <div style={{ fontSize: 13, color: '#1a1a1a', padding: '6px 0', minHeight: 28, lineHeight: 1.5, ...style }}>
      {children}
    </div>
  );
}

function Btn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: 'none', background: color || '#e8e8e8', color: color ? '#fff' : '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
      {children}
    </button>
  );
}

function Empty({ children }) {
  return <div style={{ padding: 20, textAlign: 'center', color: '#bbb', fontSize: 13 }}>{children}</div>;
}

function Divider() {
  return <div style={{ borderTop: '1px solid #f0f0f0', margin: '14px 0' }} />;
}

function SectionHeader({ icon, title }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>{icon} {title}</div>;
}

function AddRowBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, color: '#3D95CE', background: 'none', border: '1px dashed #b3d4ef', borderRadius: 8, cursor: 'pointer', padding: '7px 12px', width: '100%', fontFamily: 'inherit' }}>
      {label}
    </button>
  );
}

const inp     = { fontFamily: 'inherit', width: '100%', border: '1px solid #d8d8d8', borderRadius: 8, padding: '7px 11px', fontSize: 13, color: '#333', outline: 'none', background: '#fafafa', boxSizing: 'border-box' };
const btnBase = { fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#fff', border: '1px solid #d0d0d0', borderRadius: 8, padding: '8px 14px', color: '#333' };
