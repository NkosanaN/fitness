/**
 * Types matching the new ExerciseDB V2 / AscendAPI schema
 * (https://oss.exercisedb.dev — free OSS tier).
 *
 * The paid RapidAPI tier ("EDB with Videos and Images by AscendAPI")
 * returns the same shape plus `videoUrl` (mp4) and `imageUrls`.
 */

export interface Exercise {
  exerciseId: string;
  name: string;
  /** Animated demo (free OSS tier returns GIF) */
  gifUrl?: string;
  /** mp4 demo (paid tier) — preferred over gifUrl when present */
  videoUrl?: string;
  /** Static image (paid tier) */
  imageUrl?: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  overview?: string;
  exerciseTips?: string[];
  variations?: string[];
  keywords?: string[];
}

export interface ExerciseListMeta {
  success: boolean;
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
  data: Exercise[];
}

export interface NameListResponse {
  success: boolean;
  data: Array<{ name: string }>;
}

export type ExerciseFilter = {
  equipments?: string[];
  bodyParts?: string[];
  targetMuscles?: string[];
  muscles?: string[];
  exerciseType?: string[];
  limit?: number;
  after?: string;
};