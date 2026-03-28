import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { Card, Badge } from '@/components/shared';
import {
  useBodyParts,
  useTargets,
  useEquipment,
  useExercisesByBodyPart,
  useExercisesByTarget,
  useExercisesByEquipment,
} from '@/hooks/useExercises';
import { useAppContext } from '@/context/AppContext';
import { useExerciseImage } from '@/hooks/useExerciseImage';
import { generateFallbackImage } from '@/utils/aiImage';

type RootStackParamList = {
  HomeTabs: undefined;
  ExerciseDetail: { exerciseId: string };
};

const WorkoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { filterType, selectedFilter, handleFilterSelect, clearFilters } = useAppContext();
  const [activeTab, setActiveTab] = useState<'bodyPart' | 'target' | 'equipment'>('bodyPart');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: bodyParts, isLoading: bodyPartsLoading } = useBodyParts();
  const { data: targets, isLoading: targetsLoading } = useTargets();
  const { data: equipment, isLoading: equipmentLoading } = useEquipment();

  const { data: exercisesByBodyPart } = useExercisesByBodyPart(
    filterType === 'bodyPart' ? selectedFilter : null
  );
  const { data: exercisesByTarget } = useExercisesByTarget(
    filterType === 'target' ? selectedFilter : null
  );
  const { data: exercisesByEquipment } = useExercisesByEquipment(
    filterType === 'equipment' ? selectedFilter : null
  );

  const { imageUrl, isLoading: imageLoading, isUsingFallback, regenerate } = useExerciseImage(selectedExercise);

  const exercises =
    filterType === 'bodyPart'
      ? exercisesByBodyPart || []
      : filterType === 'target'
      ? exercisesByTarget || []
      : filterType === 'equipment'
      ? exercisesByEquipment || []
      : [];

  const renderFilterItem = (item: string) => {
    const isSelected = selectedFilter === item;
    return (
      <Pressable
        key={item}
        onPress={() => handleFilterSelect(activeTab, item)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          marginRight: 8,
          backgroundColor: isSelected ? colors.primary : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: isSelected ? colors.background : colors.foreground,
            fontSize: 13,
            fontWeight: isSelected ? '600' : '500',
          }}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  const handleExercisePress = (exercise: any) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const renderExerciseItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleExercisePress(item)}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 }}>
            {item.name}
          </Text>
          <Badge label={item.difficulty || 'Medium'} type="blue" />
        </View>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
          Equipment: {item.equipment || 'None'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.target && (
            <Badge label={`Target: ${item.target}`} type="green" />
          )}
          {item.bodyPart && (
            <Badge label={`Body: ${item.bodyPart}`} type="orange" />
          )}
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            Workouts
          </Text>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: 20,
          }}
        >
          {(['bodyPart', 'target', 'equipment'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: activeTab === tab ? '600' : '500',
                  color: activeTab === tab ? colors.primary : colors.muted,
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'bodyPart' ? 'Body Part' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Filter Items */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {activeTab === 'bodyPart' && bodyPartsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : activeTab === 'target' && targetsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : activeTab === 'equipment' && equipmentLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : null}

            {activeTab === 'bodyPart' &&
              bodyParts?.slice(0, 10).map((item: string) => renderFilterItem(item))}
            {activeTab === 'target' &&
              targets?.slice(0, 10).map((item: string) => renderFilterItem(item))}
            {activeTab === 'equipment' &&
              equipment?.slice(0, 10).map((item: string) => renderFilterItem(item))}
          </ScrollView>
        </View>

        {/* Results */}
        {selectedFilter ? (
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>
                Found {exercises.length} exercises
              </Text>
              <Pressable onPress={clearFilters}>
                <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>
                  Clear filters
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={exercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item, idx) => `${item.id || idx}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 20 }}>
                  No exercises found
                </Text>
              }
            />
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, color: colors.muted, textAlign: 'center' }}>
              Select a {activeTab === 'bodyPart' ? 'body part' : activeTab} to see exercises
            </Text>
          </View>
        )}
      </View>

      {/* Exercise Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color={colors.foreground} />
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
                Exercise Details
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedExercise && (
              <>
                {/* Exercise Image */}
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
                          <Text style={{ fontSize: 12, color: colors.background }}>🔄</Text>
                        </View>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.fallbackContainer}>
                      <Text style={{ fontSize: 100 }}>{generateFallbackImage(selectedExercise)}</Text>
                      <Pressable
                        onPress={regenerate}
                        style={styles.regenerateButton}
                      >
                        <Text style={{ fontSize: 14, color: colors.primary }}>Generate Demo</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Exercise Title */}
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
                    {selectedExercise.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {selectedExercise.difficulty && (
                      <Badge label={`Difficulty: ${selectedExercise.difficulty}`} type="blue" />
                    )}
                    {selectedExercise.equipment && (
                      <Badge label={`Equipment: ${selectedExercise.equipment}`} type="orange" />
                    )}
                  </View>
                </View>

                {/* Details Cards */}
                <View style={{ paddingHorizontal: 20, marginBottom: 20, gap: 12 }}>
                  {selectedExercise.target && (
                    <Card>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Target Muscle</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                        {selectedExercise.target.charAt(0).toUpperCase() + selectedExercise.target.slice(1)}
                      </Text>
                    </Card>
                  )}

                  {selectedExercise.bodyPart && (
                    <Card>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Body Part</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                        {selectedExercise.bodyPart.charAt(0).toUpperCase() + selectedExercise.bodyPart.slice(1)}
                      </Text>
                    </Card>
                  )}

                  {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                    <Card>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Secondary Muscles</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {selectedExercise.secondaryMuscles.map((muscle: string, idx: number) => (
                          <Badge key={idx} label={muscle} type="green" />
                        ))}
                      </View>
                    </Card>
                  )}
                </View>

                {/* Instructions */}
                {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                  <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
                      Instructions
                    </Text>
                    {selectedExercise.instructions.map((instruction: string, idx: number) => (
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
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

export default WorkoutScreen;
