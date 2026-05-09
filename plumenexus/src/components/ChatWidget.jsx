import { useState, useEffect, useRef } from 'react';
import { C, FONT, grad, shadow, radius } from '../theme.js';
import { callMarketingChat } from '../lib/firebase.js';

const SUGGESTIONS = [
  'What makes Plume Nexus different?',
  'Can I migrate from my current platform?',
  'How does the AI reporting actually work?',
  'What does pricing look like for a 6-tech salon?',
];

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMsgs]   = useState([
    {
      role: 'assistant',
      content: "Hey there! I'm Plume — Plume Nexus's AI assistant. Ask me anything about the platform, pricing, migration, or specific features. I'll loop in the founder for anything I can't answer.",
    },
  ]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const fabRef    = useRef(null);
  const panelRef  = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Esc closes the widget and returns focus to the FAB. Tab is loosely trapped
  // to the panel — focus naturally cycles between the textarea, send button,
  // and close button without escaping to the page below.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        fabRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const next = [...messages, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setSending(true);
    setError('');

    try {
      // Send only the role+content pairs to the function — keep payload tight
      const wireMsgs = next.map(m => ({ role: m.role, content: m.content }));
      const res = await callMarketingChat({ messages: wireMsgs });
      const reply = res?.data?.reply || "I'm not sure how to answer that — let me get the founder. Drop your email below or use the contact form?";
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e?.message || 'Connection hiccup. Try again?');
      setMsgs(m => [...m, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Use the contact form below and the founder will reply directly within a business day.",
      }]);
    } finally {
      setSending(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        ref={fabRef}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat with Plume Nexus AI' : 'Open chat with Plume Nexus AI'}
        aria-expanded={open}
        aria-controls="pn-chat-panel"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 60, height: 60,
          borderRadius: '50%',
          border: 'none',
          background: open ? C.plumDeep : grad.primary,
          color: '#fff',
          fontSize: 26,
          cursor: 'pointer',
          boxShadow: shadow.brand,
          zIndex: 80,
          transition: 'transform .15s, background .15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Pulse ring (only when closed) */}
      {!open && (
        <span style={{
          position: 'fixed', right: 24, bottom: 24, width: 60, height: 60,
          borderRadius: '50%', pointerEvents: 'none', zIndex: 79,
          animation: 'pn-pulse 2.4s ease-out infinite',
          background: 'transparent',
          border: `2px solid ${C.plum}`,
        }} />
      )}

      {open && (
        <div
          id="pn-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Plume Nexus chat assistant"
          style={{
          position: 'fixed',
          right: 24,
          bottom: 96,
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          height: 540,
          maxHeight: 'calc(100vh - 130px)',
          background: '#fff',
          border: `1px solid ${C.rule}`,
          borderRadius: radius.lg,
          boxShadow: shadow.lg,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 81,
          animation: 'pn-pop 200ms cubic-bezier(.34, 1.56, .64, 1) both',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: grad.primaryDeep,
            color: '#fff',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 600, letterSpacing: '.02em' }}>Plume</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5eeb95', boxShadow: '0 0 6px #5eeb95' }} />
                Online · AI assistant
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close"
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', opacity: .8 }}>×</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            background: C.bgSoft,
            scrollBehavior: 'smooth',
          }}>
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  padding: '10px 14px',
                  background: '#fff',
                  border: `1px solid ${C.rule}`,
                  borderRadius: '14px 14px 14px 4px',
                  fontSize: 14, color: C.muted,
                }}>
                  <span className="pn-dots">
                    <span style={{ animation: 'pn-blink 1.4s infinite both' }}>·</span>
                    <span style={{ animation: 'pn-blink 1.4s .2s infinite both' }}>·</span>
                    <span style={{ animation: 'pn-blink 1.4s .4s infinite both' }}>·</span>
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div style={{ fontSize: 11, color: '#b91c1c', textAlign: 'center', marginTop: 8 }}>{error}</div>
            )}
          </div>

          {/* Suggestion chips, only when conversation is fresh */}
          {messages.length <= 1 && !sending && (
            <div style={{ padding: '8px 14px 0', display: 'flex', flexWrap: 'wrap', gap: 6, background: C.bgSoft, borderTop: `1px solid ${C.ruleSoft}` }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={s} onClick={() => send(s)}
                  className="pn-chip"
                  style={{
                  padding: '6px 11px', fontSize: 11.5, fontWeight: 500,
                  background: '#fff', border: `1px solid ${C.rule}`,
                  borderRadius: 999, cursor: 'pointer', color: C.text,
                  fontFamily: FONT.body,
                  transition: 'background .12s, border-color .12s',
                  animationDelay: `${i * 60}ms`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.plum}10`; e.currentTarget.style.borderColor = `${C.plum}55`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.rule; }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: 12,
            background: C.bgSoft,
            borderTop: `1px solid ${C.ruleSoft}`,
            display: 'flex', gap: 8,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anything about Plume Nexus..."
              rows={1}
              disabled={sending}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: 14, lineHeight: 1.4,
                fontFamily: FONT.body,
                color: C.ink,
                background: '#fff',
                border: `1px solid ${C.rule}`,
                borderRadius: 14,
                outline: 'none',
                resize: 'none',
                maxHeight: 100,
              }}
              onFocus={e => e.target.style.borderColor = C.plum}
              onBlur={e => e.target.style.borderColor = C.rule}
            />
            <button onClick={() => send()} disabled={sending || !input.trim()}
              aria-label="Send message"
              style={{
              width: 42, height: 42, alignSelf: 'flex-end',
              borderRadius: '50%', border: 'none',
              background: input.trim() && !sending ? grad.primary : C.rule,
              color: input.trim() && !sending ? '#fff' : C.mutedSoft,
              cursor: input.trim() && !sending ? 'pointer' : 'default',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .12s',
            }}>↑</button>
          </div>

          <div style={{
            padding: '6px 14px 10px', fontSize: 10, color: C.mutedSoft,
            background: C.bgSoft, textAlign: 'center',
          }}>
            This chat may include AI-generated answers.
          </div>
        </div>
      )}

      <style>{`
        @keyframes pn-pop {
          from { opacity: 0; transform: scale(.9) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pn-pulse {
          0%   { transform: scale(1);   opacity: .55; }
          80%  { transform: scale(1.6); opacity: 0;   }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        @keyframes pn-blink {
          0%, 80%, 100% { opacity: .25; }
          40%           { opacity: 1;   }
        }
        @keyframes pn-bubble-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pn-chip-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pn-dots span { font-size: 24px; line-height: 0; }
        .pn-bubble    { animation: pn-bubble-in .22s cubic-bezier(.34, 1.4, .64, 1) both; }
        .pn-chip      { animation: pn-chip-in .25s ease both; }
      `}</style>
    </>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className="pn-bubble" style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? grad.primary : '#fff',
        color: isUser ? '#fff' : C.text,
        border: isUser ? 'none' : `1px solid ${C.rule}`,
        fontSize: 14, lineHeight: 1.5,
        boxShadow: isUser ? 'none' : '0 1px 3px rgba(15,25,35,.04)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  );
}
