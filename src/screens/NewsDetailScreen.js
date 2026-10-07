import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Screen, Badge } from '../components/UI';
import { colors, typography } from '../theme/theme';
import { formatDate } from '../utils/moment-lite';

// Opened from the news list / home preview (with `item`) or from a push notification (with only `newsId`).
export default function NewsDetailScreen({ route, navigation }) {
  const { newsId, item: initialItem } = route.params || {};
  const [item, setItem] = useState(initialItem || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialItem || !newsId) return;
    api.get(`/news/${newsId}`)
      .then((res) => setItem(res.data.news))
      .catch((err) => setError(err.response?.data?.error || 'Could not load this update.'));
  }, [newsId, initialItem]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('News'))}
          style={styles.back}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {!item && !error ? <ActivityIndicator color={colors.red} style={{ marginTop: 40 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {item ? (
          <>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
            <View style={styles.metaRow}>
              {item.is_pinned ? <Badge text="Pinned" tone="red" /> : <View />}
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backText: { color: colors.white, fontSize: 15, marginLeft: 2 },
  image: { width: '100%', height: 220, borderRadius: 14, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 24, fontFamily: typography.fontFamily.display, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  body: { color: colors.white, fontSize: 15, lineHeight: 23 },
  error: { color: colors.gray, marginTop: 20 },
});
