import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { Card, Badge } from '@/components/shared';
import { useExerciseDetail } from '@/hooks/useExercises';
import { useExerciseImage } from '@/hooks/useExerciseImage';
import { storage } from '@/utils/storage';
import { generateFallbackImage } from '@/utils/aiImage';

const ExerciseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exerciseId } = (route.params as any) || {};
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId);
  const [isFavorite, setIsFavorite] = useState(false);

  const { imageUrl, isLoading: imageLoading, isUsingFallback, regenerate } = useExerciseImage(exercise);

  useEffect(() => {
    if (exerciseId) {
      checkIfFavorite();
    }
  }, [exerciseId]);

  const checkIfFavorite = async () => {
    const favorites = await storage.getFavorites();
    setIsFavorite(favorites.some((f: any) => f.id === exerciseId));
  };

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await storage.removeFavorite(exerciseId);
    } else {
      await storage.addFavorite(exerciseId, exercise);
    }
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={{ fontSize: 16, color: colors.muted, textAlign: 'center', marginTop: 40 }}>
            Exercise not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? colors.fitness.red : colors.muted} />
          </Pressable>
        </View>

        {/* Exercise Image/Icon */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            height: 280,
            borderRadius: 20,
            backgroundColor: colors.primaryLight,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {imageLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.muted, marginTop: 8, fontSize: 12 }}>
                Generating demonstration...
              </Text>
            </View>
          ) : imageUrl && !isUsingFallback ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <Pressable
                onPress={regenerate}
                style={styles.regenerateOverlay}
              >
                <View style={styles.regenerateIconBg}>
                  <Ionicons name="refresh" size={20} color={colors.background} />
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={{ fontSize: 100 }}>{generateFallbackImage(exercise)}</Text>
              <Pressable
                onPress={regenerate}
                style={styles.regenerateButton}
              >
                <Ionicons name="refresh" size={16} color={colors.primary} />
                <Text style={styles.regenerateText}>Generate Demo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Exercise Title */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            {exercise.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {exercise.difficulty && (
              <Badge label={`Difficulty: ${exercise.difficulty}`} type="blue" />
            )}
            {exercise.equipment && (
              <Badge label={`Equipment: ${exercise.equipment}`} type="orange" />
            )}
          </View>
        </View>

        {/* Details Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20, gap: 12 }}>
          {/* Target Muscle */}
          {exercise.target && (
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Target Muscle</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {exercise.target.charAt(0).toUpperCase() + exercise.target.slice(1)}
              </Text>
            </Card>
          )}

          {/* Body Part */}
          {exercise.bodyPart && (
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Body Part</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {exercise.bodyPart.charAt(0).toUpperCase() + exercise.bodyPart.slice(1)}
              </Text>
            </Card>
          )}

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <Card>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Secondary Muscles</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {exercise.secondaryMuscles.map((muscle: string, idx: number) => (
                  <Badge key={idx} label={muscle} type="green" />
                ))}
              </View>
            </Card>
          )}
        </View>

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              Instructions
            </Text>
            {exercise.instructions.map((instruction: string, idx: number) => (
              <View key={idx} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: colors.foreground,
                      lineHeight: 20,
                    }}
                  >
                    {instruction}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Add to Workout Button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <Pressable
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.background, fontWeight: '600', fontSize: 16 }}>
              Add to Workout
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  regenerateText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  regenerateOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  regenerateIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExerciseDetailScreen;

