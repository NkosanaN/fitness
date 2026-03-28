import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { Card, Badge } from '@/components/shared';
import { storage } from '@/utils/storage';

const ActivityScreen = () => {
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [stats] = useState({
    heartRate: 123,
    steps: 2316,
    water: 1.8,
    goalsCompleted: 2,
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barData = [60, 45, 70, 40, 95, 55, 30];
  const dateNumbers = [13, 14, 15, 16, 17, 18, 19];

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    const history = await storage.getWorkouts();
    setWorkoutHistory(history);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            My Activity
          </Text>
        </View>

        {/* Date Selector */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {dateNumbers.map((date, idx) => (
              <Pressable
                key={date}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: idx === 2 ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: idx === 2 ? colors.background : colors.foreground,
                    fontSize: 12,
                    fontWeight: idx === 2 ? '600' : '500',
                  }}
                >
                  {idx === 2 ? `Today, 23 Oct` : date}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card large>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {/* Heart Rate */}
              <View style={{ flex: 1, minWidth: '45%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="heart" size={14} color={colors.fitness.red} />
                  <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500' }}>
                    Heart Rate
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                  {stats.heartRate}
                  <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>
                    {' '}Bpm
                  </Text>
                </Text>
              </View>

              {/* Steps */}
              <View style={{ flex: 1, minWidth: '45%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="footsteps" size={14} color={colors.fitness.orange} />
                  <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500' }}>
                    Steps
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                  {stats.steps}
                </Text>
              </View>

              {/* Water */}
              <View style={{ flex: 1, minWidth: '45%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="water" size={14} color={colors.fitness.blue} />
                  <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500' }}>
                    Water
                  </Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                  {stats.water}
                  <Text style={{ fontSize: 12, fontWeight: '400', color: colors.muted }}>
                    {' '}L
                  </Text>
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Goals */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="leaf" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                  Completed {stats.goalsCompleted} goals
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  Keep upgrading to get benefits
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.foreground }}>
                Detail
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* Statistics Chart */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
            Statistic
          </Text>
          <Card large>
            <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
              <Badge label="190 kcal" type="green" />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 128, marginBottom: 12 }}>
              {barData.map((value, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <View
                    style={{
                      width: 24,
                      height: `${value}%`,
                      borderRadius: 6,
                      backgroundColor: i === 4 ? colors.primary : `${colors.primary}40`,
                    }}
                  />
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {days.map((day, i) => (
                <Text
                  key={day}
                  style={{
                    fontSize: 11,
                    flex: 1,
                    textAlign: 'center',
                    color: i === 4 ? colors.foreground : colors.muted,
                    fontWeight: i === 4 ? '600' : '400',
                  }}
                >
                  {day}
                </Text>
              ))}
            </View>
          </Card>
        </View>

        {/* Workout History */}
        {workoutHistory.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              Recent Workouts
            </Text>
            {workoutHistory.slice(0, 5).map((workout, idx) => (
              <Card key={idx} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                  {workout.name || 'Workout'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {new Date(workout.createdAt).toLocaleDateString()}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityScreen;
