import { storage } from './storage';

const CACHE_PREFIX = 'ai_exercise_image_';

interface GenerateImageResult {
  imageUrl: string;
  status: 'ready' | 'processing';
}

const generateExercisePrompt = (exercise: {
  name: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
  instructions?: string[];
}): string => {
  const parts = [
    exercise.name,
    exercise.target ? `exercises ${exercise.target} muscle` : '',
    exercise.bodyPart ? `focus on ${exercise.bodyPart}` : '',
    exercise.equipment ? `using ${exercise.equipment}` : 'bodyweight exercise',
    'fitness demonstration, clean background, professional photo',
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const generateExerciseImage = async (
  exercise: {
    id: string;
    name: string;
    target?: string;
    bodyPart?: string;
    equipment?: string;
    instructions?: string[];
  },
  forceRegenerate = false
): Promise<GenerateImageResult> => {
  const cacheKey = `${CACHE_PREFIX}${exercise.id}`;

  if (!forceRegenerate) {
    const cached = await storage.getCachedExercises(cacheKey);
    if (cached && cached[0]?.imageUrl) {
      return {
        imageUrl: cached[0].imageUrl,
        status: 'ready',
      };
    }
  }

  try {
    const prompt = encodeURIComponent(generateExercisePrompt(exercise));
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`;

    await storage.cacheExercises(cacheKey, [{ imageUrl }]);

    return {
      imageUrl,
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      imageUrl: '',
      status: 'processing',
    };
  }
};

export const generateFallbackImage = (exercise: {
  name: string;
  target?: string;
}): string => {
  const emojiMap: Record<string, string> = {
    biceps: '💪',
    chest: '🏋️',
    back: '🚴',
    legs: '🦵',
    abs: '🎯',
    shoulders: '🏋️',
    glutes: '🍑',
    cardio: '🏃',
    default: '💪',
  };

  const target = exercise.target?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (target.includes(key)) {
      return emoji;
    }
  }
  return emojiMap.default;
};
