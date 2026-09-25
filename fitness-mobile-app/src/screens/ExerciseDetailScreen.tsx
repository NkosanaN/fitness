import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/shared';
import { ExerciseMedia } from '@/components/ExerciseMedia';
import { useExerciseDetail } from '@/hooks/useExercises';
import { storage } from '@/utils/storage';

const titleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const ExerciseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exerciseId } = (route.params as any) || {};
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId);
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    if (exerciseId) {
      checkIfFavorite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  const checkIfFavorite = async () => {
    const favorites = await storage.getFavorites();
    setIsFavorite(favorites.some((f: any) => f.id === exerciseId));
  };

  const handleToggleFavorite = async () => {
    if (!exercise) return;
    if (isFavorite) {
      await storage.removeFavorite(exerciseId);
    } else {
      await storage.addFavorite(exerciseId, exercise);
    }
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 20 }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.notFound}>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <View style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </View>
          </Pressable>
          <Pressable onPress={handleToggleFavorite} hitSlop={8}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.fitness.red : colors.muted}
            />
          </Pressable>
        </View>

        {/* Real demo media (mp4 on paid tier, animated GIF on free tier) */}
        <ExerciseMedia
          videoUrl={exercise.videoUrl}
          gifUrl={exercise.gifUrl}
          imageUrl={exercise.imageUrl}
          showPlayBadge
          style={styles.media}
        />

        {/* Title + chips */}
        <View style={{ paddingHorizontal: 20, marginTop: 18, marginBottom: 20 }}>
          <Text style={styles.title}>{titleCase(exercise.name)}</Text>
          <View style={styles.chipRow}>
            {exercise.targetMuscles?.map((m) => (
              <View key={m} style={styles.chip}>
                <Text style={styles.chipText}>{titleCase(m)}</Text>
              </View>
            ))}
            {exercise.equipments?.map((e) => (
              <View key={e} style={[styles.chip, styles.chipMuted]}>
                <Text style={styles.chipTextMuted}>{titleCase(e)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info cards */}
        <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
          {exercise.bodyParts?.length > 0 && (
            <Card style={styles.infoCard}>
              <Text style={styles.cardLabel}>Body Parts</Text>
              <Text style={styles.cardValue}>
                {exercise.bodyParts.map(titleCase).join(' · ')}
              </Text>
            </Card>
          )}
          {exercise.secondaryMuscles?.length > 0 && (
            <Card style={styles.infoCard}>
              <Text style={styles.cardLabel}>Secondary Muscles</Text>
              <Text style={styles.cardValue}>
                {exercise.secondaryMuscles.map(titleCase).join(' · ')}
              </Text>
            </Card>
          )}
        </View>

        {/* Instructions */}
        {exercise.instructions?.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>How to perform</Text>
            {exercise.instructions.map((instruction: string, idx: number) => (
              <View key={idx} style={styles.instructionRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <LinearGradient
        colors={[colors.gradient.lime, colors.gradient.cyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.ctaWrap}
      >
        <Pressable style={styles.cta} onPress={() => {}}>
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.ctaText}>Add to Workout</Text>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: colors.muted, textAlign: 'center', marginTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    marginHorizontal: 20,
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.foreground },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  chipMuted: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipTextMuted: { fontSize: 11, fontWeight: '600', color: colors.muted },
  infoCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  cardLabel: { fontSize: 11, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  cardValue: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.foreground, marginBottom: 14 },
  instructionRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '800', color: colors.background },
  instructionText: { flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 21 },
  ctaWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: colors.background },
});

export default ExerciseDetailScreen;