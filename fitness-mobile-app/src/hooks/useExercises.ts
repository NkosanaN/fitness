import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { storage } from '@/utils/storage';

export const useBodyParts = () => {
  return useQuery({
    queryKey: ['bodyParts'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('bodyParts');
      if (cached) return cached;

      const response = await api.exercises.getBodyParts();
      await storage.cacheExercises('bodyParts', response.data);
      return response.data;
    },
  });
};

export const useTargets = () => {
  return useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('targets');
      if (cached) return cached;

      const response = await api.exercises.getTargets();
      await storage.cacheExercises('targets', response.data);
      return response.data;
    },
  });
};

export const useEquipment = () => {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const cached = await storage.getCachedExercises('equipment');
      if (cached) return cached;

      const response = await api.exercises.getEquipment();
      await storage.cacheExercises('equipment', response.data);
      return response.data;
    },
  });
};

export const useExercisesByBodyPart = (bodyPart: string | null) => {
  return useQuery({
    queryKey: ['exercises', 'bodyPart', bodyPart],
    queryFn: async () => {
      if (!bodyPart) return [];
      const cached = await storage.getCachedExercises(`exercises_bodyPart_${bodyPart}`);
      if (cached) return cached;

      const response = await api.exercises.getByBodyPart(bodyPart);
      await storage.cacheExercises(`exercises_bodyPart_${bodyPart}`, response.data);
      return response.data;
    },
    enabled: !!bodyPart,
  });
};

export const useExercisesByTarget = (target: string | null) => {
  return useQuery({
    queryKey: ['exercises', 'target', target],
    queryFn: async () => {
      if (!target) return [];
      const cached = await storage.getCachedExercises(`exercises_target_${target}`);
      if (cached) return cached;

      const response = await api.exercises.getByTarget(target);
      await storage.cacheExercises(`exercises_target_${target}`, response.data);
      return response.data;
    },
    enabled: !!target,
  });
};

export const useExercisesByEquipment = (equipment: string | null) => {
  return useQuery({
    queryKey: ['exercises', 'equipment', equipment],
    queryFn: async () => {
      if (!equipment) return [];
      const cached = await storage.getCachedExercises(`exercises_equipment_${equipment}`);
      if (cached) return cached;

      const response = await api.exercises.getByEquipment(equipment);
      await storage.cacheExercises(`exercises_equipment_${equipment}`, response.data);
      return response.data;
    },
    enabled: !!equipment,
  });
};

export const useExerciseDetail = (exerciseId: string | null) => {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      const response = await api.exercises.getDetail(exerciseId);
      return response.data;
    },
    enabled: !!exerciseId,
  });
};
