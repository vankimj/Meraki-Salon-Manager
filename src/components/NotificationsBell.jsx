import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { IconBell, IconMessage } from './Icons';

function relativeTime(iso) {
  if (!iso) return '';
  const ms  = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  const hr  = Math.floor(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  const d   = Math.floor(hr / 24);
  if (d < 7)     return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNotif(n) {
  // Best-effort title/body for a few known notification shapes.
  switch (n.changeType) {
    case 'handbook_reminder':
      return { title: 'Handbook reminder', body: `${n.techName || 'A tech'} needs to sign ${n.handbookTitle || 'the handbook'}` };
    case 'access_request':
      return { title: 'New access request', body: n.email || n.name || '' };
    case 'feedback':
      return { title: 'New feedback', body: n.summary || n.body || '' };
    case 'online_booking':
      return { title: 'New online booking', body: `${n.clientName || 'Guest'} — ${n.serviceName || ''}`.trim() };
    case 'review_received':
      return { title: 'New review', body: n.author ? `From ${n.author}` : '' };
    default: {
      if (n.title || n.body) return { title: n.title || 'Notification', body: n.body || '' };
      const fallback = (n.changeType || 'Update').replace(/_/g, ' ');
      return { title: fallback.charAt(0).toUpperCase() + fallback.slice(1), body: '' };
    }
  }
}

export default function NotificationsBell() {
  const { gUser, recentNotifs, unreadNotifCount, totalChatUnread, markNotifRead } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!gUser) return null;

  const myEmail = gUser.email;
  const items = (recentNotifs || []).slice(0, 3);
  const totalIndicator = unreadNotifCount + totalChatUnread;

  function handleOpen() {
    const next = !open;
    setOpen(next);
    // Auto-mark visible items as read when opening
    if (next) items.forEach(n => { if (!(n.readBy || []).includes(myEmail)) markNotifRead(n.id); });
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button onClick={handleOpen} title="Notifications"
        style={{ height: 40, width: 40, borderRadius: 20, border: '1px solid #e0e0e0', background: open ? '#f0f0f0' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
        <IconBell size={18} />
        {totalIndicator > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 5, width: 9, height: 9, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', boxShadow: '0 0 0 1px #ef4444' }} />
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, maxWidth: 'calc(100vw - 24px)', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,.14)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Notifications</div>
            {totalIndicator > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#ef4444', borderRadius: 10, padding: '1px 8px' }}>{totalIndicator > 9 ? '9+' : totalIndicator} new</span>
            )}
          </div>

          {totalChatUnread > 0 && (
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f5f5f5', background: '#fafafa', color: '#1a5f8a' }}>
              <IconMessage size={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>Unread client messages</div>
                <div style={{ fontSize: 11, color: '#888' }}>{totalChatUnread} unread thread{totalChatUnread === 1 ? '' : 's'}</div>
              </div>
            </div>
          )}

          {items.length === 0 && totalChatUnread === 0 ? (
            <div style={{ padding: '28px 14px', textAlign: 'center', color: '#aaa', fontSize: 12 }}>You're all caught up.</div>
          ) : (
            items.map(n => {
              const { title, body } = formatNotif(n);
              const isRead = (n.readBy || []).includes(myEmail);
              return (
                <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'flex-start', gap: 10, background: isRead ? '#fff' : '#f8fbfd' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isRead ? '#e0e0e0' : '#ef4444', marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{title}</div>
                    {body && <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body}</div>}
                    <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{relativeTime(n.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
