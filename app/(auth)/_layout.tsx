import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/styles/theme';

export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.onSurface,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.surfaceContainerLowest }
    }}>
      <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      <Stack.Screen name="recovery" options={{ title: 'Recuperar acceso' }} />
    </Stack>
  );
}
