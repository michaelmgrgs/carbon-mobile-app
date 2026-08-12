import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, Badge } from '../components/UI';
import { colors } from '../theme/theme';
import { formatDate } from '../utils/moment-lite';

const STATUS_TONE = { booked: 'success', cancelled: 'gray', attended: 'success', no_show: 'red' };
const STATUS_LABEL = { booked: 'Booked', cancelled: 'Cancelled', attended: 'Attended', no_show: 'No-show' };

export default function MyBookingsScreen() {
  const [scope, setScope] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/classes/mine', { params: { scope } })
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => console.warn(err.message))
      .finally(() => setLoading(false));
  }, [scope]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleCancel = (booking) => {
    Alert.alert(
      'Cancel booking?',
      `Cancel ${booking.class_name} on ${formatDate(booking.class_date)}?`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              const res = await api.post(`/classes/bookings/${booking.id}/cancel`);
              Alert.alert(res.data.refunded ? 'Cancelled & refunded' : 'Cancelled', res.data.message);
              load();
            } catch (err) {
              Alert.alert('Could not cancel', err.response?.data?.error || 'Please try again.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setScope('upcoming')} style={[styles.tab, scope === 'upcoming' && styles.tabActive]}>
            <Text style={[styles.tabText, scope === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScope('past')} style={[styles.tab, scope === 'past' && styles.tabActive]}>
            <Text style={[styles.tabText, scope === 'past' && styles.tabTextActive]}>Past</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{item.class_name}</Text>
                <Text style={styles.meta}>
                  {formatDate(item.class_date)} · {item.start_time?.slice(0, 5)} · {item.branch_name}
                </Text>
                <Text style={styles.meta}>Coach {item.coach_first_name} {item.coach_last_name}</Text>
              </View>
              <Badge text={STATUS_LABEL[item.status] || item.status} tone={STATUS_TONE[item.status] || 'gray'} />
            </View>
            {scope === 'upcoming' && item.status === 'booked' && (
              <TouchableOpacity
                onPress={() => handleCancel(item)}
                disabled={cancellingId === item.id}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>{cancellingId === item.id ? 'Cancelling…' : 'Cancel booking'}</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.gray, textAlign: 'center', marginTop: 30 }}>
              {scope === 'upcoming' ? "You haven't booked any classes yet." : 'No past bookings.'}
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontWeight: '800', marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.red, borderColor: colors.red },
  tabText: { color: colors.gray, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: colors.white },
  className: { color: colors.white, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  cancelBtn: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  cancelText: { color: colors.danger, fontWeight: '600', fontSize: 13 },
});
