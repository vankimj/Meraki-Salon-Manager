// Tech auto-assignment for online bookings where the customer picks "no preference."
// Pure functions — caller (BookingScreen.handleBook) handles I/O and persistence.

export const ASSIGNMENT_METHODS = [
  'turnQueue',
  'leastBusyDay',
  'leastBusyWeek',
  'lowestRevenueWeek',
  'roundRobin',
  'random',
];

export const ASSIGNMENT_METHOD_LABELS = {
  turnQueue:         'Turn queue (Mango POS style)',
  leastBusyDay:      'Least busy that day',
  leastBusyWeek:     'Fewest appointments that week',
  lowestRevenueWeek: 'Lowest weekly revenue',
  roundRobin:        'Round robin',
  random:            'Random',
};

export const ASSIGNMENT_METHOD_DESCRIPTIONS = {
  turnQueue:         'Same-day bookings route through the live walk-in turn rotation — picks the eligible tech with the fewest turns today, matching how the front desk seats walk-ins. Future-dated bookings fall back to "Least busy that day".',
  leastBusyDay:      'Among free techs, picks whoever has the fewest appointments on that day. Best for daily fairness.',
  leastBusyWeek:     'Picks whoever has the fewest appointments in the same calendar week (Sun–Sat). Spreads load across the week.',
  lowestRevenueWeek: 'Picks whoever has booked the lowest service revenue that week. Fairer for tipped staff.',
  roundRobin:        'Cycles through techs in alphabetical order. Predictable, simple — but ignores existing booking load.',
  random:            'Picks randomly from available techs. No preference, no pattern.',
};

export const DEFAULT_ASSIGNMENT_METHOD = 'leastBusyDay';

// Sun–Sat week containing dateStr
export function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
export function endOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + (6 - d.getDay()));
  return d.toISOString().slice(0, 10);
}

function isTechAppt(appt, tech) {
  return (appt.techId && appt.techId === tech.id) || appt.techName === tech.name;
}
function apptRevenue(appt) {
  return (appt.services || []).reduce((s, sv) => s + (Number(sv.price) || 0), 0);
}
function activeAppts(appts) {
  return appts.filter(a => a.status !== 'cancelled');
}

// freeTechs: eligible-for-service AND free at the slot (caller filters).
// dayAppts: all appts on the same date (used by leastBusyDay).
// weekAppts: all appts in the same Sun–Sat week (used by week-based methods).
// turnRoster: today's roster ([{ techName, turnsTaken, clockInAt, ... }]) —
//   only meaningful when method === 'turnQueue' AND the booking is for today.
//   Caller pre-fetches and passes in (or null for future-dated bookings).
// roundRobinIndex: current settings counter (advanced for round-robin only).
//
// Returns { tech, nextRoundRobinIndex } — nextRoundRobinIndex always reflects what
// the caller should persist (unchanged for non-round-robin methods).
export function pickTech({ method, freeTechs, dayAppts = [], weekAppts = [], turnRoster = null, roundRobinIndex = 0 }) {
  if (!freeTechs || freeTechs.length === 0) {
    return { tech: null, nextRoundRobinIndex: roundRobinIndex };
  }
  if (freeTechs.length === 1) {
    return { tech: freeTechs[0], nextRoundRobinIndex: roundRobinIndex };
  }

  // turnQueue degrades to leastBusyDay when no roster (future date or empty roster).
  const effectiveMethod = (method === 'turnQueue' && (!turnRoster || turnRoster.length === 0))
    ? 'leastBusyDay'
    : method;

  switch (effectiveMethod) {
    case 'turnQueue': {
      // Only consider techs in today's roster — others aren't "clocked in"
      // so shouldn't get walk-in-queue style assignments. Among rostered
      // free techs, pick the one with fewest turns (clock-in tiebreaker).
      const inRoster = freeTechs.filter(t =>
        turnRoster.some(r => r.techName === t.name)
      );
      if (inRoster.length === 0) {
        // No free tech is in today's roster — fall through to leastBusyDay.
        const counts = freeTechs.map(t => ({
          tech: t,
          n: activeAppts(dayAppts).filter(a => isTechAppt(a, t)).length,
        }));
        counts.sort((a, b) => a.n - b.n || (a.tech.name || '').localeCompare(b.tech.name || ''));
        return { tech: counts[0].tech, nextRoundRobinIndex: roundRobinIndex };
      }
      const ranked = inRoster.map(t => {
        const r = turnRoster.find(x => x.techName === t.name);
        return { tech: t, turns: Number(r?.turnsTaken) || 0, clockInAt: r?.clockInAt || '' };
      });
      ranked.sort((a, b) => a.turns - b.turns || a.clockInAt.localeCompare(b.clockInAt));
      return { tech: ranked[0].tech, nextRoundRobinIndex: roundRobinIndex };
    }

    case 'random':
      return {
        tech: freeTechs[Math.floor(Math.random() * freeTechs.length)],
        nextRoundRobinIndex: roundRobinIndex,
      };

    case 'roundRobin': {
      const sorted = [...freeTechs].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      const safe = ((roundRobinIndex % sorted.length) + sorted.length) % sorted.length;
      return {
        tech: sorted[safe],
        nextRoundRobinIndex: roundRobinIndex + 1,
      };
    }

    case 'leastBusyWeek': {
      const counts = freeTechs.map(t => ({
        tech: t,
        n: activeAppts(weekAppts).filter(a => isTechAppt(a, t)).length,
      }));
      counts.sort((a, b) => a.n - b.n || (a.tech.name || '').localeCompare(b.tech.name || ''));
      return { tech: counts[0].tech, nextRoundRobinIndex: roundRobinIndex };
    }

    case 'lowestRevenueWeek': {
      const totals = freeTechs.map(t => ({
        tech: t,
        rev: activeAppts(weekAppts).filter(a => isTechAppt(a, t)).reduce((s, a) => s + apptRevenue(a), 0),
      }));
      totals.sort((a, b) => a.rev - b.rev || (a.tech.name || '').localeCompare(b.tech.name || ''));
      return { tech: totals[0].tech, nextRoundRobinIndex: roundRobinIndex };
    }

    case 'leastBusyDay':
    default: {
      const counts = freeTechs.map(t => ({
        tech: t,
        n: activeAppts(dayAppts).filter(a => isTechAppt(a, t)).length,
      }));
      counts.sort((a, b) => a.n - b.n || (a.tech.name || '').localeCompare(b.tech.name || ''));
      return { tech: counts[0].tech, nextRoundRobinIndex: roundRobinIndex };
    }
  }
}
