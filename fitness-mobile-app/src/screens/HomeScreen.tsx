import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { Card, Badge, ProgressRing } from '@/components/shared';
import { storage } from '@/utils/storage';

const HomeScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [workouts, setWorkouts] = useState([
    { name: 'Pull Up', badge: 'Cardio', type: 'green', time: '15 min', level: 'Beginner' },
    { name: 'Sit Up', badge: 'Muscle', type: 'orange', time: '30 min', level: 'Middle' },
    { name: 'Biceps Curl', badge: 'Strength', type: 'purple', time: '2 hrs', level: 'Pro' },
  ]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Welcome back ✨</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground }}>
                {user?.firstName || 'Guest'}
              </Text>
            </View>
            <Pressable onPress={handleLogout}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>
                  💪
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Progress Card */}
          <Card large style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1 }}>
                Progress
              </Text>
              <Pressable>
                {/* @ts-ignore */}
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Badge label="Cardio" type="green" />
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 8, marginBottom: 8 }}>
                  Lower Body
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>⏱️ 3 hours</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>🏋️ Beginner</Text>
                </View>
              </View>
              <View style={{ marginLeft: 16 }}>
                <ProgressRing percent={72} size={80} />
              </View>
            </View>

            <Pressable
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.background }}>
                Continue the workout
              </Text>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          </Card>

          {/* Recommendations */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
              Recommendation
            </Text>

            {workouts.map((workout, idx) => (
              <Card key={idx} style={{ marginBottom: 12, flexDirection: 'row', gap: 12 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: colors.primaryLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>
                    {idx === 0 ? '📤' : idx === 1 ? '⬇️' : '💪'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                      {workout.name}
                    </Text>
                    <Badge label={workout.badge} type={workout.type as any} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>⏱️ {workout.time}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{workout.level}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
