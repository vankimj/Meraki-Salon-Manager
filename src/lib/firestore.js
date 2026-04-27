import {
  doc, collection,
  getDoc, getDocs, setDoc, addDoc, deleteDoc,
  orderBy, where, query, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { TENANT_ID } from './tenant';

// ── Tenant root helpers ────────────────────────────────
// Document refs need even-segment paths; 'data' is the sub-collection that provides the 4th segment.
const tenantDoc = (path) => doc(db, 'tenants', TENANT_ID, 'data', ...path.split('/'));
const tenantCol = (path) => collection(db, 'tenants', TENANT_ID, path);

// ── Refs ───────────────────────────────────────────────
const SLIDES_REF   = tenantDoc('slides');
const USERS_REF    = tenantDoc('users');
const SETTINGS_REF = tenantDoc('settings');
const LOGS_COL     = tenantCol('logs');
const SERVICES_COL = tenantCol('services');

// ── Bootstrap load (slides + users + settings) ─────────
// Uses allSettled so a permission error on users/settings (unauthenticated)
// doesn't block the publicly-readable slides from loading.
export async function loadAll() {
  const [sd, ud, stg] = await Promise.allSettled([
    getDoc(SLIDES_REF),
    getDoc(USERS_REF),
    getDoc(SETTINGS_REF),
  ]);
  const slidesDoc   = sd.status  === 'fulfilled' ? sd.value  : null;
  const usersDoc    = ud.status  === 'fulfilled' ? ud.value  : null;
  const settingsDoc = stg.status === 'fulfilled' ? stg.value : null;
  return {
    slides:   slidesDoc?.exists()   ? (slidesDoc.data().slides   ?? []) : null,
    def:      slidesDoc?.exists()   ? (slidesDoc.data().def      ?? 0)  : 0,
    cur:      slidesDoc?.exists()   ? (slidesDoc.data().cur      ?? 0)  : 0,
    users:    usersDoc?.exists()    ? (usersDoc.data().users     ?? []) : [],
    settings: settingsDoc?.exists() ? settingsDoc.data()                : {},
  };
}

// ── Slides ─────────────────────────────────────────────
export const saveSlides   = (slides, def, cur) => setDoc(SLIDES_REF, { slides, def, cur });

// ── Users ──────────────────────────────────────────────
export const saveUsers    = (users)    => setDoc(USERS_REF, { users });

// ── Settings ───────────────────────────────────────────
export const saveSettings = (settings) => setDoc(SETTINGS_REF, settings);

// ── Logs ───────────────────────────────────────────────
export const addLog       = (entry)    => addDoc(LOGS_COL, entry);

export async function fetchLogs(n = 100) {
  const snap = await getDocs(query(LOGS_COL, orderBy('timestamp', 'desc'), limit(n)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Services ───────────────────────────────────────────
export async function fetchServices() {
  const snap = await getDocs(query(SERVICES_COL, orderBy('sortOrder')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveService(id, data) {
  const ref = id ? doc(SERVICES_COL, id) : doc(SERVICES_COL);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return ref.id;
}

export async function createService(data) {
  const ref = await addDoc(SERVICES_COL, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export const deleteService = (id) => deleteDoc(doc(SERVICES_COL, id));

// ── Clients ────────────────────────────────────────────
const CLIENTS_COL = tenantCol('clients');

export async function fetchClients() {
  const snap = await getDocs(query(CLIENTS_COL, orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createClient(data) {
  const ref = await addDoc(CLIENTS_COL, {
    ...data,
    visits: data.visits ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function saveClient(id, data) {
  await setDoc(doc(CLIENTS_COL, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export const deleteClient = (id) => deleteDoc(doc(CLIENTS_COL, id));

export async function fetchDemoClients() {
  const snap = await getDocs(query(CLIENTS_COL, where('_demo', '==', true)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function servicesExist() {
  const snap = await getDocs(query(SERVICES_COL, limit(1)));
  return !snap.empty;
}

export async function clearServices() {
  const snap = await getDocs(SERVICES_COL);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── Employees ─────────────────────────────────────────
const EMPLOYEES_COL = tenantCol('employees');

export async function fetchEmployees() {
  const snap = await getDocs(query(EMPLOYEES_COL, orderBy('sortOrder')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveEmployee(id, data) {
  const ref = id ? doc(EMPLOYEES_COL, id) : doc(EMPLOYEES_COL);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return ref.id;
}

export async function createEmployee(data) {
  const ref = await addDoc(EMPLOYEES_COL, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export const deleteEmployee = (id) => deleteDoc(doc(EMPLOYEES_COL, id));

export async function employeesExist() {
  const snap = await getDocs(query(EMPLOYEES_COL, limit(1)));
  return !snap.empty;
}

// ── Appointments ───────────────────────────────────────
const APPTS_COL = tenantCol('appointments');

export async function fetchAppointments(date) {
  const snap = await getDocs(query(APPTS_COL, where('date', '==', date)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export async function createAppointment(data) {
  const ref = await addDoc(APPTS_COL, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function saveAppointment(id, data) {
  await setDoc(doc(APPTS_COL, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export const deleteAppointment = (id) => deleteDoc(doc(APPTS_COL, id));

export async function fetchDemoAppointments() {
  const snap = await getDocs(query(APPTS_COL, where('_demo', '==', true)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Access requests ────────────────────────────────────
const REQUESTS_COL = tenantCol('requests');

export async function submitAccessRequest(uid, data) {
  await setDoc(doc(REQUESTS_COL, uid), { ...data, requestedAt: new Date().toISOString() });
}

export async function fetchAccessRequests() {
  const snap = await getDocs(REQUESTS_COL);
  return snap.docs.map(d => ({ uid: d.id, ...d.data(), role: 'pending' }));
}

export async function deleteAccessRequest(uid) {
  await deleteDoc(doc(REQUESTS_COL, uid));
}

// ── Bonuses ────────────────────────────────────────────
const BONUSES_COL = tenantCol('bonuses');

export async function fetchBonuses() {
  const snap = await getDocs(query(BONUSES_COL, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createBonus(data) {
  const ref = await addDoc(BONUSES_COL, { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export const deleteBonus = (id) => deleteDoc(doc(BONUSES_COL, id));

// ── Payroll runs ───────────────────────────────────────
const PAYROLL_COL = tenantCol('payrollRuns');

export async function fetchPayrollRuns() {
  const snap = await getDocs(query(PAYROLL_COL, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createPayrollRun(data) {
  const ref = await addDoc(PAYROLL_COL, { ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function savePayrollRun(id, data) {
  await setDoc(doc(PAYROLL_COL, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

// ── Appointments by range ──────────────────────────────
export async function fetchAppointmentsByRange(startDate, endDate) {
  const snap = await getDocs(query(APPTS_COL,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
