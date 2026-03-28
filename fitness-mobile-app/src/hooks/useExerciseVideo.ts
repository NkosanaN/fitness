import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateExerciseVideo } from '@/utils/aiImage';

interface ExerciseVideoResult {
  videoUrl: string;
  isLoading: boolean;
  regenerate: () => void;
}

export const useExerciseVideo = (
  exercise: {
    id: string;
    name: string;
    target?: string;
    bodyPart?: string;
    equipment?: string;
    instructions?: string[];
  } | null
): ExerciseVideoResult => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exerciseVideo', exercise?.id],
    queryFn: async () => {
      if (!exercise) return null;
      return generateExerciseVideo(exercise);
    },
    enabled: !!exercise,
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (data?.videoUrl) {
      setCurrentVideoUrl(data.videoUrl);
    }
  }, [data]);

  return {
    videoUrl: currentVideoUrl,
    isLoading,
    regenerate: () => refetch(),
  };
};