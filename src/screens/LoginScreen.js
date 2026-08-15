import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors } from '../theme/theme';

// Reuses the same hero photo as Home — swap assets/hero.jpg for a real gym
// photo any time and both screens pick it up automatically. If you'd rather
// use a different photo just for Login, add e.g. assets/login-bg.jpg and
// change the require() below.
const backgroundImage = require('../../assets/loginScreen.jpg');

export default function LoginScreen({ navigation }) {
  const { login, needsBiometricUnlock, unlockWithBiometrics, cancelBiometricUnlock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const autoPrompted = useRef(false);

  // Auto-trigger the Face ID / Touch ID prompt once, as soon as we know a
  // saved session is waiting to be unlocked — matches how most apps behave.
  useEffect(() => {
    if (needsBiometricUnlock && !autoPrompted.current) {
      autoPrompted.current = true;
      handleBiometricUnlock();
    }
  }, [needsBiometricUnlock]);

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true);
    const success = await unlockWithBiometrics();
    setBiometricLoading(false);
    // If it fails/cancels, needsBiometricUnlock stays true and we just show
    // the retry button below — cancelBiometricUnlock() lets them type instead.
    if (!success) {
      // no-op — user can tap "Try Face ID again" or "Use password instead"
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.error || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }} imageStyle={{ opacity: 1 }}>
      <LinearGradient colors={['rgba(20,21,20,0.15)', 'rgba(20,21,20,0.75)', colors.black]} locations={[0, 0.55, 1]} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

            {needsBiometricUnlock ? (
              <>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Unlock Carbon to continue.</Text>
                <View style={{ marginTop: 40, alignItems: 'center' }}>
                  {biometricLoading ? (
                    <ActivityIndicator color={colors.red} size="large" />
                  ) : (
                    <TouchableOpacity onPress={handleBiometricUnlock} style={styles.faceIdCircle} activeOpacity={0.8}>
                      <Ionicons name="scan-outline" size={36} color={colors.white} />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.faceIdLabel}>{biometricLoading ? 'Verifying…' : 'Tap to unlock'}</Text>
                  <GhostButton title="Use password instead" onPress={cancelBiometricUnlock} style={{ marginTop: 24 }} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log in to track sessions, book classes, and check in.</Text>

                <View style={{ marginTop: 32, width: '100%' }}>
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
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType="password"
                    autoComplete="password"
                    placeholder="••••••••"
                  />
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 }}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                  <PrimaryButton title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
                  <GhostButton title="Create an account" onPress={() => navigation.navigate('Register')} style={{ marginTop: 14 }} />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 60 },
  logo: { width: 120, height: 120, marginBottom: 24 },
  title: { color: colors.white, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.gray, fontSize: 14, marginTop: 8, textAlign: 'center' },
  forgotLink: { color: colors.red, fontSize: 13, fontWeight: '600' },
  faceIdCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  faceIdLabel: { color: colors.gray, fontSize: 13, marginTop: 14 },
});
