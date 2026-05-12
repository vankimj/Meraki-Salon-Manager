import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot, arrayUnion, increment,
} from 'firebase/firestore';
import { db, callFn } from './firebase';
import { getCurrentTenant } from './currentTenant';

// tenantCol/tenantDoc read getCurrentTenant() at CALL time so a tenant
// switch in Profile re-routes subsequent queries without rebinding any
// module-level state. The old hardcoded TENANT_ID export still exists
// on firebase.js for the few places that import it directly (push
// registration). Those are migrated below.
const tenantCol = (path) => collection(db, 'tenants', getCurrentTenant(), path);
const tenantDoc = (path) => doc(db, 'tenants', getCurrentTenant(), 'data', ...path.split('/'));

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

export async function createClient(data) {
  const ref = await addDoc(tenantCol('clients'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function saveClient(id, data) {
  await setDoc(doc(tenantCol('clients'), id),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true });
}

// Pull a client's appointment history. Same query the web ClientsAdmin
// uses — appointments where clientId matches. Sorted newest first.
export async function fetchClientAppointments(clientId) {
  if (!clientId) return [];
  const snap = await getDocs(query(tenantCol('appointments'), where('clientId', '==', clientId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
}

// ── Employees ─────────────────────────────────────────
export async function fetchEmployees() {
  const snap = await getDocs(query(tenantCol('employees'), orderBy('sortOrder')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Save editable fields on an employee doc. The Firestore rule for
// employees/{id} requires admin to write the parent doc, so techs
// can't actually persist self-edits today — we still ship the call
// here and mock-update locally. A future rules change will let a tech
// update their OWN doc (matched by email) for the editable fields,
// which keeps comp data in employees/{id}/private/comp (admin-only).
export async function saveEmployee(id, data) {
  await setDoc(doc(tenantCol('employees'), id),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true });
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

// Time off — used by ScheduleScreen to mark days where the tech is
// out so the gap calculator skips them entirely. Same shape as the
// web fetchTimeOff: each entry has { techName, startDate, endDate, ... }.
export async function fetchTimeOff() {
  const snap = await getDocs(tenantCol('timeOff'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}
export async function createTimeOff(data) {
  const ref = await addDoc(tenantCol('timeOff'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}
export async function deleteTimeOff(id) {
  await deleteDoc(doc(tenantCol('timeOff'), id));
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

// ── Client chat ───────────────────────────────────────
// One document per client at chats/{clientId}; messages stored as an
// array on the doc (matches the web Chat module's data model).
const CHATS_COL = tenantCol('chats');

export function subscribeToChats(cb) {
  const q = query(CHATS_COL, orderBy('lastAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn('[firestore] subscribeToChats error:', err?.message);
    cb([]);
  });
}

export function subscribeToChat(clientId, cb) {
  return onSnapshot(doc(CHATS_COL, clientId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, (err) => {
    console.warn('[firestore] subscribeToChat error:', err?.message);
    cb(null);
  });
}

export async function sendChatMessage(clientId, clientInfo, message) {
  const now = new Date().toISOString();
  const chatRef = doc(CHATS_COL, clientId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      clientId,
      clientName:  clientInfo?.name  || 'Client',
      clientEmail: clientInfo?.email || '',
      messages:    [message],
      lastMessage: message.text,
      lastAt:      now,
      unreadStaff: message.from === 'client' ? 1 : 0,
      updatedAt:   now,
    });
  } else {
    const updates = {
      messages:    arrayUnion(message),
      lastMessage: message.text,
      lastAt:      now,
      updatedAt:   now,
    };
    if (message.from === 'client') updates.unreadStaff = increment(1);
    else                           updates.unreadStaff = 0;
    await updateDoc(chatRef, updates);
  }
}

export async function markChatRead(clientId) {
  try {
    await updateDoc(doc(CHATS_COL, clientId), { unreadStaff: 0 });
  } catch {}
}

// Outbound SMS / Email — wraps the same sendDirectSms / sendDirectEmail
// Cloud Functions the web ChatAdmin uses. Server-side appends to the
// chats thread with channel='sms' or channel='email' so the conversation
// stays in one place regardless of which channel was used.
export async function sendSmsToClient(clientId, body) {
  const res = await callFn('sendDirectSms')({ tenantId: getCurrentTenant(), clientId, body });
  return res?.data || { ok: true };
}
export async function sendEmailToClient(clientId, subject, body) {
  const res = await callFn('sendDirectEmail')({ tenantId: getCurrentTenant(), clientId, subject, body });
  return res?.data || { ok: true };
}
