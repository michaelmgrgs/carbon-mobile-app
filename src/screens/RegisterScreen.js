import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Screen, Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors, radius } from '../theme/theme';

// Sign-up happens in three steps so every account has a real email address:
// 1. enter email -> we email a 6-digit code, 2. enter the code, 3. fill in the
// form with the verified email locked.
export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'form'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationToken, setVerificationToken] = useState(null);
  const [resendIn, setResendIn] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phoneNumber: '', password: '', gender: '', residentialArea: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const errorText = (err, fallback) => err.response?.data?.error || fallback;

  // Countdown for "Resend code".
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      Alert.alert('Check your email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/start', { email: clean });
      setEmail(clean);
      setCode('');
      setResendIn(data.resendAfter || 60);
      setStep('code');
    } catch (err) {
      if (err.response?.data?.retryAfter) {
        setEmail(clean);
        setResendIn(err.response.data.retryAfter);
        setStep('code');
      } else if (err.response?.data?.code === 'EMAIL_TAKEN') {
        Alert.alert('Already registered', errorText(err), [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log in', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Could not send code', errorText(err, 'Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('Check the code', 'Please enter the 6-digit code from the email.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/verify', { email, code });
      setVerificationToken(data.verificationToken);
      setStep('form');
    } catch (err) {
      Alert.alert('Code not accepted', errorText(err, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Phone, gender and area are optional (App Store guideline 5.1.1(v)): only what
    // the account needs to work is required.
    const { firstName, lastName, password } = form;
    if (!firstName || !lastName || !password) {
      Alert.alert('Missing info', 'Please enter your name and a password.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email, verificationToken });
    } catch (err) {
      Alert.alert('Sign up failed', errorText(err, 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setStep('email');
    setCode('');
    setVerificationToken(null);
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            {step === 'email' && 'Join Carbon and start training. First, your email.'}
            {step === 'code' && `We sent a 6-digit code to ${email}.`}
            {step === 'form' && 'Email verified ✓ Now a few details.'}
          </Text>
          <Text style={styles.steps}>Step {step === 'email' ? 1 : step === 'code' ? 2 : 3} of 3</Text>

          <View style={{ marginTop: 24, width: '100%' }}>
            {step === 'email' && (
              <>
                <Input
                  label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
                  keyboardType="email-address" textContentType="emailAddress" autoComplete="email"
                  returnKeyType="send" onSubmitEditing={sendCode} autoFocus
                />
                <PrimaryButton title="Send code" onPress={sendCode} loading={loading} style={{ marginTop: 8 }} />
              </>
            )}

            {step === 'code' && (
              <>
                <Input
                  label="Verification code" value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
                  placeholder="000000" maxLength={6} style={styles.codeInput} autoFocus
                />
                <Text style={styles.hint}>Can't find it? Check your spam or junk folder.</Text>
                <PrimaryButton title="Verify" onPress={verifyCode} loading={loading} style={{ marginTop: 12 }} />
                <View style={styles.linkRow}>
                  <TouchableOpacity onPress={changeEmail}><Text style={styles.link}>Change email</Text></TouchableOpacity>
                  <TouchableOpacity onPress={sendCode} disabled={resendIn > 0 || loading}>
                    <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>
                      {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 'form' && (
              <>
                <Input label="Email" value={email} editable={false} style={styles.locked} />
                <Input label="First name" value={form.firstName} onChangeText={update('firstName')} autoFocus />
                <Input label="Last name" value={form.lastName} onChangeText={update('lastName')} />
                <Input label="Password" value={form.password} onChangeText={update('password')} secureTextEntry textContentType="newPassword" autoComplete="password-new" />
                <Input label="Phone number (optional)" value={form.phoneNumber} onChangeText={update('phoneNumber')} keyboardType="phone-pad" />

                <Text style={styles.label}>Gender (optional)</Text>
                <Text style={styles.hint}>Helps us plan classes and coaching.</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => update('gender')(form.gender === g ? '' : g)}
                      style={[styles.genderOption, form.gender === g && styles.genderOptionActive]}
                    >
                      <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input label="Residential area (optional)" value={form.residentialArea} onChangeText={update('residentialArea')} placeholder="e.g. Maadi" />

                <PrimaryButton title="Sign Up" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
              </>
            )}

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
  subtitle: { color: colors.gray, fontSize: 14, marginTop: 6, lineHeight: 20 },
  steps: { color: colors.red, fontSize: 12, fontWeight: '700', marginTop: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  label: { color: colors.gray, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  hint: { color: colors.gray, fontSize: 12, marginTop: -2, marginBottom: 8 },
  codeInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: '700' },
  locked: { opacity: 0.5 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  link: { color: colors.red, fontSize: 14, fontWeight: '600' },
  linkDisabled: { color: colors.gray },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  genderOption: {
    flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated,
  },
  genderOptionActive: { backgroundColor: colors.red, borderColor: colors.red },
  genderText: { color: colors.gray, fontWeight: '600' },
  genderTextActive: { color: colors.white },
});
