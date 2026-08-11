import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Screen, Card, Badge } from '../components/UI';
import { colors } from '../theme/theme';
import moment from '../utils/moment-lite';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [subsRes, newsRes] = await Promise.all([
        api.get('/packages/mine/active'),
        api.get('/news'),
      ]);
      setSubs(subsRes.data.subscriptions);
      setNews(newsRes.data.news.slice(0, 3));
    } catch (err) {
      console.warn('Home load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.red} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {user?.firstName} 👋</Text>
            <Text style={styles.sub}>Ready to train today?</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction label="Scan & Check In" icon="qr" onPress={() => navigation.navigate('Attendance')} />
          <QuickAction label="Browse Packages" icon="cart" onPress={() => navigation.navigate('Packages')} />
        </View>

        {/* Active packages */}
        <Text style={styles.sectionTitle}>My Active Packages</Text>
        {subs.length === 0 && !loading ? (
          <Card style={{ marginBottom: 24 }}>
            <Text style={styles.emptyText}>No active package yet. Browse packages to get started.</Text>
          </Card>
        ) : (
          subs.map((s) => (
            <Card key={s.subscription_id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packageName}>{s.name}</Text>
                  <Text style={styles.packageMeta}>{s.branch_name} · expires {moment(s.end_date)}</Text>
                </View>
                <Badge text={`${s.sessions_left} left`} tone={s.sessions_left > 2 ? 'success' : 'red'} />
              </View>
            </Card>
          ))
        )}

        {/* News preview */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('News')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {news.map((n) => (
          <Card key={n.id} style={{ marginBottom: 12 }}>
            <Text style={styles.newsTitle}>{n.title}</Text>
            <Text style={styles.newsBody} numberOfLines={2}>{n.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function QuickAction({ label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.quickActionWrap}>
      <LinearGradient colors={[colors.surfaceElevated, colors.surface]} style={styles.quickAction}>
        <View style={styles.quickDot} />
        <Text style={styles.quickLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: colors.white, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.gray, fontSize: 14, marginTop: 4 },
  logo: { width: 44, height: 44 },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  quickActionWrap: { flex: 1 },
  quickAction: {
    borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, minHeight: 90, justifyContent: 'flex-end',
  },
  quickDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red, marginBottom: 10 },
  quickLabel: { color: colors.white, fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyText: { color: colors.gray },
  packageName: { color: colors.white, fontWeight: '700', fontSize: 16 },
  packageMeta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  seeAll: { color: colors.red, fontWeight: '600', fontSize: 13 },
  newsTitle: { color: colors.white, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  newsBody: { color: colors.gray, fontSize: 13 },
});
