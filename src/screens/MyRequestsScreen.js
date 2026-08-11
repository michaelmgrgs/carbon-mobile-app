import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, FlatList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, Badge } from '../components/UI';
import { colors } from '../theme/theme';
import { formatDate } from '../utils/moment-lite';

const STATUS_TONE = { pending: 'gray', approved: 'success', declined: 'red' };
const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', declined: 'Declined' };

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api.get('/subscriptions/requests/mine')
        .then((res) => active && setRequests(res.data.requests))
        .catch((err) => console.warn(err.message))
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [])
  );

  return (
    <Screen>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>My Requests</Text>
            <Text style={styles.subtitle}>Package requests you've sent — our team confirms and activates these.</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.name}>{item.name}</Text>
              <Badge text={STATUS_LABEL[item.status] || item.status} tone={STATUS_TONE[item.status] || 'gray'} />
            </View>
            <Text style={styles.meta}>{item.branch_name} · {Number(item.price).toLocaleString()} EGP</Text>
            <Text style={styles.date}>Requested {formatDate(item.created_at)}</Text>
            {item.note ? <Text style={styles.note}>"{item.note}"</Text> : null}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={{ color: colors.gray, marginTop: 10 }}>No requests yet. Browse packages to get started.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: colors.gray, fontSize: 13, marginBottom: 20, lineHeight: 18 },
  name: { color: colors.white, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  date: { color: colors.gray, fontSize: 12, marginTop: 4 },
  note: { color: colors.gray, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});
