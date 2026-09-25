import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Modal,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { Card } from '@/components/shared';
import { ExerciseMedia } from '@/components/ExerciseMedia';
import { useEquipment, useMusclesByEquipment } from '@/hooks/useExercises';
import type { Exercise } from '@/types/exercise';
import { storage } from '@/utils/storage';
import { api } from '@/utils/api';

const STEPS = [
  { level: 'L1', label: 'Equipment' },
  { level: 'L2', label: 'Muscles' },
  { level: 'L3', label: 'Exercises' },
] as const;

const EQUIPMENT_ICONS: Record<string, string> = {
  body: '🧘',
  barbell: '🏋️',
  dumbbell: '💪',
  kettlebell: '🔔',
  band: '🪢',
  cable: '⚡',
  machine: '⚙️',
  ez: '📊',
  smith: '🗼',
  ball: '⚽',
  bench: '🪑',
  rope: '🪢',
  box: '📦',
  pull: '🧲',
  ring: '⭕',
  plank: '🛝',
  roller: '🧻',
  tire: '🛞',
  sled: '🛷',
  ladder: '🪜',
  treadmill: '🏃',
  step: '🏃',
  bike: '🚴',
  skierg: '⛷️',
  elliptical: '🚶',
  default: '🏋️',
};

const MUSCLE_ICONS: Record<string, string> = {
  'cardiovascular system': '🫀',
  cardio: '❤️',
  feet: '🦶',
  foot: '🦶',
  ankle: '🦶',
  shin: '🦵',
  abs: '🎯',
  biceps: '💪',
  triceps: '💪',
  chest: '🏋️',
  pec: '🏋️',
  back: '🦾',
  lat: '🦅',
  shoulder: '🤷',
  delt: '💪',
  trap: '🧱',
  leg: '🦵',
  quad: '🦵',
  hamstring: '🦵',
  calf: '🦶',
  glute: '🍑',
  forearm: '🖐️',
  wrist: '🖐️',
  core: '🧊',
  oblique: '🍫',
  hip: '🦴',
  groin: '🤞',
  neck: '🙆',
  spine: '🦴',
  default: '💪',
};

const getIcon = (map: Record<string, string>, value: string) => {
  const key = value.toLowerCase();
  for (const [k, icon] of Object.entries(map)) {
    if (key.includes(k)) return icon;
  }
  return map.default;
};

