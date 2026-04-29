import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchAppointments, fetchEmployees } from '../lib/firestore';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function ScheduleScreen() {
  const [date,  setDate]  = useState(todayStr());
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAppointments(date)
      .then(setAppts)
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  }, [date]);

  function shiftDate(days) {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Date nav */}
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => shiftDate(-1)}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{displayDate}</Text>
          <Text style={styles.apptCount}>{appts.length} appointment{appts.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={() => shiftDate(1)}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} color="#3D95CE" />
        : appts.length === 0
          ? <Text style={styles.empty}>No appointments</Text>
          : (
            <FlatList
              data={appts}
              keyExtractor={a => a.id}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              renderItem={({ item: a }) => (
                <View style={styles.apptCard}>
                  <View style={styles.apptTime}>
                    <Text style={styles.apptTimeText}>{fmtTime(a.startTime)}</Text>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.clientName}>{a.clientName || 'Walk-in'}</Text>
                    <Text style={styles.techService}>{a.techName}{a.serviceName ? ` · ${a.serviceName}` : ''}</Text>
                    {a.duration && <Text style={styles.duration}>{a.duration} min</Text>}
                  </View>
                  {a.checkedInAt && (
                    <View style={styles.checkedInBadge}>
                      <Text style={styles.checkedInText}>✓ In</Text>
                    </View>
                  )}
                </View>
              )}
            />
          )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ebebeb',
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 28, color: '#3D95CE', lineHeight: 32 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  apptCount: { fontSize: 11, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 14 },
  apptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  apptTime: { width: 60, alignItems: 'center' },
  apptTimeText: { fontSize: 12, fontWeight: '700', color: '#3D95CE' },
  apptInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  techService: { fontSize: 11, color: '#888', marginTop: 2 },
  duration: { fontSize: 10, color: '#bbb', marginTop: 2 },
  checkedInBadge: { backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  checkedInText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
});
