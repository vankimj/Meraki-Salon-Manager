import { useApp } from '../context/AppContext';

const MODULE_ICONS = {
  schedule:  '📅',
  clients:   '👥',
  services:  '💅',
  employees: '👩‍💼',
  reports:   '📊',
};

export default function ModuleShell({ view, title, onHome, onAdmin, children }) {
  const { gUser, isAdmin, syncState } = useApp();
  const syncColor = { syncing: '#f59e0b', ok: '#22c55e', err: '#ef4444', idle: '#ddd' }[syncState] || '#ddd';
  const icon = MODULE_ICONS[view] || '◆';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fa' }}>
      {/* Top nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, zIndex: 10 }}>
        {/* Home button */}
        <button onClick={onHome}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#3D95CE', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: '4px 6px', borderRadius: 6, flexShrink: 0 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>

        <span style={{ color: '#e0e0e0', fontSize: 16 }}>›</span>

        {/* Module title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: syncColor, transition: 'background .3s', animation: syncState === 'syncing' ? 'pulse .8s infinite' : 'none' }} />
          {isAdmin && (
            <button onClick={onAdmin} title="Admin Settings"
              style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              ⚙
            </button>
          )}
          {gUser?.photoURL && (
            <img src={gUser.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: view === 'schedule' ? 'hidden' : 'auto', padding: 16, display: view === 'schedule' ? 'flex' : 'block', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
