import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { Card, Badge } from '@/components/shared';

const CATEGORIES = ['All Type', 'Upper Body', 'Lower Body', 'Cardio'];

const HomeScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('All Type');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
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

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Francisco Ebol';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header (Matching Reference Screen 3) */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
            </View>
            <View>
              <Text style={styles.welcomeSub}>Welcome Back! 👋</Text>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Workout')}
            >
              <Ionicons name="search" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        {/* Section: New Program */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Program</Text>
          <Pressable onPress={() => navigation.navigate('Workout')}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>

        {/* Hero Workout Banner Card (Image 3 / Image 1 Reference) */}
        <Pressable
          style={styles.heroCard}
          onPress={() => navigation.navigate('Workout')}
        >
          <View style={styles.heroImagePlaceholder}>
            <LinearGradient
              colors={['rgba(6, 8, 13, 0.2)', 'rgba(6, 8, 13, 0.9)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Upper Body</Text>
            </View>
            <View style={styles.heroCardBottom}>
              <Text style={styles.heroTitle}>Simple Chest Workout only 5 mins</Text>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaPill}>
                  <Ionicons name="time-outline" size={14} color={colors.primary} />
                  <Text style={styles.heroMetaText}>5 Minutes</Text>
                </View>
                <View style={styles.heroMetaPill}>
                  <Ionicons name="flash-outline" size={14} color={colors.primary} />
                  <Text style={styles.heroMetaText}>1200 Kcal</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Category Pills (All Type / Upper Body / Lower Body) */}
        <View style={styles.categoryRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Section: Workout Programs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout Programs</Text>
          <Pressable onPress={() => navigation.navigate('Workout')}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        </View>

        {/* Workout Program Card (Image 3 Reference) */}
        <Card large style={styles.programCard}>
          <View style={styles.programContent}>
            <View style={styles.programTag}>
              <Text style={styles.programTagText}>Back Muscle</Text>
            </View>
            <Text style={styles.programTitle}>
              7 days workout to Strengthen the Back Muscles
            </Text>
            <View style={styles.programFooter}>
              <Pressable
                style={styles.startProgramBtn}
                onPress={() => navigation.navigate('Workout')}
              >
                <Text style={styles.startProgramText}>Start Program</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* Quick Builder CTA */}
        <View style={{ marginTop: 16 }}>
          <Pressable
            style={styles.builderBanner}
            onPress={() => navigation.navigate('Workout')}
          >
            <LinearGradient
              colors={[colors.gradient.lime, colors.gradient.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.builderBannerGradient}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.builderBannerEyebrow}>AI WORKOUT FILTER</Text>
                <Text style={styles.builderBannerTitle}>Find Workouts by Equipment</Text>
                <Text style={styles.builderBannerSub}>L1 Equipment → L2 Targeted Muscles → L3 Exercises</Text>
              </View>
              <View style={styles.builderArrow}>
                <Ionicons name="arrow-forward" size={18} color={colors.background} />
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSub: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.foreground,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.foreground,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  heroImagePlaceholder: {
    height: 180,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#161922',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  heroCardBottom: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.foreground,
    lineHeight: 24,
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryScroll: {
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  categoryPillTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  programCard: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 12,
  },
  programContent: {
    gap: 10,
  },
  programTag: {
    alignSelf: 'flex-start',
  },
  programTagText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.foreground,
    lineHeight: 22,
  },
  programFooter: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  startProgramBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startProgramText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.background,
  },
  builderBanner: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  builderBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  builderBannerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.background,
    opacity: 0.8,
  },
  builderBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
    marginTop: 2,
  },
  builderBannerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.background,
    opacity: 0.9,
    marginTop: 2,
  },
  builderArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
