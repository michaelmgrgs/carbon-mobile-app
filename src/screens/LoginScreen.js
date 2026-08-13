import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors } from '../theme/theme';

// Reuses the same hero photo as Home — swap assets/hero.jpg for a real gym
// photo any time and both screens pick it up automatically. If you'd rather
// use a different photo just for Login, add e.g. assets/login-bg.jpg and
// change the require() below.
const backgroundImage = require('../../assets/loginScreen.jpg');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to track sessions, book classes, and check in.</Text>

            <View style={{ marginTop: 32, width: '100%' }}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
              <PrimaryButton title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
              <GhostButton title="Create an account" onPress={() => navigation.navigate('Register')} style={{ marginTop: 14 }} />
            </View>
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
});
