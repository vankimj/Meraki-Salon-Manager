import { addLog } from './firestore';

let currentUser = null;

export function setLoggerUser(user) {
  currentUser = user;
}

export async function logActivity(action, details = '', actorEmail = null) {
  const entry = {
    timestamp:  new Date().toISOString(),
    email:      actorEmail || (currentUser?.email ?? null),
    name:       currentUser?.displayName || currentUser?.email || actorEmail || null,
    action,
    details:    details || '',
  };
  try { await addLog(entry); } catch (_) {}
}
