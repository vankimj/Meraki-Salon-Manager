import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const FLOATERS = [
  { left: '4%',  dur: '9s',  delay: '0s'   },
  { left: '14%', dur: '13s', delay: '2.5s' },
  { left: '26%', dur: '11s', delay: '1s'   },
  { left: '38%', dur: '15s', delay: '4s'   },
  { left: '52%', dur: '10s', delay: '0.5s' },
  { left: '65%', dur: '12s', delay: '3s'   },
  { left: '78%', dur: '14s', delay: '5.5s' },
  { left: '90%', dur: '9s',  delay: '2s'   },
];

function SeasonalDecoration({ theme }) {
  const { seasonal } = theme;
  if (!seasonal) return null;
  const down = seasonal.dir === 'down';

  return (
    <>
      <style>{`
        @keyframes tmFloatUp {
          0%   { transform: translateY(105vh) rotate(0deg);   opacity: 0; }
          5%   { opacity: 0.65; }
          95%  { opacity: 0.65; }
          100% { transform: translateY(-80px)  rotate(360deg); opacity: 0; }
        }
        @keyframes tmFloatDown {
          0%   { transform: translateY(-60px)  rotate(0deg);   opacity: 0; }
          5%   { opacity: 0.7; }
          95%  { opacity: 0.7; }
          100% { transform: translateY(105vh) rotate(-360deg); opacity: 0; }
        }
        .tm-floater {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          user-select: none;
          font-size: 18px;
          line-height: 1;
        }
      `}</style>
      {FLOATERS.map((f, i) => (
        <div key={i} className="tm-floater" style={{
          left:     f.left,
          [down ? 'top' : 'bottom']: '-40px',
          animation: `${down ? 'tmFloatDown' : 'tmFloatUp'} ${f.dur} ${f.delay} infinite linear`,
        }}>
          {seasonal.emoji}
        </div>
      ))}
    </>
  );
}

export default function ThemeProvider({ children }) {
  const { activeTheme: t } = useApp();

  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty('--tm-primary',   t.primary);
    s.setProperty('--tm-accent',    t.accent);
    s.setProperty('--tm-grad',      `linear-gradient(135deg, ${t.gradStart} 0%, ${t.gradEnd} 100%)`);
    s.setProperty('--tm-grad-dark', `linear-gradient(135deg, ${t.dark} 0%, ${t.gradStart} 100%)`);
    s.setProperty('--tm-dark',      t.dark);
    s.setProperty('--tm-bg',        t.bg);
    s.setProperty('--tm-card',      t.cardBg);
    s.setProperty('--tm-border',    t.border);
    s.setProperty('--tm-text',      t.text);
    s.setProperty('--tm-muted',     t.muted);
  }, [t]);

  return (
    <>
      <SeasonalDecoration theme={t} />
      {children}
    </>
  );
}
