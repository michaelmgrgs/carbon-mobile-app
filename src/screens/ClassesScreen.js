import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, Badge, PrimaryButton } from '../components/UI';
import { colors, typography } from '../theme/theme';

// CFC is hidden in the app for now; add it back here to show its tab again.
const BRANCHES = ['All', 'Sheraton'];

const DAYS_AHEAD = 14; // the server sends at most 14 days
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Local calendar date as YYYY-MM-DD (the same format the server uses for class dates).
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Today + the next DAYS_AHEAD - 1 days, for the day strip.
function buildDays() {
  const days = [];
  const start = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({ key: ymd(d), weekday: i === 0 ? 'Today' : WEEKDAYS[d.getDay()], dayNum: d.getDate(), month: MONTHS[d.getMonth()] });
  }
  return days;
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
  const [days, setDays] = useState(buildDays);
  const [selectedDate, setSelectedDate] = useState(() => ymd(new Date()));
  const stripRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/classes', { params: { branch: branch === 'All' ? undefined : branch, days: DAYS_AHEAD } })
      .then((res) => setClasses(res.data.classes))
      .catch((err) => console.warn('Classes load error:', err.message))
      .finally(() => setLoading(false));
  }, [branch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Every time the tab is opened, start again on today.
  useFocusEffect(useCallback(() => {
    setDays(buildDays());
    setSelectedDate(ymd(new Date()));
    stripRef.current?.scrollTo({ x: 0, animated: false });
  }, []));

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

  const datesWithClasses = new Set(classes.map((c) => c.date));
  const dayClasses = classes.filter((c) => c.date === selectedDate);
  const selectedDay = days.find((d) => d.key === selectedDate);

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

      <ScrollView
        ref={stripRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
        style={{ flexGrow: 0 }}
      >
        {days.map((d) => {
          const selected = d.key === selectedDate;
          return (
            <TouchableOpacity
              key={d.key}
              onPress={() => setSelectedDate(d.key)}
              style={[styles.dayPill, selected && styles.dayPillActive]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${d.weekday} ${d.dayNum} ${d.month}`}
            >
              <Text style={[styles.dayWeekday, selected && styles.dayTextActive]}>{d.weekday}</Text>
              <Text style={[styles.dayNum, selected && styles.dayTextActive]}>{d.dayNum}</Text>
              <View style={[styles.dayDot, datesWithClasses.has(d.key) && (selected ? styles.dayDotOnActive : styles.dayDotOn)]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={dayClasses}
          keyExtractor={(cls) => cls.classId + cls.date}
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 40 }}
          ListHeaderComponent={
            selectedDay ? (
              <Text style={styles.dayLabel}>
                {selectedDay.weekday === 'Today' ? 'Today' : selectedDay.weekday}, {selectedDay.dayNum} {selectedDay.month}
              </Text>
            ) : null
          }
          renderItem={({ item: cls }) => {
                const key = cls.classId + cls.date;
                return (
                  <Card style={{ marginBottom: 10 }}>
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
          }}
          ListEmptyComponent={
            <Text style={{ color: colors.gray, textAlign: 'center', marginTop: 40 }}>
              {selectedDate === ymd(new Date()) ? 'No more classes today. Pick another day above.' : 'No classes on this day.'}
            </Text>
          }
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
  dayStrip: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 8 },
  dayPill: {
    width: 56, paddingVertical: 10, borderRadius: 16, alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  dayPillActive: { backgroundColor: colors.red, borderColor: colors.red },
  dayWeekday: { color: colors.gray, fontSize: 12, fontWeight: '600' },
  dayNum: { color: colors.white, fontSize: 20, fontWeight: '800', marginTop: 2 },
  dayTextActive: { color: colors.white },
  dayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, backgroundColor: 'transparent' },
  dayDotOn: { backgroundColor: colors.red },
  dayDotOnActive: { backgroundColor: colors.white },
  dayLabel: { color: colors.gray, fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  className: { color: colors.white, fontSize: 16, fontWeight: '700' },
  classMeta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  spots: { color: colors.red, fontSize: 12, marginTop: 6, fontWeight: '600' },
});
