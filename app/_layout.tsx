import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "../src/styles/theme";
import { useAuthStore } from "../src/store/authStore";
import { api } from "../src/services/api";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
  });

  const { isDark, colors } = useAppTheme();
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    const initApp = async () => {
      await loadStoredAuth();
      
      // Obtener el token directamente después de hidratar
      const token = useAuthStore.getState().token;
      if (token) {
        try {
          // Intentar validar sesión real con el backend
          const res = await api.get('/auth/me');
          useAuthStore.getState().setUser(res.data);
        } catch (err) {
          console.warn('Sesión guardada no es válida o expiró. Purgando token...', err);
          // Si el servidor borró la sesión o el token no es válido, cerramos sesión local
          await useAuthStore.getState().logout();
        }
      }
      
      if (loaded || error) {
        SplashScreen.hideAsync();
      }
    };
    
    if (loaded || error) {
      initApp();
    }
  }, [loaded, error, loadStoredAuth]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
