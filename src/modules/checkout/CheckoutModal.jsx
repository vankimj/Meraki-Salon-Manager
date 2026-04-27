import { useState } from 'react';
import { saveAppointment } from '../../lib/firestore';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',  icon: '💵' },
  { id: 'card',  label: 'Card',  icon: '💳' },
  { id: 'venmo', label: 'Venmo', icon: '🅥' },
  { id: 'zelle', label: 'Zelle', icon: 'Z'  },
];

const DISCOUNT_TYPES = [
  { id: null,      label: 'None'  },
  { id: 'ff',      label: 'F&F',   isPercent: true,  hint: '%',  default: 20 },
  { id: 'percent', label: '% Off', isPercent: true,  hint: '%',  default: 10 },
  { id: 'fixed',   label: '$ Off', isPercent: false, hint: '$',  default: 5  },
];

const QUICK_TIPS = [5, 10, 15, 20];

export default function CheckoutModal({ appt, onComplete, onClose }) {
  const [prices, setPrices] = useState(
    (appt.services || []).map(s => String(s.price ?? ''))
  );
  const [discountType,  setDiscountType]  = useState(null);
  const [discountValue, setDiscountValue] = useState('');
  const [tip,           setTip]           = useState('');
  const [customTip,     setCustomTip]     = useState(false);
  const [method,        setMethod]        = useState('card');
  const [saving,        setSaving]        = useState(false);

  const subtotal = prices.reduce((s, p) => s + (Number(p) || 0), 0);

  const discountDef = DISCOUNT_TYPES.find(d => d.id === discountType);
  const discountAmount = (() => {
    if (!discountType || !discountValue) return 0;
    const v = Number(discountValue) || 0;
    return discountDef.isPercent
      ? Math.round(subtotal * v / 100 * 100) / 100
      : Math.min(v, subtotal);
  })();

  const tipAmt = Number(tip) || 0;
  const total  = Math.max(subtotal - discountAmount + tipAmt, 0);

  function pickDiscount(id) {
    const def = DISCOUNT_TYPES.find(d => d.id === id);
    setDiscountType(id);
    setDiscountValue(id && def.default ? String(def.default) : '');
  }

  function pickQuickTip(amt) {
    setTip(String(amt));
    setCustomTip(false);
  }

  async function complete() {
    setSaving(true);
    try {
      const updatedServices = (appt.services || []).map((s, i) => ({
        ...s, price: Number(prices[i]) || 0,
      }));
      const payment = {
        subtotal,
        discountType:   discountType || null,
        discountValue:  Number(discountValue) || 0,
        discountAmount,
        tip:            tipAmt,
        total,
        method,
        paidAt:         new Date().toISOString(),
      };
      const { id, createdAt, ...data } = appt;
      await saveAppointment(id, { ...data, services: updatedServices, status: 'done', payment });
      onComplete();
    } catch (e) {
      console.error('[Checkout] save failed:', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '94%', maxWidth: 480, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

        {/* Header */}
        <div style={{ padding: '14px 18px', borderRadius: '16px 16px 0 0', background: 'linear-gradient(135deg,#2D7A5F 0%,#3D95CE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{appt.clientName || 'Walk-in'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>
              {appt.techName} · {new Date(appt.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)', cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

          {/* Services */}
          <Section title="Services">
            {(appt.services || []).map((svc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < appt.services.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <span style={{ fontSize: 13, color: '#333', flex: 1, paddingRight: 12 }}>{svc.name || '—'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#aaa' }}>$</span>
                  <input
                    type="number" min={0} value={prices[i]}
                    onChange={e => setPrices(p => p.map((v, idx) => idx === i ? e.target.value : v))}
                    style={{ width: 68, fontFamily: 'inherit', border: '1px solid #d8d8d8', borderRadius: 6, padding: '4px 6px', fontSize: 13, textAlign: 'right', background: '#fafafa', color: '#1a1a1a' }}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
              <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>${subtotal}</span>
            </div>
          </Section>

          {/* Discount */}
          <Section title="Discount">
            <div style={{ display: 'flex', gap: 6, marginBottom: discountType ? 10 : 0 }}>
              {DISCOUNT_TYPES.map(d => (
                <button key={String(d.id)} onClick={() => pickDiscount(d.id)}
                  style={{ flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1.5px solid ${discountType === d.id ? '#3D95CE' : '#e0e0e0'}`, background: discountType === d.id ? '#EBF4FB' : '#fafafa', color: discountType === d.id ? '#1a5f8a' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {d.label}
                </button>
              ))}
            </div>
            {discountType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" min={0} value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder={discountDef?.hint}
                  style={{ flex: 1, fontFamily: 'inherit', border: '1px solid #d8d8d8', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#fafafa' }}
                />
                {discountAmount > 0 && (
                  <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, flexShrink: 0 }}>
                    −${discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </Section>

          {/* Tip */}
          <Section title="Tip">
            <div style={{ display: 'flex', gap: 6, marginBottom: customTip ? 10 : 0 }}>
              {QUICK_TIPS.map(amt => {
                const active = Number(tip) === amt && !customTip;
                return (
                  <button key={amt} onClick={() => pickQuickTip(amt)}
                    style={{ flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1.5px solid ${active ? '#2D7A5F' : '#e0e0e0'}`, background: active ? '#EDFAF3' : '#fafafa', color: active ? '#166534' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ${amt}
                  </button>
                );
              })}
              <button onClick={() => { setCustomTip(true); setTip(''); }}
                style={{ flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1.5px solid ${customTip ? '#2D7A5F' : '#e0e0e0'}`, background: customTip ? '#EDFAF3' : '#fafafa', color: customTip ? '#166534' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
                Other
              </button>
            </div>
            {customTip && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#aaa' }}>$</span>
                <input type="number" min={0} value={tip} onChange={e => setTip(e.target.value)}
                  placeholder="0" autoFocus
                  style={{ flex: 1, fontFamily: 'inherit', border: '1px solid #d8d8d8', borderRadius: 8, padding: '7px 10px', fontSize: 13, background: '#fafafa' }}
                />
              </div>
            )}
          </Section>

          {/* Payment method */}
          <Section title="Payment Method">
            <div style={{ display: 'flex', gap: 8 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 6px', borderRadius: 10, border: `1.5px solid ${method === m.id ? '#3D95CE' : '#e0e0e0'}`, background: method === m.id ? '#EBF4FB' : '#fafafa', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: method === m.id ? '#1a5f8a' : '#888' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Total */}
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '14px 16px' }}>
            <SummaryRow label="Subtotal" value={`$${subtotal}`} />
            {discountAmount > 0 && (
              <SummaryRow
                label={discountType === 'ff' ? 'Friends & Family' : 'Discount'}
                value={`−$${discountAmount.toFixed(2)}`}
                valueColor="#22c55e"
              />
            )}
            {tipAmt > 0 && <SummaryRow label="Tip" value={`$${tipAmt}`} />}
            <div style={{ borderTop: '1px solid #e8e8e8', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#2D7A5F' }}>${total.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
          <button onClick={complete} disabled={saving}
            style={{ width: '100%', background: saving ? '#aaa' : 'linear-gradient(135deg,#2D7A5F 0%,#3D95CE 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Processing…' : `Complete Checkout · $${total.toFixed(2)}`}
          </button>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor || '#333' }}>{value}</span>
    </div>
  );
}
