// Tight ESLint config used as a pre-deploy crash gate. Only enables rules
// whose violations cause runtime crashes — no style, no unused vars, no
// hook-rule chatter (those exist in older code but happen to work in
// practice). Goal: catch the SPECIFIC class of bug `useEffect is not
// defined` would have flagged at build time, with zero false positives.
//
// Run via: `npm run lint:deploy-gate`
// Wired into deploy:prod and deploy:staging.

import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'plumenexus', 'mobile', 'cloudflare']),
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vite injects these at build time via `define` in vite.config.js
        __APP_VERSION__: 'readonly',
        __BUILD_DATE__:  'readonly',
        __BUILD_SHA__:   'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Crash-class rules ONLY — every one of these is something that
      // throws at runtime, not a style nit:
      'no-undef':              'error',  // the bug we hit
      'no-undef-init':         'error',
      'no-redeclare':          'error',
      'no-dupe-keys':          'error',
      'no-dupe-args':          'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if':       'error',
      'no-const-assign':       'error',  // TypeError at runtime
      'no-import-assign':      'error',
      'no-class-assign':       'error',
      'no-func-assign':        'error',
      'no-this-before-super':  'error',
      'no-unreachable':        'error',
      'getter-return':         'error',
      'valid-typeof':          'error',
      'no-unsafe-finally':     'error',
      'no-unsafe-negation':    'error',
      'no-self-assign':        'error',
      'no-self-compare':       'error',
      'use-isnan':             'error',
    },
  },
]);
