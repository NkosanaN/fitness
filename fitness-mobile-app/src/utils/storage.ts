import AsyncStorage from '@react-native-async-storage/async-storage';

const EXERCISES_KEY = 'cached_exercises';
const FAVORITES_KEY = 'favorite_exercises';
const WORKOUTS_KEY = 'workout_history';

export const storage = {
  // Exercises caching
  async cacheExercises(key: string, data: any[]): Promise<void> {
    try {
      const cache = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`${EXERCISES_KEY}_${key}`, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching exercises:', error);
    }
  },

  async getCachedExercises(key: string): Promise<any[] | null> {
    try {
      const cache = await AsyncStorage.getItem(`${EXERCISES_KEY}_${key}`);
      if (!cache) return null;
      const parsed = JSON.parse(cache);
      // Cache valid for 24 hours
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        await AsyncStorage.removeItem(`${EXERCISES_KEY}_${key}`);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.error('Error retrieving cached exercises:', error);
      return null;
    }
  },

  // Favorites
  async addFavorite(exerciseId: string, exercise: any): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.find((f: any) => f.id === exerciseId)) {
        favorites.push({ id: exerciseId, ...exercise });
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  },

  async removeFavorite(exerciseId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((f: any) => f.id !== exerciseId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  async getFavorites(): Promise<any[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  // Workouts history
  async addWorkout(workout: any): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      workouts.push({ ...workout, createdAt: Date.now() });
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  },

  async getWorkouts(): Promise<any[]> {
    try {
      const workouts = await AsyncStorage.getItem(WORKOUTS_KEY);
      return workouts ? JSON.parse(workouts) : [];
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  },

  async clearWorkouts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WORKOUTS_KEY);
    } catch (error) {
      console.error('Error clearing workouts:', error);
    }
  },
};
