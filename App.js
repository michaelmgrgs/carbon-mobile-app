import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { Anton_400Regular } from '@expo-google-fonts/anton';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import MainTabs from './src/navigation/MainTabs';
import { navigateForNotification } from './src/services/notifications';
import { colors } from './src/theme/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.black, card: colors.black, border: colors.border, text: colors.white },
};

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black }}>
        <Image source={require('./assets/logo.png')} style={{ width: 90, height: 90, marginBottom: 24 }} resizeMode="contain" />
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.black } }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Opens the right screen when a notification is tapped — including when the tap
// launched the app, in which case we wait until the member is logged in.
function NotificationRouter({ navigationRef, navReady }) {
  const { user } = useAuth();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!response || !user || !navReady) return;
    navigateForNotification(navigationRef, response.notification.request.content.data);
    Notifications.clearLastNotificationResponseAsync();
  }, [response, user, navReady, navigationRef]);

  return null;
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [navReady, setNavReady] = useState(false);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_900Black, Anton_400Regular });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  }

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef} theme={navTheme} onReady={() => setNavReady(true)}>
        <StatusBar style="light" />
        <RootNavigator />
        <NotificationRouter navigationRef={navigationRef} navReady={navReady} />
      </NavigationContainer>
    </AuthProvider>
  );
}
