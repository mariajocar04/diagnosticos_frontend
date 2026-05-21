import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useAppTheme } from '../../src/styles/theme';
import { UserProfile } from '../../src/types/base_type';
import { Button } from '../../src/components/ui/Button';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { User, LogOut, Moon, Sun, Smartphone, Shield, Stethoscope } from 'lucide-react-native';

export default function ProfileTab() {
  const { colors, typography, layout } = useAppTheme();
  const { logout, isGuest } = useAuthStore();
  const router = useRouter();
  
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      fetchProfile();
    }
  }, [isGuest]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await authService.getMe();
      setProfile(data);
    } catch (e) {
      console.warn('Error fetching profile', e);
      Alert.alert('Error', 'No se pudo cargar la información del perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
            } catch (e) {
              console.warn("Logout error from server", e);
            } finally {
              await logout();
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  const renderThemeButton = (mode: 'light' | 'dark' | 'system', Icon: any, label: string) => {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setThemeMode(mode)}
        style={[
          styles.themeButton,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: isSelected ? colors.primary : colors.outlineVariant,
          }
        ]}
      >
        <Icon size={20} color={isSelected ? '#ffffff' : colors.onSurface} style={{ marginBottom: 6 }} />
        <Text style={{ 
          fontFamily: isSelected ? typography.fonts.bold : typography.fonts.medium, 
          fontSize: 12, 
          color: isSelected ? '#ffffff' : colors.onSurface 
        }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: layout.spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.surface, padding: layout.spacing.xl, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', width: '100%' }}>
          <User size={48} color={colors.onSurfaceVariant} style={{ marginBottom: layout.spacing.md }} />
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 18, color: colors.onSurface, marginBottom: layout.spacing.sm, textAlign: 'center' }}>
            Perfil de Invitado
          </Text>
          <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: layout.spacing.lg, lineHeight: 20 }}>
            Inicia sesión con tu cuenta de enfermero para ver tu perfil, cambiar configuraciones y acceder a más funcionalidades.
          </Text>
          <Button 
            title="Iniciar sesión" 
            variant="primary" 
            style={{ width: '100%' }}
            onPress={() => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/');
            }}
          />
        </View>
      </View>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').filter(n => n.length > 0).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  };

  const is_admin = profile?.roles?.some(r => r.nombre === 'administrador');

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 22, color: colors.onSurface }}>
          Mi Perfil
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: layout.spacing.md }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : profile ? (
          <>
            <View style={{ alignItems: 'center', marginVertical: layout.spacing.xl }}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                <Text style={{ color: colors.primary, fontSize: 32, fontFamily: typography.fonts.bold }}>
                  {getInitials(profile.nombre_completo || profile.usuario)}
                </Text>
              </View>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 20, color: colors.onSurface, marginTop: layout.spacing.md }}>
                {profile.nombre_completo || profile.usuario}
              </Text>
              <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant }}>
                {profile.email}
              </Text>

              <View style={[styles.roleBadge, { backgroundColor: is_admin ? colors.secondary : colors.primary }]}>
                {is_admin ? <Shield size={14} color="#ffffff" /> : <Stethoscope size={14} color="#ffffff" />}
                <Text style={{ color: '#ffffff', fontSize: 12, fontFamily: typography.fonts.bold, marginLeft: 4 }}>
                  {is_admin ? 'Administrador' : 'Enfermero'}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurfaceVariant, marginBottom: layout.spacing.sm, marginTop: layout.spacing.lg }}>
              Apariencia
            </Text>
            <View style={styles.themeSelectorContainer}>
              {renderThemeButton('light', Sun, 'Claro')}
              {renderThemeButton('dark', Moon, 'Oscuro')}
              {renderThemeButton('system', Smartphone, 'Sistema')}
            </View>

            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurfaceVariant, marginBottom: layout.spacing.sm, marginTop: layout.spacing.xl }}>
              Cuenta
            </Text>
            <InfoCard style={{ padding: 0, overflow: 'hidden' }}>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={[styles.accountOption, { borderBottomColor: colors.outlineVariant }]}
                onPress={handleLogout}
              >
                <LogOut size={20} color={colors.error} style={{ marginRight: layout.spacing.md }} />
                <Text style={{ fontFamily: typography.fonts.medium, fontSize: 16, color: colors.error }}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </InfoCard>

            <View style={{ alignItems: 'center', marginTop: layout.spacing.xxl, paddingBottom: 40 }}>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.primary }}>
                TICOS NurseDx
              </Text>
              <Text style={{ fontFamily: typography.fonts.regular, fontSize: 12, color: colors.onSurfaceVariant }}>
                Versión 1.0.0 (MVP)
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }}>
            No se pudo cargar la información del perfil.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  themeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  }
});
