import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../services/api';
import { Screen, Input, PrimaryButton } from '../components/UI';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing info', 'Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/profile/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Your password has been changed.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not change password', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Input label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <PrimaryButton title="Update Password" onPress={save} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </Screen>
  );
}
