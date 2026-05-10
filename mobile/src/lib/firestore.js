import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db, TENANT_ID } from './firebase';

const tenantCol = (path) => collection(db, 'tenants', TENANT_ID, path);
const tenantDoc = (path) => doc(db, 'tenants', TENANT_ID, 'data', ...path.split('/'));

// ── Appointments ───────────────────────────────────────
export async function fetchAppointments(date) {
  const snap = await getDocs(query(tenantCol('appointments'), where('date', '==', date)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

// Live subscription — fires on every Firestore change. Used by Schedule
// so the tech sees status flips made on the iPad checkout immediately.
// On permission-denied / network errors we still call the success cb
// with an empty list so the screen can drop its loading state instead
// of spinning forever.
export function subscribeAppointments(date, cb) {
  const q = query(tenantCol('appointments'), where('date', '==', date));
  return onSnapshot(q, (snap) => {
    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    cb(list);
  }, (err) => {
    console.warn('[firestore] subscribeAppointments error:', err?.message);
    cb([]);
  });
}

export async function createAppointment(data) {
  const ref = await addDoc(tenantCol('appointments'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateAppointment(id, data) {
  await setDoc(doc(tenantCol('appointments'), id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function setAppointmentStatus(id, status) {
  await updateAppointment(id, { status });
}

export async function checkInAppointment(id) {
  // Single-shot null→string transition is what the rule allows for
  // public callers; staff (this app) can update freely. We still write
  // the same shape so the tech-app behavior matches the web.
  await updateAppointment(id, { checkedInAt: new Date().toISOString() });
}

export async function setAppointmentNotes(id, notes) {
  await updateAppointment(id, { notes });
}

export async function deleteAppointment(id) {
  await deleteDoc(doc(tenantCol('appointments'), id));
}

// ── Clients ────────────────────────────────────────────
export async function fetchClients() {
  const snap = await getDocs(query(tenantCol('clients'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchClient(id) {
  const snap = await getDoc(doc(tenantCol('clients'), id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Employees ─────────────────────────────────────────
export async function fetchEmployees() {
  const snap = await getDocs(query(tenantCol('employees'), orderBy('sortOrder')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Look up the current user's employee record by email (employees doc
// is publicly readable, so this works without admin access). Returns
// null if no employee matches the email — e.g. for admins who don't
// double as a tech.
export async function fetchEmployeeByEmail(email) {
  if (!email) return null;
  const e = String(email).toLowerCase().trim();
  // Try indexed field 'email' first; fall back to scan if your data
  // hasn't been backfilled with lowercase email.
  try {
    const snap = await getDocs(query(tenantCol('employees'), where('email', '==', e)));
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch {}
  const all = await fetchEmployees();
  return all.find(emp => (emp.email || '').toLowerCase().trim() === e) || null;
}

// ── Receipts (for earnings) ───────────────────────────
export async function fetchReceiptsByRange(startDate, endDate) {
  // Inclusive range on the `date` field (YYYY-MM-DD). Sort client-side
  // because where + orderBy on different fields needs a composite index.
  const snap = await getDocs(query(
    tenantCol('receipts'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function fetchAppointmentsByRange(startDate, endDate) {
  const snap = await getDocs(query(
    tenantCol('appointments'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Services ───────────────────────────────────────────
export async function fetchServices() {
  const snap = await getDocs(query(tenantCol('services'), orderBy('sortOrder')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Settings ───────────────────────────────────────────
export async function fetchSettings() {
  const snap = await getDoc(tenantDoc('settings'));
  return snap.exists() ? snap.data() : {};
}
