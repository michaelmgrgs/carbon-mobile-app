import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, Badge, PrimaryButton } from '../components/UI';
import { colors, typography } from '../theme/theme';

const BRANCHES = ['All', 'CFC', 'Sheraton'];

function groupByDate(classes) {
  const groups = {};
  for (const c of classes) {
    if (!groups[c.date]) groups[c.date] = [];
    groups[c.date].push(c);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTime(t) {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${ampm}`;
}

export default function ClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [branch, setBranch] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/classes', { params: { branch: branch === 'All' ? undefined : branch, days: 7 } })
      .then((res) => setClasses(res.data.classes))
      .catch((err) => console.warn('Classes load error:', err.message))
      .finally(() => setLoading(false));
  }, [branch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleBook = async (cls) => {
    setBookingId(cls.classId + cls.date);
    try {
      const res = await api.post(`/classes/${cls.classId}/book`, { classDate: cls.date });
      Alert.alert('Booked! ✅', `${res.data.message}\nSessions left: ${res.data.sessionsLeft}`);
      load();
    } catch (err) {
      Alert.alert('Could not book', err.response?.data?.error || 'Please try again.');
    } finally {
      setBookingId(null);
    }
  };

  const sections = groupByDate(classes);

  return (
    <Screen>
      <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Classes</Text>
        <View style={styles.tabRow}>
          {BRANCHES.map((b) => (
            <TouchableOpacity key={b} onPress={() => setBranch(b)} style={[styles.tab, branch === b && styles.tabActive]}>
              <Text style={[styles.tabText, branch === b && styles.tabTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.dayLabel}>{formatDayLabel(item.date)}</Text>
              {item.items.map((cls) => {
                const key = cls.classId + cls.date;
                return (
                  <Card key={key} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.className}>{cls.className}</Text>
                        <Text style={styles.classMeta}>
                          {formatTime(cls.startTime)} – {formatTime(cls.endTime)} · {cls.branchName} · {cls.coachName}
                        </Text>
                        {cls.capacity != null && (
                          <Text style={styles.spots}>
                            {cls.isFull ? 'Full' : `${cls.spotsLeft} of ${cls.capacity} spots left`}
                          </Text>
                        )}
                      </View>
                      {cls.isBookedByMe ? (
                        <Badge text="Booked" tone="success" />
                      ) : cls.isFull ? (
                        <Badge text="Full" tone="gray" />
                      ) : (
                        <PrimaryButton
                          title="Book"
                          loading={bookingId === key}
                          onPress={() => handleBook(cls)}
                        />
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: colors.gray, textAlign: 'center', marginTop: 40 }}>No upcoming classes found.</Text>}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontFamily: typography.fontFamily.display, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.red, borderColor: colors.red },
  tabText: { color: colors.gray, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: colors.white },
  dayLabel: { color: colors.gray, fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  className: { color: colors.white, fontSize: 16, fontWeight: '700' },
  classMeta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  spots: { color: colors.red, fontSize: 12, marginTop: 6, fontWeight: '600' },
});
