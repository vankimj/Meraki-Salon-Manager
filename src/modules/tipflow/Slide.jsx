import QRPanel from './QRPanel';

export default function Slide({ slide, isDefault }) {
  const hasName = !!(slide.name?.trim());
  return (
    <div style={{ minWidth: '100%', height: '100%', display: 'flex', padding: 10, gap: 9 }}>
      {/* Left: photo + nameplate */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden', background: '#efefef' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          {slide.img
            ? <img src={slide.img} alt="headshot" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#ccc' }}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <span style={{ fontSize: 11 }}>No photo</span>
              </div>
          }
          {isDefault && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(245,158,11,.92)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 20, letterSpacing: '.04em' }}>DEFAULT</div>
          )}
        </div>
        <div style={{ flexShrink: 0, height: 54, background: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 14px' }}>
          {hasName
            ? <span style={{ fontFamily: 'Georgia,Palatino,serif', fontSize: 15, letterSpacing: '.025em', color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{slide.name}</span>
            : <span style={{ fontFamily: 'Georgia,Palatino,serif', fontSize: 12, color: '#ccc', fontStyle: 'italic' }}>No name</span>
          }
        </div>
      </div>

      {/* Right: QR panel */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 10px 28px', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <QRPanel slide={slide} />
      </div>
    </div>
  );
}
