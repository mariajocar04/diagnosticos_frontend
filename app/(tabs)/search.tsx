import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { useRouter } from 'expo-router';

export default function SearchDemoScreen() {
  const { colors, typography, layout } = useAppTheme();
  const { user, isGuest, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, padding: layout.spacing.lg, backgroundColor: colors.background, justifyContent: 'center' }}>
      
      {isGuest ? (
        <View style={{ backgroundColor: colors.surfaceContainer, padding: layout.spacing.lg, borderRadius: layout.radius.md, alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: layout.spacing.sm }}>👋</Text>
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onSurface }}>Modo Invitado</Text>
          <Text style={{ textAlign: 'center', marginTop: layout.spacing.md, color: colors.onSurfaceVariant, lineHeight: 22 }}>
            Estás explorando el catálogo NANDA de forma anónima. 
            No podrás asignar diagnósticos, exportar PDFs ni guardar favoritos sin iniciar sesión.
          </Text>
        </View>
      ) : (
        <View style={{ backgroundColor: colors.surface, padding: layout.spacing.lg, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant }}>
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onSurface, marginBottom: layout.spacing.xs }}>
            Hola, {(user?.nombre_completo || user?.usuario || '').split(' ')[0]}
          </Text>
          
          {user?.roles?.some(r => r.nombre === 'administrador') ? (
             <Badge label="Administrador" variant="administrador" style={{ marginBottom: layout.spacing.lg }} />
          ) : (
             <Badge label="Enfermero" variant="enfermero" style={{ marginBottom: layout.spacing.lg }} />
          )}

          {user?.roles?.some(r => r.nombre === 'administrador') && (
            <View style={{ backgroundColor: colors.secondaryContainer, padding: layout.spacing.md, borderRadius: layout.radius.sm, marginBottom: layout.spacing.lg }}>
              <Text style={{ color: colors.onSecondaryContainer, fontFamily: typography.fonts.semiBold }}>
                🛡️ Panel de Administración Activo
              </Text>
              <Text style={{ color: colors.onSecondaryContainer, marginTop: 4, fontSize: 13, lineHeight: 20 }}>
                Tienes acceso total y sin restricciones a la gestión de usuarios, las gráficas de métricas y los logs de auditoría en tu menú inferior exclusivo.
              </Text>
            </View>
          )}

          {!user?.roles?.some(r => r.nombre === 'administrador') && (
            <View style={{ backgroundColor: colors.surfaceContainer, padding: layout.spacing.md, borderRadius: layout.radius.sm, marginBottom: layout.spacing.lg }}>
              <Text style={{ color: colors.onSurface, fontFamily: typography.fonts.semiBold }}>
                🩺 Área Clínica Activa
              </Text>
              <Text style={{ color: colors.onSurfaceVariant, marginTop: 4, fontSize: 13, lineHeight: 20 }}>
                Tienes acceso al catálogo NANDA protegido, creación de historias clínicas de pacientes y redacción de notas de enfermería seguras.
              </Text>
            </View>
          )}
        </View>
      )}

      <Button 
        title={isGuest ? "Salir del modo invitado" : "Cerrar sesión"} 
        variant="outlined" 
        onPress={handleLogout} 
        style={{ marginTop: layout.spacing.xl }}
      />
    </View>
  );
}
