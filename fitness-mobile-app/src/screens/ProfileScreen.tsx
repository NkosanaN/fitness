import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { Card, Badge } from '@/components/shared';

const ProfileScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
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

  const stats = [
    { label: 'Total Workouts', value: '24', icon: '💪' },
    { label: 'Total Hours', value: '48', icon: '⏱️' },
    { label: 'Calories Burned', value: '2,450', icon: '🔥' },
    { label: 'Avg Per Week', value: '3.5', icon: '📊' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            Profile
          </Text>
        </View>

        {/* User Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card large>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 32 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
                  {user?.firstName} {user?.lastName || ''}
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </View>
            </View>

            <Pressable
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.background, fontWeight: '600', fontSize: 14 }}>
                Edit Profile
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="log-out" size={16} color={colors.foreground} />
              <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 14 }}>
                Logout
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {stats.map((stat, idx) => (
              <View key={idx} style={{ width: '48%' }}>
                <Card>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                    {stat.label}
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                    {stat.value}
                  </Text>
                  <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
                </Card>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            Settings
          </Text>

          {[
            { label: 'Notifications', icon: '🔔' },
            { label: 'Privacy & Security', icon: '🔒' },
            { label: 'Help & Support', icon: '❓' },
            { label: 'About App', icon: 'ℹ️' },
          ].map((item, idx) => (
            <Pressable key={idx}>
              <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground }}>
                    {item.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 18 }}>→</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
