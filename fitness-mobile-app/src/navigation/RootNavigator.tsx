import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { colors } from '@/constants/colors';

import LoginScreen from '@/screens/auth/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import WorkoutScreen from '@/screens/WorkoutScreen';
import ActivityScreen from '@/screens/ActivityScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ExerciseDetailScreen from '@/screens/ExerciseDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workout') iconName = 'barbell';
          else if (route.name === 'Activity') iconName = 'stats-chart';
          else if (route.name === 'Profile') iconName = 'person';
          else iconName = 'home';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { isSignedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="HomeTabs" component={HomeTabs} />
          <Stack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
