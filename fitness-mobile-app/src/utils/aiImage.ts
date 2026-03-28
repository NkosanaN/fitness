import { storage } from './storage';

const CACHE_PREFIX = 'ai_exercise_image_';
const VIDEO_CACHE_PREFIX = 'ai_exercise_video_';

interface GenerateImageResult {
  imageUrl: string;
  status: 'ready' | 'processing';
}

interface GenerateVideoResult {
  videoUrl: string;
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

const generateVideoPrompt = (exercise: {
  name: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
  instructions?: string[];
}): string => {
  const instructions = exercise.instructions?.slice(0, 2).join(' ') || '';
  const parts = [
    `Person demonstrating ${exercise.name}`,
    exercise.target ? `targeting ${exercise.target} muscles` : '',
    exercise.bodyPart ? `working ${exercise.bodyPart}` : '',
    exercise.equipment ? `using ${exercise.equipment}` : 'bodyweight',
    instructions ? `instructions: ${instructions}` : '',
    'smooth slow motion fitness video, clean background',
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

export const generateExerciseVideo = async (
  exercise: {
    id: string;
    name: string;
    target?: string;
    bodyPart?: string;
    equipment?: string;
    instructions?: string[];
  },
  forceRegenerate = false
): Promise<GenerateVideoResult> => {
  const cacheKey = `${VIDEO_CACHE_PREFIX}${exercise.id}`;

  if (!forceRegenerate) {
    const cached = await storage.getCachedExercises(cacheKey);
    if (cached && cached[0]?.videoUrl) {
      return {
        videoUrl: cached[0].videoUrl,
        status: 'ready',
      };
    }
  }

  try {
    const prompt = encodeURIComponent(generateVideoPrompt(exercise));
    const videoUrl = `https://video.pollinations.ai/${prompt}?width=576&height=1024&nologo=true&seed=42`;

    await storage.cacheExercises(cacheKey, [{ videoUrl }]);

    return {
      videoUrl,
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating video:', error);
    return {
      videoUrl: '',
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
