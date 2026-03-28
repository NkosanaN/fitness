import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateExerciseImage, generateFallbackImage } from '@/utils/aiImage';

interface ExerciseImageResult {
  imageUrl: string;
  isLoading: boolean;
  isUsingFallback: boolean;
  regenerate: () => void;
}

export const useExerciseImage = (
  exercise: {
    id: string;
    name: string;
    target?: string;
    bodyPart?: string;
    equipment?: string;
    instructions?: string[];
  } | null
): ExerciseImageResult => {
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exerciseImage', exercise?.id],
    queryFn: async () => {
      if (!exercise) return null;
      return generateExerciseImage(exercise);
    },
    enabled: !!exercise,
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (exercise) {
      const fallback = generateFallbackImage(exercise);
      setCurrentImageUrl(fallback);
    }
  }, [exercise]);

  useEffect(() => {
    if (data?.imageUrl) {
      setCurrentImageUrl(data.imageUrl);
      setIsUsingFallback(false);
    } else if (data?.status === 'processing') {
      setIsUsingFallback(true);
    }
  }, [data]);

  return {
    imageUrl: currentImageUrl,
    isLoading,
    isUsingFallback,
    regenerate: () => refetch(),
  };
};
