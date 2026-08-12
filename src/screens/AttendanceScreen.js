import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { Screen, Card, PrimaryButton } from '../components/UI';
import { colors } from '../theme/theme';
import { formatDateTime } from '../utils/moment-lite';

export default function AttendanceScreen() {
  const [tab, setTab] = useState('scan'); // 'scan' | 'history'

  return (
    <Screen>
      <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Attendance</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setTab('scan')} style={[styles.tab, tab === 'scan' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'scan' && styles.tabTextActive]}>Scan & Check In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('history')} style={[styles.tab, tab === 'history' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'scan' ? <ScanTab /> : <HistoryTab />}
    </Screen>
  );
}

// Scan states: 'idle' (camera active) -> 'processing' (camera OFF, checking in)
// -> 'result' (camera OFF, showing outcome) -> back to 'idle' only when user taps "Scan Again".
// The camera is only ever mounted in 'idle', so it physically cannot fire more
// barcode events while a check-in is in flight or a result is showing.
function ScanTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null); // { success, title, message }

  const handleBarcode = async ({ data }) => {
    if (state !== 'idle') return; // extra guard, camera should already be unmounted
    setState('processing');
    try {
      const res = await api.post('/attendance/check-in', { qrPayload: data });
      setResult({
        success: true,
        title: 'Checked in! ✅',
        message: `${res.data.message}\nSessions left: ${res.data.sessionsLeft}`,
      });
    } catch (err) {
      setResult({
        success: false,
        title: 'Check-in failed',
        message: err.response?.data?.error || 'Please try scanning again.',
      });
    } finally {
      setState('result');
    }
  };

  const scanAgain = () => {
    setResult(null);
    setState('idle');
  };

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <View style={styles.centerBox}>
        <Card>
          <Text style={styles.permText}>Carbon needs camera access to scan the check-in QR code at the front desk.</Text>
          <PrimaryButton title="Allow Camera" onPress={requestPermission} style={{ marginTop: 16 }} />
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={styles.cameraWrap}>
        {state === 'idle' ? (
          <>
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={styles.frame} pointerEvents="none" />
          </>
        ) : (
          <View style={styles.resultBox}>
            {state === 'processing' ? (
              <>
                <ActivityIndicator color={colors.red} size="large" />
                <Text style={styles.resultText}>Checking you in…</Text>
              </>
            ) : (
              <>
                <Text style={[styles.resultTitle, { color: result.success ? colors.success : colors.danger }]}>
                  {result.title}
                </Text>
                <Text style={styles.resultText}>{result.message}</Text>
                <PrimaryButton title="Scan Again" onPress={scanAgain} style={{ marginTop: 20, width: '80%' }} />
              </>
            )}
          </View>
        )}
      </View>
      {state === 'idle' && <Text style={styles.hint}>Point your camera at the front-desk screen</Text>}
    </View>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api.get('/attendance/history')
        .then((res) => active && setHistory(res.data.history))
        .catch((err) => console.warn(err.message))
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [])
  );

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => String(item.attendance_id)}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.histBranch}>{item.branch_name}</Text>
              <Text style={styles.histPkg}>{item.package_name}</Text>
            </View>
            <Text style={styles.histTime}>{formatDateTime(item.timestamp)}</Text>
          </View>
        </Card>
      )}
      ListEmptyComponent={
        !loading ? <Text style={{ color: colors.gray, textAlign: 'center', marginTop: 30 }}>No check-ins yet.</Text> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontWeight: '800', marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.red, borderColor: colors.red },
  tabText: { color: colors.gray, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: colors.white },
  cameraWrap: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  frame: {
    position: 'absolute', top: '25%', left: '15%', right: '15%', bottom: '35%',
    borderWidth: 3, borderColor: colors.red, borderRadius: 20,
  },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 24 },
  resultTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  resultText: { color: colors.gray, fontSize: 14, marginTop: 12, textAlign: 'center', lineHeight: 20 },
  hint: { color: colors.gray, textAlign: 'center', marginTop: 16, fontSize: 13 },
  centerBox: { flex: 1, justifyContent: 'center', padding: 20 },
  permText: { color: colors.white, fontSize: 14, lineHeight: 20 },
  histBranch: { color: colors.white, fontWeight: '700', fontSize: 15 },
  histPkg: { color: colors.gray, fontSize: 13, marginTop: 2 },
  histTime: { color: colors.gray, fontSize: 12 },
});
