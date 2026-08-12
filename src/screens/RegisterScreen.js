import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Screen, Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors, radius } from '../theme/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phoneNumber: '', email: '', password: '',
    gender: '', residentialArea: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { firstName, lastName, phoneNumber, email, password, gender, residentialArea } = form;
    if (!firstName || !lastName || !phoneNumber || !email || !password || !gender || !residentialArea) {
      Alert.alert('Missing info', 'Please fill in all fields, including gender and area.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Sign up failed', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join Carbon and start training.</Text>

          <View style={{ marginTop: 28, width: '100%' }}>
            <Input label="First name" value={form.firstName} onChangeText={update('firstName')} />
            <Input label="Last name" value={form.lastName} onChangeText={update('lastName')} />
            <Input label="Phone number" value={form.phoneNumber} onChangeText={update('phoneNumber')} keyboardType="phone-pad" />
            <Input label="Email" value={form.email} onChangeText={update('email')} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Password" value={form.password} onChangeText={update('password')} secureTextEntry />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => update('gender')(g)}
                  style={[styles.genderOption, form.gender === g && styles.genderOptionActive]}
                >
                  <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Residential area" value={form.residentialArea} onChangeText={update('residentialArea')} placeholder="e.g. Maadi" />

            <PrimaryButton title="Sign Up" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
            <GhostButton title="Already have an account? Log in" onPress={() => navigation.goBack()} style={{ marginTop: 14 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 60 },
  title: { color: colors.white, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.gray, fontSize: 14, marginTop: 6 },
  label: { color: colors.gray, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  genderOption: {
    flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated,
  },
  genderOptionActive: { backgroundColor: colors.red, borderColor: colors.red },
  genderText: { color: colors.gray, fontWeight: '600' },
  genderTextActive: { color: colors.white },
});