const titleCase = (s: string) =>
  s
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const WorkoutScreen = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0=L1, 1=L2, 2=L3
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  const { data: muscleList, isLoading: musclesLoading } = useMusclesByEquipment(selectedEquipment);
  const { data: equipmentList, isLoading: equipmentLoading } = useEquipment();

  // Prune any selected muscles that are no longer valid for the selected equipment
  useEffect(() => {
    if (muscleList && muscleList.length > 0 && selectedMuscles.length > 0) {
      const valid = new Set(muscleList.map((m) => m.toLowerCase()));
      const pruned = selectedMuscles.filter((m) => valid.has(m.toLowerCase()));
      if (pruned.length !== selectedMuscles.length) {
        setSelectedMuscles(pruned);
      }
    }
  }, [muscleList]);

  // Manual exercise fetching with cursor pagination (same filters → same result set)
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalMatches, setTotalMatches] = useState<number | null>(null);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const activeFilters = selectedEquipment.length + selectedMuscles.length;

  const sortedMuscles = useMemo(
    () => [...(muscleList || [])].sort((a, b) => a.localeCompare(b)),
    [muscleList]
  );

  const fetchPage = async (after?: string) => {
    setExercisesLoading(true);
    try {
      // 1. Initial query: try with selectedEquipment and muscles
      const res = await api.exercises.getExercises({
        equipments: selectedEquipment.length ? selectedEquipment : undefined,
        muscles: selectedMuscles.length ? selectedMuscles : undefined,
        limit: 25,
        after,
      });

      let pageData = res.data || [];

      // 2. If 0 found and muscles were specified with equipment, query equipment exercises and match target OR secondary
      if (pageData.length === 0 && selectedMuscles.length > 0 && selectedEquipment.length > 0) {
        const eqRes = await api.exercises.getExercises({
          equipments: selectedEquipment,
          limit: 50,
        });

        if (eqRes.data && eqRes.data.length > 0) {
          const selectedLower = selectedMuscles.map((m) => m.toLowerCase());
          const filtered = eqRes.data.filter((ex) => {
            const targets = (ex.targetMuscles || []).map((m) => m.toLowerCase());
            const secondaries = (ex.secondaryMuscles || []).map((m) => m.toLowerCase());
            return selectedLower.some((sm) => targets.includes(sm) || secondaries.includes(sm));
          });
          pageData = filtered.length > 0 ? filtered : eqRes.data;
        }
      }

      // 3. Fallback: if still 0 found and muscles were specified, query by muscle
      if (pageData.length === 0 && selectedMuscles.length > 0) {
        const muscleRes = await api.exercises.getExercises({
          muscles: selectedMuscles,
          limit: 25,
        });
        if (muscleRes.data && muscleRes.data.length > 0) {
          pageData = muscleRes.data;
        }
      }

      setExercises((prev) => {
        const seen = new Set(prev.map((e) => e.exerciseId));
        const fresh = pageData.filter((e) => !seen.has(e.exerciseId));
        return after ? [...prev, ...fresh] : fresh;
      });
      setNextCursor(res.meta?.nextCursor ?? null);
      setTotalMatches(pageData.length > 0 ? (res.meta?.total || pageData.length) : 0);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setExercisesLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      setExercises([]);
      setNextCursor(null);
      setTotalMatches(null);
      fetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, selectedEquipment.join(','), selectedMuscles.join(',')]);

  const loadMore = () => {
    if (nextCursor && !exercisesLoading) {
      fetchPage(nextCursor);
    }
  };

  const toggle = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleStartWorkout = async () => {
    const workout = {
      id: Date.now().toString(),
      name: `Workout · ${Math.max(selectedEquipment.length, 1)} equip · ${exercises.length} exercises`,
      exercises: exercises.slice(0, 12).map((e) => e.name),
      equipment: selectedEquipment,
      muscles: selectedMuscles,
      createdAt: Date.now(),
    };
    await storage.addWorkout(workout);
    setModalVisible(false);
    setWorkoutStarted(true);
    setTimeout(() => {
      setWorkoutStarted(false);
      setCurrentStep(0);
      setSelectedEquipment([]);
      setSelectedMuscles([]);
    }, 2200);
  };

  const renderStepPills = () => (
    <View style={styles.stepPills}>
      {STEPS.map((step, idx) => {
        const active = currentStep === idx;
        const done = currentStep > idx;
        return (
          <View key={step.level} style={styles.stepPillWrap}>
            {idx > 0 && <View style={[styles.stepConnector, currentStep >= idx && styles.stepConnectorActive]} />}
            <Pressable
              onPress={() => setCurrentStep(idx)}
              style={[
                styles.stepPill,
                active && styles.stepPillActive,
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              ) : (
                <Text style={[styles.stepPillLevel, active && styles.stepPillLevelActive]}>
                  {step.level}
                </Text>
              )}
            </Pressable>
            <Text style={[styles.stepPillLabel, active && styles.stepPillLabelActive]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderEquipmentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What equipment do you have?</Text>
      <Text style={styles.stepSubtitle}>
        {selectedEquipment.length > 0
          ? `${selectedEquipment.length} selected · Filters muscles in L2`
          : 'Pick equipment to narrow your muscle targets in L2'}
      </Text>

      {equipmentLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.grid}>
            {(equipmentList || []).map((item) => {
              const selected = selectedEquipment.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggle(item, selectedEquipment, setSelectedEquipment)}
                  style={[styles.equipCard, selected && styles.equipCardSelected]}
                >
                  <Text style={styles.equipIcon}>{getIcon(EQUIPMENT_ICONS, item)}</Text>
                  <Text
                    style={[
                      styles.equipLabel,
                      selected && styles.equipLabelSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {titleCase(item)}
                  </Text>
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.background} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderMusclesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Which muscles are you training?</Text>
      <Text style={styles.stepSubtitle}>
        {selectedEquipment.length > 0
          ? `Filtered for ${selectedEquipment.map(titleCase).join(', ')} · ${selectedMuscles.length} selected`
          : selectedMuscles.length > 0
          ? `${selectedMuscles.length} selected`
          : 'Choose one or more target muscles'}
      </Text>

      {musclesLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : sortedMuscles.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 20 }}>
          <Text style={styles.emptyText}>
            No specific muscles mapped for the selected gear. You can continue to L3 to view all exercises.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.muscleGrid}>
            {sortedMuscles.map((item) => {
              const selected = selectedMuscles.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggle(item, selectedMuscles, setSelectedMuscles)}
                  style={[styles.muscleChip, selected && styles.muscleChipSelected]}
                >
                  <Text style={styles.muscleChipIcon}>{getIcon(MUSCLE_ICONS, item)}</Text>
                  <Text
                    style={[
                      styles.muscleChipLabel,
                      selected && styles.muscleChipLabelSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {titleCase(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderExercisesStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.exerciseHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepTitle}>
            {activeFilters > 0 ? 'Matched exercises' : 'Popular exercises'}
          </Text>
          <Text style={styles.stepSubtitle}>
            {totalMatches !== null
              ? `${totalMatches} found`
              : 'Matching equipment + muscles'}
          </Text>
        </View>
        {activeFilters > 0 && (
          <Pressable
            onPress={() => {
              setSelectedEquipment([]);
              setSelectedMuscles([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close" size={14} color={colors.muted} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {exercisesLoading && exercises.length === 0 ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.emptyText}>Finding the perfect moves…</Text>
        </View>
      ) : exercises.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🏋️</Text>
          <Text style={styles.emptyText}>
            No exercises match those filters. Try adding fewer constraints or clearing the selection.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {exercises.map((item, idx) => (
            <Pressable key={`${item.exerciseId || idx}`} onPress={() => handleExercisePress(item)}>
              <Card style={styles.exerciseCard}>
                <View style={styles.exerciseRow}>
                  <ExerciseMedia
                    gifUrl={item.gifUrl}
                    imageUrl={item.imageUrl}
                    showPlayBadge
                    style={styles.exerciseThumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName} numberOfLines={2}>
                      {titleCase(item.name)}
                    </Text>
                    <View style={styles.chipRow}>
                      {item.targetMuscles?.slice(0, 2).map((m) => (
                        <View key={m} style={styles.miniChip}>
                          <Text style={styles.miniChipText}>{titleCase(m)}</Text>
                        </View>
                      ))}
                      {item.equipments?.slice(0, 1).map((e) => (
                        <View key={e} style={[styles.miniChip, styles.miniChipMuted]}>
                          <Text style={styles.miniChipTextMuted}>{titleCase(e)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
              </Card>
            </Pressable>
          ))}
          {nextCursor && (
            <Pressable style={styles.loadMore} onPress={loadMore} disabled={exercisesLoading}>
              {exercisesLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Load more</Text>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderModalMedia = () => {
    if (!selectedExercise) return null;
    return (
      <ExerciseMedia
        videoUrl={selectedExercise.videoUrl}
        gifUrl={selectedExercise.gifUrl}
        imageUrl={selectedExercise.imageUrl}
        showPlayBadge
        style={styles.modalMedia}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Ambient gradient glow */}
      <LinearGradient
        colors={['rgba(201,242,60,0.10)', 'transparent']}
        style={styles.ambient}
        pointerEvents="none"
      />

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>AI Workout Builder</Text>
          <Text style={styles.headerTitle}>Build your workout</Text>
          <Text style={styles.headerSubtitle}>Equipment → Muscles → Matched exercises</Text>
        </View>

        {/* L1 / L2 / L3 Pills */}
        {renderStepPills()}

        {/* Step Content */}
        <View style={{ flex: 1 }}>
          {currentStep === 0 && renderEquipmentStep()}
          {currentStep === 1 && renderMusclesStep()}
          {currentStep === 2 && renderExercisesStep()}
        </View>

        {/* Success Overlay */}
        {workoutStarted && (
          <View style={styles.successOverlay}>
            <LinearGradient
              colors={[colors.gradient.lime, colors.gradient.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successRing}
            >
              <Ionicons name="checkmark" size={40} color={colors.background} />
            </LinearGradient>
            <Text style={styles.successTitle}>Workout started!</Text>
            <Text style={styles.successSubtitle}>Check Activity to track your progress</Text>
          </View>
        )}

        {/* Bottom Bar */}
        {!workoutStarted && (
          <View style={styles.bottomBar}>
            {currentStep > 0 && (
              <Pressable style={styles.prevButton} onPress={() => setCurrentStep(currentStep - 1)}>
                <Ionicons name="arrow-back" size={18} color={colors.foreground} />
                <Text style={styles.prevButtonText}>Back</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.nextButtonWrap}
              onPress={() => {
                if (currentStep < 2) {
                  setCurrentStep(currentStep + 1);
                } else if (exercises.length > 0) {
                  handleStartWorkout();
                }
              }}
            >
              <LinearGradient
                colors={
                  currentStep === 2 && exercises.length === 0
                    ? [colors.card, colors.card]
                    : [colors.gradient.lime, colors.gradient.cyan]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButton}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    currentStep === 2 && exercises.length === 0 && { color: colors.muted },
                  ]}
                >
                  {currentStep === 2
                    ? exercises.length > 0
                      ? `Start Workout (${exercises.length})`
                      : 'No matches'
                    : 'Continue'}
                </Text>
                {currentStep < 2 && (
                  <Ionicons name="arrow-forward" size={18} color={colors.background} />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>

      {/* Exercise Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
              <View style={styles.modalBackBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.foreground} />
              </View>
            </Pressable>
            <Text style={styles.modalTitle}>Exercise</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {selectedExercise && (
              <>
                {renderModalMedia()}

                <View style={{ paddingHorizontal: 20, marginTop: 18, marginBottom: 20 }}>
                  <Text style={styles.exerciseDetailTitle}>{titleCase(selectedExercise.name)}</Text>
                  <View style={styles.chipRow}>
                    {selectedExercise.targetMuscles?.map((m) => (
                      <View key={m} style={styles.detailChip}>
                        <Text style={styles.detailChipText}>{titleCase(m)}</Text>
                      </View>
                    ))}
                    {selectedExercise.equipments?.map((e) => (
                      <View key={e} style={[styles.detailChip, styles.detailChipMuted]}>
                        <Text style={styles.detailChipTextMuted}>{titleCase(e)}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={{ paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
                  {selectedExercise.bodyParts?.length > 0 && (
                    <Card style={styles.infoCard}>
                      <Text style={styles.cardLabel}>Body Parts</Text>
                      <Text style={styles.cardValue}>
                        {selectedExercise.bodyParts.map(titleCase).join(' · ')}
                      </Text>
                    </Card>
                  )}
                  {selectedExercise.secondaryMuscles?.length > 0 && (
                    <Card style={styles.infoCard}>
                      <Text style={styles.cardLabel}>Secondary Muscles</Text>
                      <Text style={styles.cardValue}>
                        {selectedExercise.secondaryMuscles.map(titleCase).join(' · ')}
                      </Text>
                    </Card>
                  )}
                </View>

                {selectedExercise.instructions?.length > 0 && (
                  <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>How to perform</Text>
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <View key={idx} style={styles.instructionRow}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.instructionText}>{instruction}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Start Workout from modal */}
          <LinearGradient
            colors={[colors.gradient.lime, colors.gradient.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalCtaWrap}
          >
            <Pressable style={styles.modalCta} onPress={handleStartWorkout}>
              <Ionicons name="play" size={18} color={colors.background} />
              <Text style={styles.modalCtaText}>Start Workout</Text>
            </Pressable>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ambient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  stepPills: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  stepPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepConnector: {
    width: 34,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 6,
    marginBottom: 18,
  },
  stepConnectorActive: {
    backgroundColor: colors.primary,
  },
  stepPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  stepPillLevel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.muted,
  },
  stepPillLevelActive: {
    color: colors.background,
  },
  stepPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    width: 60,
    alignSelf: 'center',
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -30 }],
  },
  stepPillLabelActive: {
    color: colors.foreground,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.foreground,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  gridContent: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipCard: {
    width: '31%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  equipCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  equipIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  equipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  equipLabelSelected: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  muscleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  muscleChipIcon: {
    fontSize: 14,
  },
  muscleChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
  },
  muscleChipLabelSelected: {
    color: colors.primary,
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  clearButtonText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  exerciseCard: {
    marginBottom: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  miniChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  miniChipMuted: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniChipTextMuted: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.muted,
  },
  loadMore: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingBottom: 24,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  nextButtonWrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.background,
  },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6,8,13,0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.foreground,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
  },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  modalMedia: {
    marginHorizontal: 20,
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseDetailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.foreground,
  },
  detailChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  detailChipMuted: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailChipTextMuted: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cardLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.foreground,
    marginBottom: 14,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.background,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 21,
  },
  modalCtaWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modalCtaText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
});

export default WorkoutScreen;