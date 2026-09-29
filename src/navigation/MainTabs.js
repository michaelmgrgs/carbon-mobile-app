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
import DeleteAccountScreen from '../screens/DeleteAccountScreen';

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
      <HomeStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <HomeStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <HomeStack.Screen name="SubscriptionHistory" component={SubscriptionHistoryScreen} />
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
      <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </ProfileStack.Navigator>
  );
}

const ICON_FOR = {
  Home: 'home',
  PackagesTab: 'cart',
  ClassesTab: 'calendar',
  ProfileTab: 'person',
};
const LABEL_FOR = {
  Home: 'Home',
  PackagesTab: 'Buy Now',
  ClassesTab: 'Schedule',
  ProfileTab: 'Profile',
};

// Real tab order in the navigator: Home, PackagesTab(Buy Now), ClassesTab(Schedule), ProfileTab.
// The circular logo is rendered as a purely visual 5th item, inserted between
// index 1 and 2, and just navigates to Home when tapped — it isn't a real route.
// Scan & Check In (attendance/QR) intentionally has no standalone bottom tab —
// it's reached from Home's quick-action card instead, same as Book a Class.
function CustomTabBar({ state, navigation }) {
  const routes = state.routes;

  const renderTab = (route, index) => {
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
        {renderTab(routes[0], 0)}
        {renderTab(routes[1], 1)}
        <View style={styles.centerSlot}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home', { screen: 'HomeTab' })}
            style={styles.centerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image source={require('../../assets/logo-badge.png')} style={styles.centerLogo} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {renderTab(routes[2], 2)}
        {renderTab(routes[3], 3)}
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
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
  centerLogo: { width: '100%', height: '100%' },
});
