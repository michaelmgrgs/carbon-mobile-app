import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Screen, Card, Badge } from '../components/UI';
import { colors, typography } from '../theme/theme';
import { formatDate } from '../utils/moment-lite';

export default function SubscriptionHistoryScreen() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/packages/mine/history')
      .then((res) => setSubs(res.data.subscriptions))
      .catch((err) => console.warn(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Screen><ActivityIndicator color={colors.red} style={{ marginTop: 100 }} /></Screen>;

  return (
    <Screen>
      <FlatList
        data={subs}
        keyExtractor={(item) => String(item.subscription_id)}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        ListHeaderComponent={<Text style={styles.title}>Subscription History</Text>}
        renderItem={({ item }) => {
          const expired = new Date(item.end_date) < new Date();
          return (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.name}>{item.name}</Text>
                <Badge text={expired ? 'Expired' : 'Active'} tone={expired ? 'gray' : 'success'} />
              </View>
              <Text style={styles.meta}>{item.branch_name} · {formatDate(item.start_date)} → {formatDate(item.end_date)}</Text>
              <Text style={styles.meta}>{item.sessions_left} sessions remaining</Text>
            </Card>
          );
        }}
        ListEmptyComponent={<Text style={{ color: colors.gray, marginTop: 20 }}>No subscriptions yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 24, fontFamily: typography.fontFamily.display, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20 },
  name: { color: colors.white, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.gray, fontSize: 13, marginTop: 4 },
});
