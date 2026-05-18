import React from 'react';
import { View, Text } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useAppTheme } from '../src/styles/theme';
import { Button } from '../src/components/ui/Button';

export default function OnboardingScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  
  const token = useAuthStore(state => state.token);
  const isGuest = useAuthStore(state => state.isGuest);
  const setGuestMode = useAuthStore(state => state.setGuestMode);

  // Redirección si ya hay sesión o modo invitado activo
  if (token || isGuest) {
    return <Redirect href="/(tabs)/search" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center', padding: layout.spacing.lg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 80, height: 80, backgroundColor: colors.primaryContainer + '1A', borderRadius: layout.radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: layout.spacing.md }}>
          <Text style={{ fontSize: 40 }}>🏥</Text>
        </View>
        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.primary, marginBottom: layout.spacing.sm }}>
          TICOS NurseDx
        </Text>
        <Text style={{ fontFamily: typography.fonts.regular, fontSize: 16, color: colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: layout.spacing.xl }}>
          Diagnósticos de enfermería al alcance de tu mano
        </Text>
      </View>

      <View style={{ width: '100%', gap: layout.spacing.md, paddingBottom: layout.spacing.xl }}>
        <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
        <Button title="Continuar como invitado" variant="outlined" onPress={() => {
          setGuestMode(true);
          router.replace('/(tabs)/search');
        }} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: layout.spacing.xs }}>
          <Text style={{ color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }}>¿No tienes cuenta? </Text>
          <Text onPress={() => router.push('/(auth)/register')} style={{ color: colors.primary, fontFamily: typography.fonts.bold }}>Registrarse</Text>
        </View>
      </View>
    </View>
  );
}
