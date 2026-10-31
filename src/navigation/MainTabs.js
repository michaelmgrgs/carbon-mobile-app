import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
import NewsDetailScreen from '../screens/NewsDetailScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const PackagesStack = createNativeStackNavigator();
const ClassesStack = createNativeStackNavigator();
const NewsStack = createNativeStackNavigator();
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
      <HomeStack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <HomeStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <HomeStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <HomeStack.Screen name="SubscriptionHistory" component={SubscriptionHistoryScreen} />
    </HomeStack.Navigator>
  );
}

function NewsStackScreen() {
  return (
    <NewsStack.Navigator screenOptions={stackOptions}>
      <NewsStack.Screen name="NewsList" component={NewsScreen} />
      <NewsStack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </NewsStack.Navigator>
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
      <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </ProfileStack.Navigator>
  );
}

const ICON_FOR = {
  NewsTab: 'newspaper',
  PackagesTab: 'cart',
  ClassesTab: 'calendar',
  ProfileTab: 'person',
};
const LABEL_FOR = {
  NewsTab: 'News',
  PackagesTab: 'Packages',
  ClassesTab: 'Schedule',
  ProfileTab: 'Profile',
};

// Bar layout: News, Packages, [Carbon logo], Schedule, Profile.
// Home is a real route (the app opens on it) but has no tab of its own: the
// center logo is the Home button, so a separate Home tab would be a duplicate.
// Scan & Check In (attendance/QR) intentionally has no standalone bottom tab —
// it's reached from Home's quick-action card instead, same as Book a Class.
function CustomTabBar({ state, navigation }) {
  const routes = state.routes;
  const homeFocused = routes[state.index].name === 'Home';

  const renderTab = (name) => {
    const index = routes.findIndex((r) => r.name === name);
    const route = routes[index];
    const isFocused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <TouchableOpacity key={route.key} activeOpacity={0.7} onPress={onPress} style={styles.tabItem}>
        <Ionicons
          name={isFocused ? ICON_FOR[route.name] : `${ICON_FOR[route.name]}-outline`}
          size={26}
          color={isFocused ? colors.white : colors.gray}
        />
        <Text style={[styles.tabLabel, { color: isFocused ? colors.white : colors.gray }]}>{LABEL_FOR[route.name]}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.barWrap}>
      <View style={styles.bar}>
        {renderTab('NewsTab')}
        {renderTab('PackagesTab')}
        <View style={styles.centerSlot}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home', { screen: 'HomeTab' })}
            style={[styles.centerBtn, homeFocused && styles.centerBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Home"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image source={require('../../assets/logo-badge.png')} style={styles.centerLogo} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {renderTab('ClassesTab')}
        {renderTab('ProfileTab')}
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="NewsTab" component={NewsStackScreen} />
      <Tab.Screen name="PackagesTab" component={PackagesStackScreen} />
      <Tab.Screen name="ClassesTab" component={ClassesStackScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barWrap: {},
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 92 : 74,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  centerSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', zIndex: 10 },
  centerBtn: {
    width: 74, height: 74, borderRadius: 37,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -36,
    borderWidth: 4, borderColor: colors.black,
    shadowColor: colors.red, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    overflow: 'hidden',
    backgroundColor: colors.red,
  },
  centerBtnActive: { borderColor: colors.white },
  centerLogo: { width: '100%', height: '100%' },
});
