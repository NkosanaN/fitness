# Fitness App

A modern React Native fitness application built with Expo, featuring exercise browsing by body part, target muscle, and equipment type.

## Features

- 🏋️ **Multi-Filter Navigation** - Filter exercises by:
  - Body Parts (11 options)
  - Target Muscles (19 options) 
  - Equipment Types (28 options)
  
- 🎯 **Exercise Database** - Access 1000+ exercises from ExerciseDB API
- 📱 **Modern UI** - Light theme with color-coded cards and smooth navigation
- 🔄 **Real-time API Integration** - Dynamic data fetching with error handling
- 📊 **Exercise Details** - Full instructions, difficulty levels, and muscle groups

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Navigation**: React Navigation (native-stack)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated
- **HTTP Client**: Axios
- **State Management**: React Context API
- **API**: ExerciseDB via RapidAPI

## Project Structure

```
fitness-app/
├── src/
│   ├── components/
│   │   ├── BodyPartSelector.js      # Color-coded body part cards
│   │   ├── ExerciseCard.js          # Exercise list item component
│   │   ├── FilterItemSelector.js    # Reusable filter item component
│   │   ├── TabButton.js             # Tab navigation component
│   │   └── Badge.js                 # Reusable badge component
│   ├── screens/
│   │   ├── HomeScreen.js            # Tabbed home with 3 filter options
│   │   ├── ExerciseListScreen.js    # Filtered exercise list
│   │   └── ExerciseDetailScreen.js  # Exercise details with instructions
│   ├── hooks/
│   │   ├── useBodyParts.js          # Fetch body parts from API
│   │   ├── useTargets.js            # Fetch target muscles from API
│   │   ├── useEquipment.js          # Fetch equipment types from API
│   │   └── useExercises.js          # Fetch exercises by filter type
│   ├── context/
│   │   └── AppContext.js            # Global app state management
│   ├── utils/
│   │   └── api.js                   # ExerciseDB API endpoints
│   └── constants/
│       └── bodyParts.js             # (Deprecated - now using API)
├── App.js                            # Root component & navigation setup
├── app.json                          # Expo app configuration
├── package.json                      # Dependencies
├── babel.config.js                   # Babel configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── .env.example                      # Environment variables template
└── README.md                         # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NkosanaN/fitness.git
   cd fitness/fitness-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your RapidAPI key:
   ```
   EXPO_PUBLIC_EXERCISEDB_API_KEY=your_api_key_here
   EXPO_PUBLIC_EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
   ```

4. **Get a free API key**
   - Visit [RapidAPI - ExerciseDB](https://rapidapi.com/api-sports/api/exercisedb)
   - Sign up for a free account
   - Copy your API key to `.env`

5. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

6. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

## API Endpoints

All endpoints from ExerciseDB:

```
GET /exercises/bodyPartList              # List all body parts
GET /exercises/targetList                # List all target muscles
GET /exercises/equipmentList             # List all equipment types
GET /exercises/bodyPart/{bodyPart}       # Exercises by body part
GET /exercises/target/{target}           # Exercises by target muscle
GET /exercises/equipment/{equipment}     # Exercises by equipment
GET /exercises/exercise/{id}             # Single exercise details
GET /image/{exerciseId}                  # Exercise image
```

## Components

### HomeScreen
Three-tab interface for filtering exercises:
- **Body Part Tab**: Select from 11 body parts
- **Target Tab**: Select from 19 target muscles
- **Equipment Tab**: Select from 28 equipment types

### ExerciseListScreen
Displays exercises filtered by selected option with:
- Exercise name and difficulty
- Equipment type
- Target muscle and secondary muscles
- Count of available exercises

### ExerciseDetailScreen
Shows complete exercise information:
- Full-size exercise image
- Detailed difficulty and category badges
- Primary target and body part
- Step-by-step instructions
- Secondary muscle groups

## Styling

Uses NativeWind v4.2.2 (Tailwind CSS for React Native) with:
- Light theme (white backgrounds, dark headers)
- Color-coded cards for visual hierarchy
- 3px borders around selector cards
- Responsive spacing and typography
- Modern color palette (blues, greens, reds, purples)

## State Management

**AppContext** manages:
- `filterType` - Current filter type (bodyPart, target, equipment)
- `selectedFilter` - Currently selected value
- `handleFilterSelect()` - Method to update filter and navigate

## Error Handling

All screens include:
- Loading spinners during API calls
- Error messages with retry suggestions
- Empty state messages
- Graceful fallbacks for missing data

## Future Enhancements

- [ ] Local exercise caching with AsyncStorage
- [ ] Favorites/bookmarks feature
- [ ] Workout history tracking
- [ ] User authentication & profiles
- [ ] Advanced filtering combinations
- [ ] Offline mode support
- [ ] Exercise video links
- [ ] Sets/reps tracking

## Troubleshooting

### API Key Issues
- Ensure `.env` file exists in `fitness-app/` directory
- Check API key is valid at RapidAPI dashboard
- Verify `EXPO_PUBLIC_` prefix (required for Expo)

### Port Already in Use
- The app will automatically switch to next available port (8086, 8087, etc.)
- Or: Kill existing process and restart

### Babel Errors
- Clear cache: `npx expo start -c`
- Reinstall node_modules: `rm -rf node_modules && npm install`

## License

MIT

## Author

Nkosana - [GitHub](https://github.com/NkosanaN)

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/NkosanaN/fitness/issues) page.
