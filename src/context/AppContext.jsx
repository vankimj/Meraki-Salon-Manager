import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, ALLOWED_EMAILS } from '../lib/firebase';
import { loadAll, saveSlides, saveUsers, saveSettings, submitAccessRequest, fetchAccessRequests, deleteAccessRequest } from '../lib/firestore';
import { migrateFromLegacy } from '../lib/migration';
import { logActivity, setLoggerUser } from '../lib/logger';
import { phSVG } from '../utils/helpers';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULTS = {
  slides: [
    { img: phSVG('#4A7DB5'), name: 'Jane Smith',      vu: 'janesmith',  iu: 'janesmith',  fu: null, hu: null },
    { img: phSVG('#2D7A5F'), name: 'Robert Johnson',  vu: 'robertj',    iu: 'robertj',    fu: null, hu: null },
  ],
  def: 0,
  cur: 0,
};

export function AppProvider({ children }) {
  const [slides,   setSlides]   = useState([]);
  const [def,      setDef]      = useState(0);
  const [cur,      setCur]      = useState(0);
  const [users,    setUsers]    = useState([]);
  const [settings, setSettings] = useState({ timeoutMin: 5 });
  const [gUser,           setGUser]           = useState(null);
  const [syncState,       setSyncState]       = useState('idle');
  const [toast,           setToast]           = useState(null);
  const [loaded,          setLoaded]          = useState(false);
  const [magicLinkPending,setMagicLinkPending]= useState(false);

  const logoutTimer    = useRef(null);
  const inactivityTimer= useRef(null);
  const toastTimer     = useRef(null);

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((msg, dur = 2200) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), dur);
  }, []);

  // ── Sync dot ───────────────────────────────────────────
  const setSyncDot = useCallback((s) => setSyncState(s), []);

  // ── Inactivity timer (return to default slide) ─────────
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setCur(prev => prev === def ? prev : def);
    }, 60000);
  }, [def]);

  // ── Auto-logout ────────────────────────────────────────
  const startLogoutTimer = useCallback((user, timeoutMin) => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      if (user) { fbSignOut(auth); showToast(`Auto-logged out after ${timeoutMin} min inactivity`); }
    }, (timeoutMin || 5) * 60 * 1000);
  }, [showToast]);

  const resetLogoutTimer = useCallback(() => {
    if (gUser) startLogoutTimer(gUser, settings.timeoutMin);
  }, [gUser, settings.timeoutMin, startLogoutTimer]);

  // ── Firestore load ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      setSyncDot('syncing');
      await migrateFromLegacy();
      try {
        const data = await loadAll();
        if (data.slides) {
          setSlides(data.slides);
          setDef(data.def);
          setCur(data.def);
        } else {
          setSlides(DEFAULTS.slides);
        }
        setUsers(data.users);
        setSettings(s => ({ ...s, ...data.settings }));
        setSyncDot('ok');
      } catch (e) {
        console.error('[AppContext] loadAll error:', e);
        setSyncDot('err');
        setSlides(DEFAULTS.slides);
      }
      setLoaded(true);
    })();
  }, []);

  // ── Auth state ─────────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (user) {
        await checkUserAccess(user);
      } else {
        clearTimeout(logoutTimer.current);
        setGUser(null);
        setLoggerUser(null);
      }
    });
  }, []); // eslint-disable-line

  async function checkUserAccess(user) {
    let currentUsers = users;
    try {
      const data = await loadAll();
      currentUsers = data.users;
      setUsers(currentUsers);
    } catch (_) {}

    if (ALLOWED_EMAILS.includes(user.email)) {
      let rec = currentUsers.find(u => u.email === user.email);
      if (!rec) {
        rec = { email: user.email, name: user.displayName || user.email, picture: user.photoURL || '', role: 'admin', requestedAt: new Date().toISOString(), grantedAt: new Date().toISOString() };
        const updated = [...currentUsers, rec];
        setUsers(updated);
        await saveUsers(updated);
      } else if (rec.role !== 'admin') {
        const updated = currentUsers.map(u => u.email === user.email ? { ...u, role: 'admin', grantedAt: new Date().toISOString() } : u);
        setUsers(updated);
        await saveUsers(updated);
      }
      setGUser(user);
      setLoggerUser(user);
      startLogoutTimer(user, settings.timeoutMin);
      logActivity('user_login', 'admin');
      // Run migration now that we're authenticated as admin, then reload fresh data
      await migrateFromLegacy();
      try {
        const fresh = await loadAll();
        if (fresh.slides?.length) {
          setSlides(fresh.slides);
          setDef(fresh.def);
          setCur(fresh.def);
          setUsers(fresh.users);
          setSettings(s => ({ ...s, ...fresh.settings }));
        }
      } catch (_) {}
      return { ok: true };
    }

    const rec = currentUsers.find(u => u.email === user.email);
    if (!rec) {
      // Write to requests collection (any authenticated user can write their own)
      try {
        await submitAccessRequest(user.uid, {
          email:   user.email,
          name:    user.displayName || user.email,
          picture: user.photoURL || '',
        });
        logActivity('access_requested', user.email);
      } catch (e) {
        console.error('[Auth] access request write failed:', e);
      }
      await fbSignOut(auth);
      return { ok: false, reason: 'Access requested. An admin will grant you access.' };
    }
    if (rec.role === 'pending') { logActivity('login_blocked', 'pending', user.email); await fbSignOut(auth); return { ok: false, reason: 'Your access request is pending admin approval.' }; }
    if (rec.role === 'denied')  { logActivity('login_blocked', 'denied',  user.email); await fbSignOut(auth); return { ok: false, reason: 'Access denied. Contact an administrator.' }; }

    setGUser(user);
    setLoggerUser(user);
    startLogoutTimer(user, settings.timeoutMin);
    logActivity('user_login', rec.role);
    return { ok: true };
  }

  // ── Slide ops ──────────────────────────────────────────
  const persistSlides = useCallback(async (newSlides, newDef, newCur) => {
    setSlides(newSlides); setDef(newDef); setCur(newCur);
    setSyncDot('syncing');
    try { await saveSlides(newSlides, newDef, newCur); setSyncDot('ok'); }
    catch (e) { setSyncDot('err'); showToast('Save failed — ' + e.message, 4000); }
  }, [showToast]);

  const addSlide    = useCallback(async (slide) => { const ns = [...slides, slide]; await persistSlides(ns, def, ns.length - 1); }, [slides, def, persistSlides]);
  const updateSlide = useCallback(async (i, slide) => { const ns = slides.map((s, idx) => idx === i ? slide : s); await persistSlides(ns, def, cur); }, [slides, def, cur, persistSlides]);
  const deleteSlide = useCallback(async (i) => {
    const ns  = slides.filter((_, idx) => idx !== i);
    const nd  = ns.length ? Math.min(def, ns.length - 1) : 0;
    const nc  = ns.length ? Math.min(i, ns.length - 1)   : 0;
    await persistSlides(ns, nd, nc);
  }, [slides, def, persistSlides]);
  const setDefault  = useCallback(async (i) => { await persistSlides(slides, i, cur); }, [slides, cur, persistSlides]);

  // ── User ops ───────────────────────────────────────────
  const grantAccess = useCallback(async (email, role, techName) => {
    const prev    = users.find(u => u.email === email)?.role;
    const updated = users.map(u => u.email === email ? {
      ...u, role,
      techName: role === 'tech' ? (techName !== undefined ? techName : u.techName) : null,
      grantedAt: new Date().toISOString(),
    } : u);
    setUsers(updated);
    logActivity('access_changed', `${email} ${prev}→${role}`);
    setSyncDot('syncing');
    try { await saveUsers(updated); setSyncDot('ok'); showToast('Access updated'); }
    catch (e) { setSyncDot('err'); showToast('Save failed: ' + e.message, 4000); }
  }, [users, showToast]);

  // ── Pending access requests ────────────────────────────
  const loadPendingRequests = useCallback(() => fetchAccessRequests(), []);

  const grantPendingAccess = useCallback(async (req, role, techName) => {
    const newUser = {
      email:       req.email,
      name:        req.name,
      picture:     req.picture || '',
      role,
      techName:    role === 'tech' ? (techName || null) : null,
      requestedAt: req.requestedAt || new Date().toISOString(),
      grantedAt:   new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    logActivity('access_changed', `${req.email} pending→${role}`);
    setSyncDot('syncing');
    try {
      await saveUsers(updated);
      await deleteAccessRequest(req.uid);
      setSyncDot('ok');
      showToast('Access updated');
    } catch (e) {
      setSyncDot('err');
      showToast('Save failed: ' + e.message, 4000);
    }
  }, [users, showToast]);

  // ── Settings ops ───────────────────────────────────────
  const updateSettings = useCallback(async (next) => {
    setSettings(next);
    startLogoutTimer(gUser, next.timeoutMin);
    logActivity('settings_saved', `timeout=${next.timeoutMin}min`);
    setSyncDot('syncing');
    try { await saveSettings(next); setSyncDot('ok'); showToast('Settings saved'); }
    catch { setSyncDot('err'); showToast('Save failed', 3000); }
  }, [gUser, startLogoutTimer, showToast]);

  // ── Magic link auth ────────────────────────────────────
  async function doCompleteMagicLink(email) {
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('[MagicLink]', e);
      showToast('Sign-in link was invalid or expired.', 4000);
    } finally {
      setMagicLinkPending(false);
    }
  }

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    const savedEmail = window.localStorage.getItem('emailForSignIn');
    if (savedEmail) {
      doCompleteMagicLink(savedEmail);
    } else {
      setMagicLinkPending(true);
    }
  }, []); // eslint-disable-line

  const sendMagicLink = useCallback(async (email) => {
    await sendSignInLinkToEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: true,
    });
    window.localStorage.setItem('emailForSignIn', email);
  }, []);

  const completeMagicLink = useCallback((email) => doCompleteMagicLink(email), []); // eslint-disable-line

  // ── Sign in / out ──────────────────────────────────────
  const signIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      return await checkUserAccess(result.user);
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') return { ok: false, reason: 'Sign-in failed: ' + e.message };
      return { ok: false, reason: '' };
    }
  }, []); // eslint-disable-line

  const signOut = useCallback(async () => {
    logActivity('user_logout');
    clearTimeout(logoutTimer.current);
    await fbSignOut(auth);
    showToast('Signed out');
  }, [showToast]);

  const _rec       = gUser ? users.find(u => u.email === gUser.email) : null;
  const isAdmin    = _rec?.role === 'admin';
  const isReadOnly = ['admin', 'readonly'].includes(_rec?.role);
  const isTech     = _rec?.role === 'tech';
  const myTechName = _rec?.techName || null;

  return (
    <Ctx.Provider value={{
      slides, def, cur, setCur,
      users, settings,
      gUser, syncState, toast, loaded,
      isAdmin, isReadOnly, isTech, myTechName,
      showToast, resetInactivity, resetLogoutTimer,
      addSlide, updateSlide, deleteSlide, setDefault,
      grantAccess, grantPendingAccess, loadPendingRequests, updateSettings,
      signIn, signOut, sendMagicLink, completeMagicLink, magicLinkPending,
    }}>
      {children}
    </Ctx.Provider>
  );
}
