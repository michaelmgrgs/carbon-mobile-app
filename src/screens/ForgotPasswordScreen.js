import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import api from '../services/api';
import { Screen, Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors } from '../theme/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err) {
      Alert.alert('Something went wrong', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a 6-digit code to reset it.</Text>

          <View style={{ marginTop: 28, width: '100%' }}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
              autoComplete="email"
              placeholder="you@example.com"
            />
            <PrimaryButton title="Send Reset Code" onPress={handleSend} loading={loading} style={{ marginTop: 8 }} />
            <GhostButton title="Back to login" onPress={() => navigation.goBack()} style={{ marginTop: 14 }} />
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
