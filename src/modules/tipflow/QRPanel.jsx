import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QR_SIZE } from '../../utils/helpers';

const VENMO_SVG = (
  <svg viewBox="0 0 148 44" xmlns="http://www.w3.org/2000/svg" width={148} height={44}>
    <rect width="148" height="44" rx="8" fill="#3D95CE"/>
    <text x="74" y="30" textAnchor="middle" fontFamily="-apple-system,system-ui,sans-serif" fontSize="24" fontWeight="700" fill="white">Venmo</text>
  </svg>
);
const IG_SVG = (
  <svg viewBox="0 0 148 44" xmlns="http://www.w3.org/2000/svg" width={148} height={44}>
    <rect width="148" height="44" rx="8" fill="#E1306C"/>
    <rect x="8" y="10" width="24" height="24" rx="6" fill="none" stroke="white" strokeWidth="2.2"/>
    <circle cx="20" cy="22" r="6.2" fill="none" stroke="white" strokeWidth="2.2"/>
    <circle cx="28.5" cy="13.5" r="2.5" fill="white"/>
    <text x="95" y="30" textAnchor="middle" fontFamily="-apple-system,system-ui,sans-serif" fontSize="19" fontWeight="700" fill="white">Instagram</text>
  </svg>
);
const FB_SVG = (
  <svg viewBox="0 0 148 44" xmlns="http://www.w3.org/2000/svg" width={148} height={44}>
    <rect width="148" height="44" rx="8" fill="#1877F2"/>
    <text x="16" y="32" fontFamily="-apple-system,system-ui,sans-serif" fontSize="28" fontWeight="900" fill="white">f</text>
    <text x="95" y="30" textAnchor="middle" fontFamily="-apple-system,system-ui,sans-serif" fontSize="19" fontWeight="700" fill="white">Facebook</text>
  </svg>
);
const WEB_SVG = (
  <svg viewBox="0 0 148 44" xmlns="http://www.w3.org/2000/svg" width={148} height={44}>
    <rect width="148" height="44" rx="8" fill="#0D9488"/>
    <circle cx="19" cy="22" r="9" fill="none" stroke="white" strokeWidth="1.8"/>
    <line x1="19" y1="13" x2="19" y2="31" stroke="white" strokeWidth="1.4"/>
    <line x1="10" y1="22" x2="28" y2="22" stroke="white" strokeWidth="1.4"/>
    <path d="M11.5 17c2 1.8 4.5 3 7.5 3s5.5-1.2 7.5-3M11.5 27c2-1.8 4.5-3 7.5-3s5.5 1.2 7.5 3" stroke="white" strokeWidth="1.4" fill="none"/>
    <text x="95" y="30" textAnchor="middle" fontFamily="-apple-system,system-ui,sans-serif" fontSize="19" fontWeight="700" fill="white">Website</text>
  </svg>
);

function getItems(slide) {
  const r = [];
  if (slide.vu) r.push({ id: 'v', url: `https://venmo.com/u/${slide.vu}`,    handle: `@${slide.vu}`, icon: VENMO_SVG });
  if (slide.iu) r.push({ id: 'i', url: `https://instagram.com/${slide.iu}`,  handle: `@${slide.iu}`, icon: IG_SVG });
  if (slide.fu) r.push({ id: 'f', url: `https://facebook.com/${slide.fu}`,   handle: `@${slide.fu}`, icon: FB_SVG });
  if (slide.hu) r.push({ id: 'h', url: slide.hu, handle: slide.hu.replace(/^https?:\/\//, '').replace(/\/$/, ''), icon: WEB_SVG });
  return r;
}

export default function QRPanel({ slide }) {
  const items    = getItems(slide);
  const tappable = items.length > 1;
  const [tab, setTab] = useState(0);

  useEffect(() => setTab(0), [slide]);

  if (!items.length) {
    return <div style={{ color: '#ccc', fontSize: 12 }}>No links added</div>;
  }

  const item = items[tab];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', cursor: tappable ? 'pointer' : 'default', userSelect: 'none' }}
         onClick={() => tappable && setTab(t => (t + 1) % items.length)}>
      {tappable && <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, color: '#bbb' }}>tap to switch</div>}
      {item.icon}
      <QRCodeSVG value={item.url} size={QR_SIZE} bgColor="#fff" fgColor="#1a1a1a" level="M" />
      <div style={{ fontSize: 12, fontWeight: 500, color: '#666', textAlign: 'center' }}>{item.handle}</div>
      {tappable && (
        <div style={{ position: 'absolute', bottom: 9, display: 'flex', gap: 5 }}>
          {items.map((_, j) => (
            <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: j === tab ? '#333' : '#ccc', transition: 'background .2s' }} />
          ))}
        </div>
      )}
    </div>
  );
}
