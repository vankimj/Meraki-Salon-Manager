import { useState } from 'react';
import { useApp } from '../context/AppContext';
import FeedbackModal from './FeedbackModal';
import UserMenu from './UserMenu';

const MODULE_ICONS = {
  schedule:  '📅',
  clients:   '👥',
  services:  '💅',
  employees: '👩‍💼',
  reports:   '📊',
  hr:        '💼',
  giftcards: '🎁',
  meetings:  '🗓️',
  products:  '🛍',
  marketing: '📣',
  chat:      '💬',
};

export default function ModuleShell({ view, title, onHome, onAdmin, children }) {
  const { isAdmin, realIsAdmin, viewAs, setViewAs, syncState, activeTheme: t, users } = useApp();
  const techUsers = users.filter(u => u.role === 'tech' && u.techName);

  function previewLabel(va) {
    if (!va) return '';
    if (va.role === 'tech') return va.techName;
    if (va.role === 'scheduler') return 'Scheduler';
    return 'Read-only';
  }

  function parsePreview(val) {
    if (!val) return null;
    if (val === 'scheduler') return { role: 'scheduler' };
    if (val === 'readonly') return { role: 'readonly' };
    if (val.startsWith('tech:')) return { role: 'tech', techName: val.slice(5) };
    return null;
  }
  const [showFeedback, setShowFeedback] = useState(false);
  const syncColor = { syncing: '#f59e0b', ok: '#22c55e', err: '#ef4444', idle: '#ddd' }[syncState] || '#ddd';
  const icon = MODULE_ICONS[view] || '◆';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100dvh', background: 'var(--tm-bg, #f8f9fa)' }}>
      {/* Top nav — taller on mobile for easier tapping */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid var(--tm-border, #ebebeb)`,
        padding: '0 16px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        zIndex: 10,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        {/* Home button */}
        <button onClick={onHome}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--tm-accent, #3D95CE)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: '8px 6px', borderRadius: 6, flexShrink: 0, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>

        <span style={{ color: '#e0e0e0', fontSize: 16, flexShrink: 0 }}>›</span>

        {/* Module title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: syncColor, transition: 'background .3s', animation: syncState === 'syncing' ? 'pulse .8s infinite' : 'none' }} />
          {realIsAdmin && viewAs && (
            <button onClick={() => setViewAs(null)} title="Exit preview"
              style={{ height: 40, borderRadius: 20, border: 'none', background: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>
              ← Exit {previewLabel(viewAs)}
            </button>
          )}
          {isAdmin && (
            <button onClick={onAdmin} title="Admin Settings"
              style={{ height: 40, borderRadius: 20, border: 'none', background: 'var(--tm-primary, #2D7A5F)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,.25)' }}>
              <span style={{ fontSize: 17 }}>⚙</span> Admin
            </button>
          )}
          {realIsAdmin && !viewAs && (
            <select value="" onChange={e => { const v = parsePreview(e.target.value); if (v) setViewAs(v); }}
              style={{ height: 40, borderRadius: 20, border: '1px solid #e0e0e0', background: '#fafafa', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#888', fontFamily: 'inherit', padding: '0 12px', outline: 'none' }}>
              <option value="">👤 Preview as…</option>
              {techUsers.map(u => (
                <option key={u.email} value={`tech:${u.techName}`}>👩‍💼 {u.techName}</option>
              ))}
              <option value="scheduler">📅 Scheduler</option>
              <option value="readonly">👁 Read-only</option>
            </select>
          )}
          <button onClick={() => setShowFeedback(true)} title="Report a bug or idea"
            style={{ height: 40, borderRadius: 20, border: 'none', background: 'var(--tm-accent, #3D95CE)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>
            <span style={{ fontSize: 17 }}>💬</span> Feedback
          </button>
          <UserMenu />
        </div>
      </div>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* Tech-view impersonation banner */}
      {realIsAdmin && viewAs && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fcd34d', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, fontSize: 12, color: '#92400e' }}>
          <span>👤 Previewing as: <strong>{previewLabel(viewAs)}</strong> — changes are real; only the UI is restricted</span>
          <button onClick={() => setViewAs(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#92400e', fontFamily: 'inherit', fontSize: 12, padding: '0 4px' }}>✕ Exit</button>
        </div>
      )}

      {/* Content — safe-area padding at bottom for iPhone home indicator */}
      <div style={{
        flex: 1,
        overflowY: view === 'schedule' ? 'hidden' : 'auto',
        overflowX: 'hidden',
        padding: 16,
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        display: view === 'schedule' ? 'flex' : 'block',
        flexDirection: 'column',
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </div>
    </div>
  );
}
