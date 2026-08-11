import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Screen, Input, PrimaryButton } from '../components/UI';

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await api.put('/profile', { firstName, lastName, phoneNumber });
      await refreshUser({ firstName, lastName, phoneNumber });
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err.response?.data?.error || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Input label="First name" value={firstName} onChangeText={setFirstName} />
        <Input label="Last name" value={lastName} onChangeText={setLastName} />
        <Input label="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <PrimaryButton title="Save Changes" onPress={save} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </Screen>
  );
}
