import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { fetchEmployeeByEmail } from '../lib/firestore';

// Looks up the signed-in user's employee record (by email) so screens
// can scope to "my appointments", "my earnings", etc. Returns null while
// loading or when the user isn't an employee (e.g. owner-only admins).
//
// Refreshes when auth state changes; cached for the session otherwise.
export default function useCurrentEmployee() {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;
      if (!user?.email) {
        setEmp(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const e = await fetchEmployeeByEmail(user.email);
        if (!cancelled) setEmp(e);
      } catch (err) {
        console.warn('[useCurrentEmployee] lookup failed:', err?.message);
        if (!cancelled) setEmp(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  return { employee: emp, techName: emp?.name || null, loading };
}
