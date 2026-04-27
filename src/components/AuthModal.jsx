import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal({ onClose, onSuccess }) {
  const { signIn, sendMagicLink } = useApp();
  const [status,    setStatus]    = useState('');
  const [email,     setEmail]     = useState('');
  const [sending,   setSending]   = useState(false);
  const [linkSent,  setLinkSent]  = useState(false);

  async function handleGoogleSignIn() {
    setStatus('');
    const result = await signIn();
    if (result.ok) { onSuccess?.(); onClose(); }
    else if (result.reason) setStatus(result.reason);
  }

  async function handleSendLink() {
    if (!email.trim()) return;
    setSending(true);
    setStatus('');
    try {
      await sendMagicLink(email.trim());
      setLinkSent(true);
    } catch (e) {
      setStatus(e.message || 'Failed to send sign-in link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

        {/* Icon + title */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#2D7A5F,#4A7DB5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Sign in</h3>
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Access is granted by an administrator.</p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignIn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: 12, border: '1px solid #d0d0d0', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: '#fff', fontFamily: 'inherit', marginBottom: 16 }}>
          <svg width={18} height={18} viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
        </div>

        {/* Email magic link */}
        {linkSent ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Check your inbox</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
              We sent a sign-in link to <strong>{email}</strong>. Click the link to sign in — no password needed.
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                placeholder="you@example.com"
                style={{ width: '100%', fontFamily: 'inherit', border: '1px solid #d8d8d8', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={handleSendLink} disabled={sending || !email.trim()}
              style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: sending || !email.trim() ? '#d0d0d0' : '#2D7A5F', color: '#fff', fontSize: 14, fontWeight: 600, cursor: sending || !email.trim() ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {sending ? 'Sending…' : 'Send sign-in link'}
            </button>
          </>
        )}

        {status && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 10, textAlign: 'center' }}>{status}</div>}

        <button onClick={onClose}
          style={{ width: '100%', marginTop: 12, color: '#aaa', border: 'none', background: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
