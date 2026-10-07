import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null; // push doesn't work on simulators

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenResponse.data;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D6362F',
    });
  }

  try {
    await api.post('/notifications/register-device', {
      expoPushToken,
      platform: Platform.OS,
    });
  } catch (err) {
    console.warn('Could not register push token with server:', err.message);
  }

  return expoPushToken;
}

/**
 * Where to go when a member taps a notification. The server puts { type, ... } in
 * the notification's data; anything unknown just opens the app on Home.
 */
export function navigateForNotification(navigation, data = {}) {
  if (data.type === 'news' && data.newsId) {
    navigation.navigate('Main', { screen: 'Home', params: { screen: 'NewsDetail', params: { newsId: data.newsId } } });
  } else if (data.type === 'package_request') {
    navigation.navigate('Main', { screen: 'Home', params: { screen: 'MyRequests' } });
  }
}
