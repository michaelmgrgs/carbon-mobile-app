import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Screen, Card, Badge } from '../components/UI';
import { colors, typography, radius } from '../theme/theme';
import moment, { formatDateTime } from '../utils/moment-lite';

// Placeholder image ships by default — replace assets/hero.jpg with a real
// photo of your gym/athletes (about 1200x800px works well) any time; the
// code doesn't need to change.
const heroImage = require('../../assets/hero.jpg');

const QUICK_LINKS = [
  { label: 'My Bookings', icon: 'bookmark-outline', route: 'MyBookings' },
  { label: 'My Requests', icon: 'time-outline', route: 'MyRequests' },
  { label: 'Subscription History', icon: 'receipt-outline', route: 'SubscriptionHistory' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [news, setNews] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [subsRes, newsRes, bookingsRes] = await Promise.all([
        api.get('/packages/mine/active'),
        api.get('/news'),
        api.get('/classes/mine', { params: { scope: 'upcoming' } }),
      ]);
      setSubs(subsRes.data.subscriptions);
      setNews(newsRes.data.news.slice(0, 3));
      const upcoming = bookingsRes.data.bookings.filter((b) => b.status === 'booked');
      setNextBooking(upcoming[0] || null);
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
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.red} />}
      >
        {/* Hero */}
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={{ opacity: 1 }}>
        <LinearGradient colors={['rgba(20,21,20,0.1)', 'rgba(20,21,20,0.6)', colors.black]} locations={[0, 0.55, 1]} style={styles.heroFade}>
            <View style={styles.heroContent}>
              <Text style={styles.greeting}>Hey {user?.firstName} 👋</Text>
              <Text style={styles.sub}>Ready to train today?</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Quick actions — 2x2 grid of primary tasks, with descriptions */}
          <View style={styles.quickRow}>
            <QuickAction
              label="Book a Class"
              description="Reserve your next session"
              icon="calendar"
              onPress={() => navigation.navigate('Classes')}
            />
            <QuickAction
              label="Scan & Check In"
              description="Scan QR code to check in"
              icon="qr-code"
              onPress={() => navigation.navigate('Attendance')}
            />
          </View>
          <View style={[styles.quickRow, { marginTop: 12, marginBottom: 24 }]}>
            <QuickAction
              label="Packages"
              description="Explore membership options"
              icon="cube"
              onPress={() => navigation.navigate('Packages')}
            />
            <QuickAction
              label="Updates & News"
              description="Stay updated with latest news"
              icon="notifications"
              onPress={() => navigation.navigate('News')}
            />
          </View>

          {/* Up next: soonest upcoming booked class */}
          {nextBooking && (
            <>
              <Text style={styles.sectionTitle}>UP NEXT</Text>
              <Card style={{ marginBottom: 24, borderColor: colors.red + '55' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upNextClass}>{nextBooking.class_name.toUpperCase()}</Text>
                    <Text style={styles.upNextMeta}>
                      {formatDateTime(nextBooking.class_date)} · {nextBooking.branch_name}
                    </Text>
                  </View>
                  <Ionicons name="barbell-outline" size={22} color={colors.red} />
                </View>
                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => navigation.navigate('MyBookings')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewDetailsText}>VIEW DETAILS</Text>
                </TouchableOpacity>
              </Card>
            </>
          )}

          {/* Quick links to everything else that doesn't have its own tab */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }} contentContainerStyle={{ gap: 10 }}>
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity key={link.route} style={styles.linkChip} onPress={() => navigation.navigate(link.route)} activeOpacity={0.8}>
                <Ionicons name={link.icon} size={16} color={colors.white} />
                <Text style={styles.linkChipText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active packages, with a progress bar for sessions remaining */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>MY ACTIVE PACKAGES</Text>
            {subs.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('SubscriptionHistory')}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
          {subs.length === 0 && !loading ? (
            <Card style={{ marginBottom: 24 }}>
              <Text style={styles.emptyText}>No active package yet. Browse packages to get started.</Text>
            </Card>
          ) : (
            subs.map((s) => {
              const total = s.session_count || 0;
              const fraction = total > 0 ? Math.max(0, Math.min(1, s.sessions_left / total)) : 0;
              return (
                <Card key={s.subscription_id} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packageName}>{s.name}</Text>
                      <Text style={styles.packageMeta}>{s.branch_name} · expires {moment(s.end_date)}</Text>
                    </View>
                    <Badge text={`${s.sessions_left} left`} tone={s.sessions_left > 2 ? 'success' : 'red'} />
                  </View>
                  {total > 0 && (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${fraction * 100}%` }]} />
                    </View>
                  )}
                </Card>
              );
            })
          )}

          {/* News preview */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text style={styles.sectionTitle}>LATEST UPDATES</Text>
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
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickAction({ label, description, icon, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.quickActionWrap}>
      <LinearGradient colors={[colors.surfaceElevated, colors.surface]} style={styles.quickAction}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={styles.quickIconWrap}>
            <Ionicons name={icon} size={20} color={colors.white} />
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 280, backgroundColor: colors.charcoal, justifyContent: 'flex-end' },
  heroFade: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 24, paddingTop: 120 },
  heroContent: {},
  greeting: { color: colors.white, fontSize: 26, fontWeight: '800' },
  sub: { color: colors.offWhite, fontSize: 14, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  quickActionWrap: { flex: 1 },
  quickAction: {
    flex: 1, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, minHeight: 122, justifyContent: 'flex-start',
  },
  quickIconWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.red,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { color: colors.white, fontWeight: '700', fontSize: 14, marginTop: 14 },
  quickDescription: { color: colors.gray, fontSize: 11, marginTop: 4, lineHeight: 15 },
  linkChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill,
  },
  linkChipText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    color: colors.gray, fontSize: 13, fontWeight: '700', marginBottom: 12,
    fontFamily: typography.fontFamily.display, letterSpacing: 1,
  },
  emptyText: { color: colors.gray },
  packageName: { color: colors.white, fontWeight: '700', fontSize: 16 },
  packageMeta: { color: colors.gray, fontSize: 13, marginTop: 4 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceElevated, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.red, borderRadius: 3 },
  seeAll: { color: colors.red, fontWeight: '600', fontSize: 13 },
  newsTitle: { color: colors.white, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  newsBody: { color: colors.gray, fontSize: 13 },
  upNextClass: { color: colors.white, fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  upNextMeta: { color: colors.gray, fontSize: 13, marginTop: 6 },
  viewDetailsBtn: {
    marginTop: 14, backgroundColor: colors.red, borderRadius: radius.pill,
    paddingVertical: 10, alignItems: 'center',
  },
  viewDetailsText: { color: colors.white, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
});
