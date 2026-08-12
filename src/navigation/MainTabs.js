import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/theme';

import HomeScreen from '../screens/HomeScreen';
import PackagesScreen from '../screens/PackagesScreen';
import PackageDetailScreen from '../screens/PackageDetailScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ClassesScreen from '../screens/ClassesScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import NewsScreen from '../screens/NewsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionHistoryScreen from '../screens/SubscriptionHistoryScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const PackagesStack = createNativeStackNavigator();
const ClassesStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const stackOptions = { headerShown: false, contentStyle: { backgroundColor: colors.black } };

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="HomeTab" component={HomeScreen} />
      <HomeStack.Screen name="Packages" component={PackagesScreen} />
      <HomeStack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <HomeStack.Screen name="Attendance" component={AttendanceScreen} />
      <HomeStack.Screen name="Classes" component={ClassesScreen} />
      <HomeStack.Screen name="News" component={NewsScreen} />
    </HomeStack.Navigator>
  );
}

function PackagesStackScreen() {
  return (
    <PackagesStack.Navigator screenOptions={stackOptions}>
      <PackagesStack.Screen name="PackagesList" component={PackagesScreen} />
      <PackagesStack.Screen name="PackageDetail" component={PackageDetailScreen} />
    </PackagesStack.Navigator>
  );
}

function ClassesStackScreen() {
  return (
    <ClassesStack.Navigator screenOptions={stackOptions}>
      <ClassesStack.Screen name="ClassesList" component={ClassesScreen} />
      <ClassesStack.Screen name="MyBookings" component={MyBookingsScreen} />
    </ClassesStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="SubscriptionHistory" component={SubscriptionHistoryScreen} />
      <ProfileStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <ProfileStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </ProfileStack.Navigator>
  );
}

function TabIcon({ symbol, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? colors.red : 'transparent', marginTop: 3 }} />
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 84, paddingTop: 8 },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ tabBarIcon: (p) => <TabIcon symbol="🏠" {...p} /> }} />
      <Tab.Screen name="ClassesTab" component={ClassesStackScreen} options={{ title: 'Classes', tabBarIcon: (p) => <TabIcon symbol="🗓️" {...p} /> }} />
      <Tab.Screen name="AttendanceTab" component={AttendanceScreen} options={{ title: 'Attend', tabBarIcon: (p) => <TabIcon symbol="📷" {...p} /> }} />
      <Tab.Screen name="PackagesTab" component={PackagesStackScreen} options={{ title: 'Packages', tabBarIcon: (p) => <TabIcon symbol="📦" {...p} /> }} />
      <Tab.Screen name="NewsTab" component={NewsScreen} options={{ title: 'Updates', tabBarIcon: (p) => <TabIcon symbol="🔔" {...p} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile', tabBarIcon: (p) => <TabIcon symbol="👤" {...p} /> }} />
    </Tab.Navigator>
  );
}
