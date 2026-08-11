import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, FlatList, Image, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, Badge } from '../components/UI';
import { colors } from '../theme/theme';
import { formatDate } from '../utils/moment-lite';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/news')
      .then((res) => setNews(res.data.news))
      .catch((err) => console.warn(err.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <FlatList
        data={news}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.red} />}
        ListHeaderComponent={<Text style={styles.title}>Updates & News</Text>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 14 }}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              {item.is_pinned ? <Badge text="Pinned" tone="red" /> : <View />}
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsBody}>{item.body}</Text>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={{ color: colors.gray, marginTop: 20 }}>No updates yet.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontWeight: '800', marginBottom: 20 },
  image: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  date: { color: colors.gray, fontSize: 12 },
  newsTitle: { color: colors.white, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  newsBody: { color: colors.gray, fontSize: 13, lineHeight: 19 },
});
