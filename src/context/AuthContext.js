import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setAccessToken } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { isBiometricEnabled, promptBiometricAuth, setBiometricEnabled } from '../services/biometrics';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // True when there's a saved session, but it's gated behind Face ID/Touch ID
  // and the user hasn't unlocked it yet this app-open (or cancelled the prompt).
  const [needsBiometricUnlock, setNeedsBiometricUnlock] = useState(false);

  // Actually completes login using the stored refresh token — called either
  // directly (biometrics disabled) or after a successful biometric prompt.
  const completeSessionFromStorage = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync('carbon_refresh_token');
    const savedUser = await SecureStore.getItemAsync('carbon_user');
    if (!refreshToken || !savedUser) return false;

    const { data } = await api.post('/auth/refresh', { refreshToken });
    setAccessToken(data.accessToken);
    setUser(JSON.parse(savedUser));
    registerForPushNotificationsAsync();
    return true;
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('carbon_refresh_token');
      if (!refreshToken) return; // no saved session at all — show login normally

      const biometricOn = await isBiometricEnabled();
      if (biometricOn) {
        setNeedsBiometricUnlock(true); // LoginScreen shows a "Unlock with Face ID" button
        return;
      }

      await completeSessionFromStorage();
    } catch (err) {
      // stale/invalid refresh token — force logout
      await SecureStore.deleteItemAsync('carbon_refresh_token');
      await SecureStore.deleteItemAsync('carbon_user');
    } finally {
      setIsLoading(false);
    }
  }, [completeSessionFromStorage]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Called from LoginScreen when biometrics are gating a saved session.
  const unlockWithBiometrics = async () => {
    const success = await promptBiometricAuth('Unlock Carbon');
    if (!success) return false;
    try {
      await completeSessionFromStorage();
      setNeedsBiometricUnlock(false);
      return true;
    } catch (err) {
      await SecureStore.deleteItemAsync('carbon_refresh_token');
      await SecureStore.deleteItemAsync('carbon_user');
      setNeedsBiometricUnlock(false);
      return false;
    }
  };

  // If someone cancels the Face ID prompt, let them fall back to typing
  // their email/password instead of being stuck.
  const cancelBiometricUnlock = () => setNeedsBiometricUnlock(false);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    await SecureStore.setItemAsync('carbon_refresh_token', data.refreshToken);
    await SecureStore.setItemAsync('carbon_user', JSON.stringify(data.user));
    setUser(data.user);
    setNeedsBiometricUnlock(false);
    registerForPushNotificationsAsync();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.accessToken);
    await SecureStore.setItemAsync('carbon_refresh_token', data.refreshToken);
    await SecureStore.setItemAsync('carbon_user', JSON.stringify(data.user));
    setUser(data.user);
    registerForPushNotificationsAsync();
    return data.user;
  };

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('carbon_refresh_token');
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      // ignore network errors on logout
    }
    setAccessToken(null);
    await SecureStore.deleteItemAsync('carbon_refresh_token');
    await SecureStore.deleteItemAsync('carbon_user');
    setUser(null);
  };

  // Permanently deletes the member's account on the server, then clears the local session.
  const deleteAccount = async (password) => {
    await api.delete('/profile', { data: { password } });
    setAccessToken(null);
    await SecureStore.deleteItemAsync('carbon_refresh_token');
    await SecureStore.deleteItemAsync('carbon_user');
    await setBiometricEnabled(false);
    setUser(null);
  };

  const refreshUser = async (patch) => setUser((prev) => ({ ...prev, ...patch }));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        needsBiometricUnlock,
        unlockWithBiometrics,
        cancelBiometricUnlock,
        login,
        register,
        logout,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
