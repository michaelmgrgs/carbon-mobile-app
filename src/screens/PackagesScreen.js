import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Screen, Card, Badge } from '../components/UI';
import SmartImage from '../components/SmartImage';
import { colors, typography } from '../theme/theme';

// CFC is hidden in the app for now; add it back here to show its tab again.
const BRANCHES = ['All', 'Sheraton'];

export default function PackagesScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [branch, setBranch] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get('/packages', { params: branch === 'All' ? {} : { branch } })
      .then((res) => active && setPackages(res.data.packages))
      .catch((err) => console.warn('Packages load error:', err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [branch]);

  return (
    <Screen>
      <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Packages</Text>
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
          data={packages}
          keyExtractor={(item) => String(item.package_id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('PackageDetail', { pkg: item })}>
              <Card style={styles.pkgCard}>
                <SmartImage uri={item.image_url} style={styles.pkgImage} />
                <View style={styles.pkgBody}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.pkgName}>{item.name}</Text>
                    <Badge text={item.branch_name} tone="red" />
                  </View>
                  <Text style={styles.pkgMeta}>{item.session_count} sessions · {item.validity_period} days validity</Text>
                  {item.description ? <Text style={styles.pkgDesc} numberOfLines={2}>{item.description}</Text> : null}
                  <Text style={styles.pkgPrice}>{Number(item.price).toLocaleString()} EGP</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: colors.gray, textAlign: 'center', marginTop: 40 }}>No packages found.</Text>}
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
  pkgCard: { marginBottom: 16, padding: 0, overflow: 'hidden' },
  pkgImage: { width: '100%', height: 150 },
  pkgBody: { padding: 16 },
  pkgDesc: { color: colors.gray, fontSize: 13, lineHeight: 19, marginTop: 8 },
  pkgName: { color: colors.white, fontSize: 17, fontWeight: '700', flexShrink: 1, marginRight: 8 },
  pkgMeta: { color: colors.gray, fontSize: 13, marginTop: 8 },
  pkgPrice: { color: colors.red, fontSize: 20, fontWeight: '800', marginTop: 10 },
});
