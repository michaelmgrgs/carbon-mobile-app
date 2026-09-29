import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Screen, Card, Input, PrimaryButton, GhostButton } from '../components/UI';
import { colors, typography } from '../theme/theme';

export default function DeleteAccountScreen({ navigation }) {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const runDelete = async () => {
    setLoading(true);
    try {
      await deleteAccount(password);
      Alert.alert('Account deleted', 'Your Carbon account has been deleted.');
    } catch (err) {
      Alert.alert('Could not delete account', err.response?.data?.error || 'Please try again.');
      setLoading(false);
    }
  };

  const confirm = () => {
    if (!password) {
      Alert.alert('Missing info', 'Please enter your password to confirm.');
      return;
    }
    Alert.alert('Delete account?', 'This permanently deletes your account and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Text style={styles.title}>Delete Account</Text>
        <Card style={{ marginBottom: 20 }}>
          <Text style={styles.body}>
            Deleting your account permanently removes your Carbon profile and personal details, and you will
            no longer be able to log in. This cannot be undone.
          </Text>
        </Card>
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <PrimaryButton title="Delete My Account" onPress={confirm} loading={loading} style={{ marginTop: 8 }} />
        <GhostButton title="Cancel" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 26, fontFamily: typography.fontFamily.display, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20 },
  body: { color: colors.white, fontSize: 14, lineHeight: 21 },
});
