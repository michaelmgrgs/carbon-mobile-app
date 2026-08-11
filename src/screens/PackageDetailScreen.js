import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { Screen, Card, PrimaryButton, Input } from '../components/UI';
import { colors } from '../theme/theme';

export default function PackageDetailScreen({ route, navigation }) {
  const { pkg } = route.params;
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [requested, setRequested] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/request', { packageId: pkg.package_id, note });
      setRequested(true);
      Alert.alert('Request sent ✅', data.message, [
        { text: 'Great', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Could not send request', err.response?.data?.error || 'Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text style={styles.name}>{pkg.name}</Text>
        <Text style={styles.branch}>{pkg.branch_name}</Text>
        {pkg.description ? <Text style={styles.description}>{pkg.description}</Text> : null}

        <Card style={{ marginTop: 20 }}>
          <Row label="Sessions" value={String(pkg.session_count)} />
          <Row label="Validity" value={`${pkg.validity_period} days`} />
          <Row label="Price" value={`${Number(pkg.price).toLocaleString()} EGP`} last />
        </Card>

        <Text style={styles.helper}>
          Payments aren't available in the app yet — request the package below and our
          team will confirm and activate it for you (same as signing up at the front desk).
        </Text>

        <Input
          label="Note for the team (optional)"
          placeholder="e.g. I'd like to start this Saturday"
          value={note}
          onChangeText={setNote}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />

        <PrimaryButton
          title={requested ? 'Request Sent' : 'Request This Package'}
          onPress={sendRequest}
          loading={loading}
          disabled={requested}
          style={{ marginTop: 8 }}
        />
      </View>
    </Screen>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.white, fontSize: 26, fontWeight: '800' },
  branch: { color: colors.red, fontSize: 14, fontWeight: '700', marginTop: 6 },
  description: { color: colors.gray, fontSize: 14, marginTop: 10, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.gray, fontSize: 14 },
  rowValue: { color: colors.white, fontSize: 14, fontWeight: '700' },
  helper: { color: colors.gray, fontSize: 12, lineHeight: 17, marginTop: 20, marginBottom: 16 },
});
