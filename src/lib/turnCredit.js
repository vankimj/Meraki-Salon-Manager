import { fetchTurnRoster, saveTurnRoster } from './firestore';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// When a tech completes a ★ "specifically requested" appointment today,
// they earn 0.5 turns of credit on today's walk-in roster — so the rotation
// reflects the workload they handled. Two such completions = one full turn.
//
// Pass the appt that just got marked status='done'. Returns true if credit
// was applied, false otherwise (no-op when not specific / not today / tech
// not in roster).
export async function applySpecificRequestCredit(appt) {
  if (!appt) return false;
  if (appt.techRequestType !== 'specific') return false;
  if (!appt.techName) return false;
  if (appt.date !== todayStr()) return false;

  const today = todayStr();
  try {
    const data = await fetchTurnRoster(today);
    const roster = (data && data.roster) || [];
    const idx = roster.findIndex(r => r.techName === appt.techName);
    if (idx < 0) return false;
    const next = roster.map((r, i) =>
      i === idx ? { ...r, turnsTaken: (Number(r.turnsTaken) || 0) + 0.5 } : r
    );
    await saveTurnRoster(today, next);
    return true;
  } catch (e) {
    console.warn('[turn credit]', e);
    return false;
  }
}
