# Copilot Instructions for Fitness Mobile App

## Running the App

```bash
# Start dev server (interactive menu)
npm start

# Or run specific platform directly
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser
```

The app will prompt with options to run on different platforms. Press `a` for Android, `i` for iOS, `w` for web, or `s` to open in Expo Go.

## Build & Test Commands

No tests currently implemented. When tests are added:
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
npm run type-check # TypeScript validation (if added)
```

## Architecture Overview

### Tech Stack
- **Framework**: Expo + React Native (cross-platform mobile)
- **Language**: TypeScript with strict mode
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation (bottom tabs + native stack)
- **State Management**: Context API (AppContext for filters + screen state)
- **Data Fetching**: TanStack React Query (with AsyncStorage caching)
- **Authentication**: Clerk (with secure token storage via expo-secure-store)
- **HTTP**: Axios (for ExerciseDB API)

### Project Structure
```
src/
├── App.tsx               # Root layout: Clerk, QueryClient, Navigation setup
├── screens/             # Page-level components (HomeScreen, WorkoutScreen, etc)
│   └── auth/LoginScreen.tsx
├── components/          # Reusable UI components (buttons, cards, headers)
├── navigation/          # Navigation configuration (RootNavigator sets up tabs)
├── context/             # AppContext.tsx - filter state management
├── hooks/               # useExercises.ts - all data fetching hooks with caching
├── utils/
│   ├── api.ts          # Axios client for ExerciseDB API
│   └── storage.ts      # AsyncStorage wrapper for caching & favorites
├── types/              # TypeScript interfaces
└── constants/          # Design tokens (colors, etc)
```

### Data Flow Pattern
```
Component → useExercises hook → TanStack Query
                                      ↓
                          Check AsyncStorage cache
                                      ↓
                        (Cache miss) → Axios API call
                                      ↓
                            Cache result in AsyncStorage
```

## Key Conventions

### Path Aliases
Always use `@/` for imports from src (configured in tsconfig.json):
```typescript
import { useAppContext } from '@/context/AppContext';
import { api } from '@/utils/api';
```

### API Integration Pattern
Add new API endpoints in `src/utils/api.ts` following the existing nested structure:
```typescript
export const api = {
  exercises: {
    getBodyParts: () => exerciseApi.get('/exercises/bodyPartList'),
    // ... more endpoints
  },
};
```

### Custom Hooks Pattern
Create new data-fetching hooks in `src/hooks/useExercises.ts`. Each hook:
1. Uses TanStack Query's `useQuery` with appropriate queryKey
2. Checks AsyncStorage cache first
3. Falls back to API call if cache miss
4. Caches the result

Example pattern (already in place):
```typescript
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
```

### State Management
- **Local component state**: Use `useState` for UI-only state
- **App-wide filter state**: Use `AppContext` (imported via `useAppContext()`)
- **Server state**: Use React Query hooks from `useExercises`

### Navigation Structure
Bottom tab navigator with 5 screens:
- Home, Workout, Activity, Profile (all stub screens with navigation wired)
- ExerciseDetailScreen reachable via stack navigator from Workout tab

To navigate: Use `useNavigation()` from React Navigation. Navigation props include `navigate()`, `push()`, `goBack()`.

### Environment Variables
All variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app:
```
EXPO_PUBLIC_EXERCISEDB_API_KEY=...
EXPO_PUBLIC_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

Copy `.env.example` to `.env` to get started. Missing Clerk key will throw an error at app startup.

### Styling
NativeWind syntax (Tailwind for React Native):
```typescript
import { View, Text } from 'react-native';

export const MyComponent = () => (
  <View className="flex-1 bg-white justify-center items-center">
    <Text className="text-lg font-bold text-blue-600">Hello</Text>
  </View>
);
```

Supported Tailwind utilities work directly. Use `className` instead of `style`.

### TypeScript Patterns
- Enable strict mode (already configured)
- Type hooks properly: `useQuery<DataType>()` 
- Define screen props with React Navigation types
- Use type guards before accessing optional properties

## Cache Management

AsyncStorage caching is built into hooks and lasts 24 hours. To clear:
```typescript
import { storage } from '@/utils/storage';
await storage.clearCache(); // Clears all
```

This is useful for development/testing when API data changes.

## Common Development Tasks

### Adding a New Screen
1. Create component in `src/screens/YourScreen.tsx`
2. Wire up in `src/navigation/RootNavigator.tsx`
3. Add any tab/stack navigation configuration

### Adding a New API Endpoint
1. Add to `src/utils/api.ts` in the appropriate nested object
2. Create a corresponding hook in `src/hooks/useExercises.ts` 
3. Component imports hook and uses query data

### Fetching Data in a Component
```typescript
import { useBodyParts } from '@/hooks/useExercises';

export const MyScreen = () => {
  const { data, isLoading, error } = useBodyParts();
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return <FlatList data={data} renderItem={...} />;
};
```

## Troubleshooting

- **Clerk key missing**: Check `.env` has `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **API requests failing**: Verify ExerciseDB key in `.env` and RapidAPI subscription is active
- **Port conflicts**: Expo auto-retries on next port (8080, 8081, etc), or use `npx expo start -p 3000`
- **Cache stale data**: Run `storage.clearCache()` from console or restart with `npm start -c`
