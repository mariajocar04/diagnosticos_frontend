import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export const lightTheme = {
  primary: '#00694c',
  primaryContainer: '#008560',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#f5fff7',
  secondary: '#1960a6',
  secondaryContainer: '#7ab3ff',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#00447e',
  background: '#f5fbf5',
  onBackground: '#171d1a',
  surface: '#ffffff',
  surfaceContainer: '#eaefea',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff5ef',
  surfaceContainerHigh: '#e4eae4',
  surfaceContainerHighest: '#dee4de',
  onSurface: '#171d1a',
  onSurfaceVariant: '#3d4943',
  outline: '#6d7a73',
  outlineVariant: '#bccac1',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  // Custom semantic colors
  success: '#3b6d11',
  warning: '#ba7517',
};

export const darkTheme = {
  primary: '#68dbae',
  primaryContainer: '#00513a', // Approximated for dark mode contrast
  onPrimary: '#002115',
  onPrimaryContainer: '#86f8c9',
  secondary: '#a4c9ff',
  secondaryContainer: '#004883',
  onSecondary: '#001c39',
  onSecondaryContainer: '#d4e3ff',
  background: '#171d1a',
  onBackground: '#ecf2ed',
  surface: '#2c322e', // Inverse surface
  surfaceContainer: '#3d4943',
  surfaceContainerLowest: '#0f1512',
  surfaceContainerLow: '#171d1a',
  surfaceContainerHigh: '#282e2b',
  surfaceContainerHighest: '#333936',
  onSurface: '#ecf2ed',
  onSurfaceVariant: '#dee4de',
  outline: '#bccac1',
  outlineVariant: '#4d5852', // Darker for borders in dark mode
  error: '#ffb3ad',
  onError: '#410003',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  // Custom semantic colors
  success: '#86f8c9',
  warning: '#ffb3ad',
};

export const typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    monospace: 'JetBrainsMono_500Medium',
  },
};

export const layout = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  touchTarget: 48,
};

export const useAppTheme = () => {
  const scheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  
  const isDark = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  return {
    colors: isDark ? darkTheme : lightTheme,
    typography,
    layout,
    isDark,
  };
};
