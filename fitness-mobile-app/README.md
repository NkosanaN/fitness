# Fitness Mobile App - Unified Expo Project

A modern mobile fitness application combining the beautiful UI from **artful-app-guide** with the powerful exercise database backend from **fitness-app**. Built with Expo, React Native, TypeScript, and integrated with Clerk for authentication.

## 🎯 Features

### Current Implementation
- ✅ Expo + React Native foundation with TypeScript
- ✅ Bottom tab navigation (Home, Workout, Activity, Profile)
- ✅ Clerk authentication setup (login/logout/session management)
- ✅ ExerciseDB API integration with axios
- ✅ Local storage with AsyncStorage (caching, favorites, workout history)
- ✅ React Query for data fetching & caching
- ✅ Context API for state management
- ✅ Design system with Tailwind CSS via NativeWind

### Coming in Phase 2-5
- 🚧 UI screens migrated from artful-app-guide
- 🚧 Exercise browsing and filtering
- 🚧 Progress tracking & activity stats
- 🚧 Workout history management
- 🚧 User profile management
- 🚧 Cross-platform testing (iOS, Android, Web)

## 📁 Project Structure

```
fitness-mobile-app/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── ActivityScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ExerciseDetailScreen.tsx
│   ├── components/         # Reusable UI components
│   ├── hooks/
│   │   └── useExercises.ts # Exercise API hooks with caching
│   ├── context/
│   │   └── AppContext.tsx  # Global state management
│   ├── utils/
│   │   ├── api.ts          # ExerciseDB API client
│   │   └── storage.ts      # AsyncStorage utilities
│   ├── constants/
│   │   └── colors.ts       # Design tokens
│   ├── types/              # TypeScript interfaces
│   ├── navigation/
│   │   └── RootNavigator.tsx # Navigation setup
│   └── App.tsx             # Root component with Clerk
├── app.json                # Expo configuration
├── package.json
├── tsconfig.json
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (with npm)
- Expo CLI: `npm install -g expo-cli`
- An iOS device/simulator or Android emulator (optional for native testing)

### Installation

1. **Clone & Install**
   ```bash
   cd fitness-mobile-app
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your API keys:
   ```
   # ExerciseDB API (from RapidAPI)
   EXPO_PUBLIC_EXERCISEDB_API_KEY=your_api_key_here
   EXPO_PUBLIC_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com

   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXX
   ```

3. **Get API Keys**
   - **ExerciseDB**: https://rapidapi.com/api-sports/api/exercisedb
   - **Clerk**: https://dashboard.clerk.com (already configured)

### Running the App

```bash
# Start development server (interactive menu)
npm start

# Then press:
# a - Android emulator
# i - iOS simulator (macOS only)
# w - Web browser
# s - Expo Go (scan QR with Expo app)
```

Or run specific platform:
```bash
npm run web      # Web browser
npm run android  # Android emulator
npm run ios      # iOS simulator (requires macOS)
```

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Expo + React Native | Cross-platform mobile development |
| **Language** | TypeScript | Type safety |
| **Styling** | NativeWind (Tailwind CSS) | Consistent design system |
| **Navigation** | React Navigation | Mobile-optimized routing |
| **State Management** | React Context API | Global app state |
| **Data Fetching** | Tanstack React Query | API calls with caching |
| **HTTP Client** | Axios | API requests |
| **Authentication** | Clerk | User management |
| **Local Storage** | AsyncStorage | Device-level caching |
| **Icons** | Lucide React Native | Icon library |

### Data Flow
```
User Input
    ↓
React Component
    ↓
Context/Hooks
    ↓
React Query (with AsyncStorage cache)
    ↓
Axios API Client
    ↓
ExerciseDB API / Clerk
    ↓
Display Data
```

## 🔧 Key Features

### 1. **Clerk Authentication**
Configured in `src/App.tsx`:
- Secure token storage with `expo-secure-store`
- Session management
- Extensible for user profile data

### 2. **Exercise API Integration**
Located in `src/utils/api.ts`:
- Body parts, target muscles, equipment fetching
- Exercise list & detail endpoints
- Error handling ready

### 3. **Smart Caching**
`src/utils/storage.ts`:
- 24-hour exercise cache with AsyncStorage
- Favorite exercises management
- Workout history tracking
- Offline support

### 4. **Type-Safe Hooks**
`src/hooks/useExercises.ts`:
- useBodyParts() - Fetch body parts
- useTargets() - Fetch target muscles
- useEquipment() - Fetch equipment types
- useExercisesByBodyPart(bodyPart) - Filter by body part
- useExercisesByTarget(target) - Filter by target
- useExercisesByEquipment(equipment) - Filter by equipment
- useExerciseDetail(id) - Get exercise details

### 5. **Global State Management**
`src/context/AppContext.tsx`:
- Filter type (bodyPart, target, equipment)
- Selected filter value
- Easy extensibility for more state

## 📱 Screen Breakdown

| Screen | Purpose | Status |
|--------|---------|--------|
| LoginScreen | Clerk authentication | Stub (Phase 2) |
| HomeScreen | Dashboard with progress & recommendations | Stub (Phase 2) |
| WorkoutScreen | Exercise filtering & browsing | Stub (Phase 2) |
| ActivityScreen | Fitness stats & history | Stub (Phase 2) |
| ProfileScreen | User profile & settings | Stub (Phase 2) |
| ExerciseDetailScreen | Exercise info & instructions | Stub (Phase 2) |

## 🔑 Environment Variables

Create `.env` in root directory:
```env
# ExerciseDB (RapidAPI)
EXPO_PUBLIC_EXERCISEDB_API_KEY=your_key
EXPO_PUBLIC_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Optional
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_ENV=development
```

All `EXPO_PUBLIC_` variables are safe to commit (client-side only).

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Watch mode
npm run test:watch
```

## 📦 Build & Deployment

### Local Build
```bash
# iOS (macOS only)
eas build --platform ios

# Android
eas build --platform android

# Both
eas build
```

### Using EAS (Expo Application Services)
```bash
# Requires EAS account (free tier available)
eas login
eas build --platform all
```

## 🐛 Troubleshooting

### API Key Issues
- Ensure `.env` exists in root directory
- Check API key is valid at RapidAPI dashboard
- Use `EXPO_PUBLIC_` prefix for all public variables

### Port Already in Use
- App automatically tries next available port (8080, 8081, etc.)
- Or: `npx expo start -p 3000`

### Cache Issues
- Clear Expo cache: `expo start -c`
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear AsyncStorage: Uninstall and reinstall app

### TypeScript Errors
- `npm run type-check` (when implemented)
- Ensure all imports use `@/` path alias

## 📚 Next Steps (Phases 2-5)

1. **Phase 2**: Migrate UI screens from artful-app-guide
2. **Phase 3**: Integrate exercise database fully
3. **Phase 4**: Add state management & persistence
4. **Phase 5**: Polish, test, & optimize

See `plan.md` in session folder for detailed implementation plan.

## 🤝 Contributing

- Follow TypeScript strict mode
- Use type-safe components
- Comment complex logic only
- Test on real devices before committing

## 📄 License

MIT

## 🙋 Support

For issues or questions, refer to:
- ExerciseDB API docs: https://rapidapi.com/api-sports/api/exercisedb
- Clerk docs: https://clerk.com/docs
- Expo docs: https://docs.expo.dev
- React Native docs: https://reactnative.dev

---

**Status**: Phase 1 Foundation Complete ✅  
**Next**: Phase 2 - UI Component Migration
