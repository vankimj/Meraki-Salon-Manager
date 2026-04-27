import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TENANT_ID } from './tenant';

function fmtTime(str) {
  if (!str) return '';
  const [h, m] = str.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtDate(str) {
  if (!str) return str;
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Compares original vs updated appointment and fires notifications to affected techs.
// editorUser is the Firebase auth user who made the change.
export async function notifyAffectedTechs(original, updated, editorUser) {
  const editorName = editorUser?.displayName?.split(' ')[0] || editorUser?.email || 'Someone';
  const origTech   = original?.techName || null;
  const newTech    = updated.techName   || null;
  const isNew      = !original?.id;
  const client     = updated.clientName || 'a walk-in';
  const when       = `${fmtDate(updated.date)} at ${fmtTime(updated.startTime)}`;

  const pending = []; // { techName, message, changeType }

  if (isNew) {
    if (newTech && newTech !== editorName) {
      pending.push({
        techName:   newTech,
        message:    `Hi ${newTech}! ${editorName} booked an appointment for ${client} on ${when}.`,
        changeType: 'appt_added',
      });
    }
  } else {
    if (origTech !== newTech) {
      // Reassignment — notify both sides
      if (origTech && origTech !== editorName) {
        pending.push({
          techName:   origTech,
          message:    `Hi ${origTech}! ${editorName} reassigned your appointment for ${client} on ${when} to ${newTech}.`,
          changeType: 'appt_removed',
        });
      }
      if (newTech && newTech !== editorName) {
        pending.push({
          techName:   newTech,
          message:    `Hi ${newTech}! ${editorName} assigned an appointment for ${client} on ${when} to you.`,
          changeType: 'appt_assigned',
        });
      }
    } else if (newTech && newTech !== editorName) {
      // Same tech — detect what changed
      const changes = [];
      if (original.date !== updated.date || original.startTime !== updated.startTime)
        changes.push(`rescheduled to ${when}`);
      else if (original.status !== updated.status)
        changes.push(`status → ${updated.status}`);
      else if (JSON.stringify(original.services) !== JSON.stringify(updated.services))
        changes.push('services updated');
      else
        changes.push('details updated');

      pending.push({
        techName:   newTech,
        message:    `Hi ${newTech}! ${editorName} updated your appointment for ${client} on ${when}: ${changes.join(', ')}.`,
        changeType: 'appt_modified',
      });
    }
  }

  if (!pending.length) return;

  const base = {
    apptId:         updated.id    || null,
    date:           updated.date,
    clientName:     client,
    startTime:      updated.startTime,
    changedBy:      editorName,
    changedByEmail: editorUser?.email || '',
    createdAt:      new Date().toISOString(),
    sent:           false,
  };

  const col = collection(db, 'tenants', TENANT_ID, 'notifications');
  await Promise.all(pending.map(n => addDoc(col, { ...base, ...n })));
}
