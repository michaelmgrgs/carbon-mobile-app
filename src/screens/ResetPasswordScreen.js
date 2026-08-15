import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import api from '../services/api';
import { Screen, Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors } from '../theme/theme';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!code || !newPassword) {
      Alert.alert('Missing info', 'Please enter the code and your new password.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code: code.trim(), newPassword });
      Alert.alert('Password updated ✅', 'You can now log in with your new password.', [
        { text: 'Go to login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      Alert.alert('Could not reset password', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Code sent', 'Check your email for a new code.');
    } catch (err) {
      Alert.alert('Could not resend', 'Please try again shortly.');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code we sent to {email}, plus your new password.</Text>

          <View style={{ marginTop: 28, width: '100%' }}>
            <Input
              label="Reset Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
            />
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              textContentType="newPassword"
              placeholder="••••••••"
            />
            <PrimaryButton title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: 8 }} />
            <GhostButton title="Resend code" onPress={handleResend} style={{ marginTop: 14 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 60 },
  title: { color: colors.white, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.gray, fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20 },
});
