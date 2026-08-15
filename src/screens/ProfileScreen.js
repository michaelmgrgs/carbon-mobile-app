import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Screen, Card } from '../components/UI';
import { colors, typography } from '../theme/theme';
import { isBiometricAvailable, getBiometricLabel, isBiometricEnabled, setBiometricEnabled, promptBiometricAuth } from '../services/biometrics';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);

  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Face ID');
  const [biometricOn, setBiometricOn] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await isBiometricAvailable();
      setBiometricSupported(supported);
      if (supported) {
        setBiometricLabel(await getBiometricLabel());
        setBiometricOn(await isBiometricEnabled());
      }
    })();
  }, []);

  const handleToggleBiometric = async (value) => {
    if (value) {
      // Require a successful Face ID/Touch ID check before turning it on,
      // so we know it actually works on this device before relying on it.
      const success = await promptBiometricAuth(`Enable ${biometricLabel} for Carbon`);
      if (!success) return;
    }
    await setBiometricEnabled(value);
    setBiometricOn(value);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
        <Text style={styles.title}>Profile</Text>

        <Card style={{ marginBottom: 20 }}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card style={{ marginBottom: 20 }}>
          <MenuRow label="Subscription history" onPress={() => navigation.navigate('SubscriptionHistory')} />
          <MenuRow label="My package requests" onPress={() => navigation.navigate('MyRequests')} />
          <MenuRow label="My class bookings" onPress={() => navigation.navigate('MyBookings')} />
          <MenuRow label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuRow label="Change password" onPress={() => navigation.navigate('ChangePassword')} last />
        </Card>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <Card style={{ marginBottom: 20 }}>
          <View style={[styles.toggleRow, biometricSupported && styles.toggleRowBorder]}>
            <Text style={styles.toggleLabel}>Push notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.red }}
              thumbColor={colors.white}
            />
          </View>
          {biometricSupported && (
            <View style={[styles.toggleRow, { paddingTop: 14 }]}>
              <Text style={styles.toggleLabel}>{biometricLabel} login</Text>
              <Switch
                value={biometricOn}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: colors.border, true: colors.red }}
                thumbColor={colors.white}
              />
            </View>
          )}
        </Card>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

function MenuRow({ label, onPress, last }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuRow, !last && styles.menuBorder]}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontFamily: typography.fontFamily.display, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.red,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  name: { color: colors.white, fontSize: 17, fontWeight: '700' },
  email: { color: colors.gray, fontSize: 13, marginTop: 2 },
  sectionLabel: { color: colors.gray, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 10, textTransform: 'uppercase' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { color: colors.white, fontSize: 15 },
  chevron: { color: colors.gray, fontSize: 20 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleRowBorder: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { color: colors.white, fontSize: 15 },
  logoutBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
