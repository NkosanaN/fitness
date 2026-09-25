// Deep, premium "AI Fitness" palette (Sandow-style dark glass aesthetic)
export const colors = {
  // Brand
  primary: '#C9F23C', // Volt lime — Sandow's signature accent
  primaryDark: '#9CCB24',
  primaryLight: 'rgba(201, 242, 60, 0.14)',

  // Neutrals (dark)
  background: '#06080D',
  card: '#0E141C',
  cardElevated: '#141C26',
  secondary: '#1A2331',
  foreground: '#F4F7FA',
  muted: '#7A8699',
  mutedForeground: '#9AA6B8',
  border: '#1E2836',

  destructive: '#FF5A5F',

  // Glass / blur
  glass: 'rgba(255, 255, 255, 0.07)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassStrong: 'rgba(10, 14, 22, 0.72)',

  // Accent gradient endpoints (lime → cyan, lime → orange)
  gradient: {
    lime: '#C9F23C',
    cyan: '#2DE1FC',
    orange: '#FF7A3D',
    violet: '#9B5CFF',
  },

  // Brand fitness colors
  fitness: {
    red: '#FF5A5F',
    orange: '#FF7A3D',
    green: '#2EC4A0',
    blue: '#3DA5FF',
    purple: '#9B5CFF',
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const;