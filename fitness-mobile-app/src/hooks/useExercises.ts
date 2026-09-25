import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { storage } from '@/utils/storage';
import { getMusclesForEquipments, mapEquipmentToApi } from '@/constants/equipmentMuscles';
import type { Exercise, ExerciseFilter, ExerciseListMeta } from '@/types/exercise';

/**
 * All list hooks return a flat `string[]` of names (transformed from the
 * new V2 API's `{ name }` objects), so the UI can keep iterating strings.
 */

export const useBodyParts = () =>
  useQuery({
    queryKey: ['bodyParts'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('bodyParts');
      if (cached) return cached as string[];
      const data = await api.exercises.getBodyParts();
      await storage.cacheExercises('bodyParts', data);
      return data;
    },
  });

export const useMuscles = () =>
  useQuery({
    queryKey: ['muscles'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('muscles');
      if (cached) return cached as string[];
      const data = await api.exercises.getMuscles();
      await storage.cacheExercises('muscles', data);
      return data;
    },
  });

export const useEquipment = () =>
  useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('equipment');
      let data: string[] = [];
      if (cached && Array.isArray(cached) && cached.length > 0) {
        data = cached as string[];
      } else {
        data = await api.exercises.getEquipments();
        await storage.cacheExercises('equipment', data);
      }
      if (!data.includes('treadmill')) {
        data = ['treadmill', ...data];
      }
      return data;
    },
  });

/**
 * Context-aware muscles for L2: instead of showing all ~50 muscles
 * regardless of equipment (which caused "treadmill → biceps → 0 found"),
 * we derive the optional muscles FROM the selected equipment's real
 * exercises (including primary target AND secondary muscles).
 * This guarantees every L3 combination actually matches.
 *
 * e.g. treadmill / stepmill machine → cardiovascular system, feet, calves, quadriceps, etc.
 *      dumbbell                    → biceps, triceps, chest, shoulders, etc.
 */
export const useMusclesByEquipment = (equipments: string[]) => {
  const { data: allMuscles } = useMuscles();

  return useQuery({
    queryKey: ['muscles', 'byEquipment', [...equipments].sort().join(',')],
    queryFn: async () => {
      if (equipments.length === 0) {
        return (allMuscles || []).slice().sort((a, b) => a.localeCompare(b));
      }

      // 1. Instant verified mapping for fast UI response
      const baseMuscles = getMusclesForEquipments(equipments);
      const muscleSet = new Set<string>(baseMuscles);

      // 2. Dynamic discovery/enrichment from API & cache
      for (const equipment of equipments) {
        const apiEq = mapEquipmentToApi(equipment);
        const cacheKey = `exercises_equipment_muscles_${apiEq}`;
        const cached = await storage.getCachedExercises(cacheKey);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          cached.forEach((m) => muscleSet.add(m));
          continue;
        }

        try {
          const page = await api.exercises.getExercises({
            equipments: [apiEq],
            limit: 25,
          });
          const found = new Set<string>();
          for (const ex of page.data || []) {
            (ex.targetMuscles || []).forEach((m) => {
              muscleSet.add(m);
              found.add(m);
            });
            (ex.secondaryMuscles || []).forEach((m) => {
              muscleSet.add(m);
              found.add(m);
            });
          }
          if (found.size > 0) {
            await storage.cacheExercises(cacheKey, Array.from(found));
          }
        } catch {
          // Gracefully continue with base mapping
        }
      }

      const result = Array.from(muscleSet).sort((a, b) => a.localeCompare(b));
      return result.length > 0 ? result : (allMuscles || []).slice().sort((a, b) => a.localeCompare(b));
    },
    enabled: true,
  });
};

interface UseExercisesOptions extends ExerciseFilter {
  enabled?: boolean;
}

/**
 * Combined, correctly-filtered exercise query (equipment AND muscles).
 * Includes cursor pagination: keep the `nextCursor` from the previous page
 * in the filter to fetch the next page of the same result set.
 */
export const useExercises = ({ enabled = true, ...filter }: UseExercisesOptions = {}) => {
  const search = JSON.stringify(filter);
  return useQuery<ExerciseListMeta>({
    queryKey: ['exercises', search],
    queryFn: () => api.exercises.getExercises(filter),
    enabled,
  });
};

export const useExerciseDetail = (exerciseId: string | null) =>
  useQuery<Exercise | null>({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      return api.exercises.getExerciseDetail(exerciseId);
    },
    enabled: !!exerciseId,
  });