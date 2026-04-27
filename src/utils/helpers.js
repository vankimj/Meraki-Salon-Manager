export function clean(val) {
  return (val || '').trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
}

export function normURL(u) {
  u = (u || '').trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u;
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function phSVG(color) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">
    <rect width="300" height="400" fill="${color}"/>
    <circle cx="150" cy="140" r="60" fill="rgba(255,255,255,.15)"/>
    <ellipse cx="150" cy="320" rx="100" ry="70" fill="rgba(255,255,255,.1)"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
}

export function resizeImg(src, maxW, maxH, quality) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height, ar = w / h;
      if (w > maxW) { w = maxW; h = w / ar; }
      if (h > maxH) { h = maxH; w = h * ar; }
      const c = document.createElement('canvas');
      c.width  = Math.round(w);
      c.height = Math.round(h);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.src = src;
  });
}

export const QR_SIZE = 148;

export const PLACEHOLDER_COLORS = ['#4A7DB5', '#2D7A5F', '#7B5EA7', '#C0622F', '#2A8A8A'];
