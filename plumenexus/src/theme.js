// Plume Nexus brand tokens. Premium, multi-industry feel.
// Anchors: deep ink-blue (trust), soft plum (the "plume"), warm cream (lift).

// ── Founders' Year ──────────────────────────────────────────────
// PLACEHOLDER — adjust when actual launch date is set. Founders' Members
// who sign up before this date get free Solo for life. After this date,
// Solo becomes a paid tier for new signups.
export const FOUNDERS_YEAR_END_ISO  = '2027-06-30';
export const FOUNDERS_YEAR_END_LONG = 'June 30, 2027';

export const C = {
  ink:        '#0f1923',
  inkSoft:    '#1f2937',
  text:       '#1a1f2e',
  muted:      '#5e6776',
  mutedSoft:  '#8b94a3',
  rule:       '#e7e3ee',
  ruleSoft:   '#f1edf6',
  bg:         '#ffffff',
  bgSoft:     '#fbfaff',
  bgCream:    '#f7f4ee',
  plum:       '#5b3b8c',
  plumDeep:   '#3f2767',
  plumSoft:   '#a288c9',
  blue:       '#3d95ce',
  blueDeep:   '#1f6ea3',
  teal:       '#3d9e8a',
  gold:       '#c19a4a',
  success:    '#2D7A5F',
  danger:     '#ef4444',
};

export const FONT = {
  display: "'Cinzel', Georgia, serif",
  script:  "'Great Vibes', cursive",
  body:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const grad = {
  primary:  `linear-gradient(135deg, ${C.plum}, ${C.blue})`,
  primaryDeep: `linear-gradient(135deg, ${C.plumDeep}, ${C.blueDeep})`,
  ink:      `linear-gradient(135deg, ${C.ink}, ${C.inkSoft})`,
  cream:    `linear-gradient(180deg, #ffffff 0%, ${C.bgCream} 100%)`,
};

export const shadow = {
  sm: '0 2px 8px rgba(15,25,35,.05)',
  md: '0 8px 24px rgba(15,25,35,.08)',
  lg: '0 16px 48px rgba(15,25,35,.12)',
  brand: '0 12px 36px rgba(91,59,140,.25)',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
};
