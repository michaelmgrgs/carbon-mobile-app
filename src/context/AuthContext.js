import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setAccessToken } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('carbon_refresh_token');
      const savedUser = await SecureStore.getItemAsync('carbon_user');
      if (refreshToken && savedUser) {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        setAccessToken(data.accessToken);
        setUser(JSON.parse(savedUser));
        registerForPushNotificationsAsync();
      }
    } catch (err) {
      // stale/invalid refresh token — force logout
      await SecureStore.deleteItemAsync('carbon_refresh_token');
      await SecureStore.deleteItemAsync('carbon_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    await SecureStore.setItemAsync('carbon_refresh_token', data.refreshToken);
    await SecureStore.setItemAsync('carbon_user', JSON.stringify(data.user));
    setUser(data.user);
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

  const refreshUser = async (patch) => setUser((prev) => ({ ...prev, ...patch }));

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
