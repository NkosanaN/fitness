import axios from 'axios';
import type { Exercise, ExerciseFilter, ExerciseListMeta, NameListResponse } from '@/types/exercise';

/**
 * ExerciseDB V2 / AscendAPI — free OSS tier: https://oss.exercisedb.dev
 * No API key required. Returns animated GIF demos per exercise.
 *
 * Paid tier ("EDB with Videos and Images by AscendAPI" on RapidAPI) adds
 * mp4 `videoUrl` + multi-res `imageUrls`. To use it, set:
 *   EXPO_PUBLIC_EXERCISEDB_BASE_URL=https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1
 *   EXPO_PUBLIC_EXERCISEDB_API_KEY=<key>
 *   EXPO_PUBLIC_EXERCISEDB_API_HOST=edb-with-videos-and-images-by-ascendapi.p.rapidapi.com
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_EXERCISEDB_BASE_URL || 'https://oss.exercisedb.dev/api/v1';

const API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;
const API_HOST = process.env.EXPO_PUBLIC_EXERCISEDB_API_HOST;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: API_KEY
    ? {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      }
    : {},
});

const toNames = (res: { data: NameListResponse }): string[] => {
  try {
    return (res.data?.data || []).map((item) => item.name).filter(Boolean);
  } catch {
    return [];
  }
};

export const api = {
  exercises: {
    /** GET /equipments → string[] of equipment names */
    getEquipments: async (): Promise<string[]> => {
      const res = await client.get('/equipments');
      return toNames(res);
    },

    /** GET /bodyparts → string[] of body part names */
    getBodyParts: async (): Promise<string[]> => {
      const res = await client.get('/bodyparts');
      return toNames(res);
    },

    /** GET /muscles → string[] of target muscle names */
    getMuscles: async (): Promise<string[]> => {
      const res = await client.get('/muscles');
      return toNames(res);
    },

    /**
     * GET /exercises — combined smart filtering.
     * Multiple values in one param are comma-separated (OR within the param,
     * AND across params) so selecting equipment + muscles returns exercises
     * that actually match ALL your filters.
     */
    getExercises: async (filter: ExerciseFilter = {}): Promise<ExerciseListMeta> => {
      const params: Record<string, string> = {};
      if (filter.equipments?.length) {
        const mapped = filter.equipments.map((eq) =>
          eq.toLowerCase().trim() === 'treadmill' ? 'stepmill machine' : eq.trim()
        );
        params.equipments = mapped.join(',');
      }
      if (filter.bodyParts?.length) params.bodyParts = filter.bodyParts.join(',');
      if (filter.muscles?.length) {
        params.muscles = filter.muscles.join(',');
      } else if (filter.targetMuscles?.length) {
        params.targetMuscles = filter.targetMuscles.join(',');
      }
      if (filter.exerciseType?.length) params.exerciseType = filter.exerciseType.join(',');
      params.limit = String(filter.limit || 25);
      if (filter.after) params.after = filter.after;

      const res = await client.get('/exercises', { params });
      return res.data as ExerciseListMeta;
    },

    /** GET /exercises/{exerciseId} → full detail */
    getExerciseDetail: async (exerciseId: string): Promise<Exercise> => {
      const res = await client.get(`/exercises/${exerciseId}`);
      return res.data?.data as Exercise;
    },
  },
};