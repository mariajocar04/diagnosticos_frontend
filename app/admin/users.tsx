import { useRouter } from 'expo-router';
import { ChevronLeft, Shield, Stethoscope, UserCog } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { adminService } from '../../src/services/adminService';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';

export default function AdminUsers() {
  const { colors, typography, layout } = useAppTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.roles?.some(r => r.nombre === 'administrador');

  const ROLE_IDS: Record<string, number> = {
    enfermero: 2,
    administrador: 1,
  };

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeUsers = (res: any) => {
    if (Array.isArray(res)) return res;
    return res?.datos || res?.data?.datos || res?.data || [];
  };

  const getUserRoleNames = (item: any) => {
    const roleNames = new Set<string>();

    const pushRole = (value: any) => {
      if (!value) return;
      const normalized = String(value).trim().toLowerCase();
      if (normalized) roleNames.add(normalized);
    };

    if (Array.isArray(item?.roles)) {
      item.roles.forEach((role: any) => {
        if (typeof role === 'string') {
          pushRole(role);
          return;
        }

        pushRole(role?.nombre);
        pushRole(role?.nombre_rol);
        pushRole(role?.rol);
        pushRole(role?.descripcion);
      });
    }

    pushRole(item?.rol);
    pushRole(item?.role);
    pushRole(item?.nombre_rol);
    pushRole(item?.rol_nombre);
    pushRole(item?.rolNombre);
    pushRole(item?.nombreRol);

    if (item?.rol_id === ROLE_IDS.administrador) pushRole('administrador');
    if (item?.rol_id === ROLE_IDS.enfermero) pushRole('enfermero');

    return Array.from(roleNames);
  };

  const getPrimaryRole = (item: any) => {
    const roleNames = getUserRoleNames(item);
    if (roleNames.some((role) => role.includes('administrador') || role === 'admin')) return 'administrador';
    if (roleNames.some((role) => role.includes('enfermero') || role.includes('nurse'))) return 'enfermero';
    return 'usuario';
  };

  const getRoleMeta = (roleName: string) => {
    if (roleName === 'administrador') {
      return {
        label: 'Administrador',
        targetLabel: 'Asignar Enfermero',
        targetRoleId: ROLE_IDS.enfermero,
        accent: colors.secondary,
        bg: colors.secondaryContainer,
        icon: Shield,
      };
    }

    return {
      label: roleName === 'enfermero' ? 'Enfermero' : 'Sin rol definido',
      targetLabel: 'Asignar Administrador',
      targetRoleId: ROLE_IDS.administrador,
      accent: colors.primary,
      bg: colors.primaryContainer,
      icon: Stethoscope,
    };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsuarios();
      setUsers(normalizeUsers(res));
    } catch (e) {
      console.warn('Error loading users', e);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const toggleEstado = (u: any) => {
    if (u.id === user?.id && u.activo) {
      Alert.alert('Acceso restringido', 'No puedes deshabilitar tu propia cuenta desde este panel.');
      return;
    }

    Alert.alert('Confirmar', `Cambiar estado de ${u.nombre_completo || u.usuario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        try {
          await adminService.updateUsuarioEstado(u.id, !u.activo);
          fetchUsers();
        } catch (e) {
          console.warn('Error updating estado', e);
          Alert.alert('Error', 'No se pudo actualizar el estado.');
        }
      } }
    ]);
  };

  const toggleRol = (u: any) => {
    if (u.id === user?.id) {
      Alert.alert('Acceso restringido', 'No puedes cambiar tu propio rol desde este panel.');
      return;
    }

    const currentRole = getPrimaryRole(u);
    const isAdminRole = currentRole === 'administrador';
    const nuevoRolNombre = isAdminRole ? 'enfermero' : 'administrador';
    const nuevoRolId = ROLE_IDS[nuevoRolNombre];

    if (!nuevoRolId) {
      Alert.alert('Error', 'No se pudo determinar el rol destino.');
      return;
    }

    Alert.alert('Confirmar', `Cambiar rol de ${u.nombre_completo || u.usuario} a ${nuevoRolNombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        try {
          await adminService.updateUsuarioRol(u.id, nuevoRolId);
          fetchUsers();
        } catch (e) {
          console.warn('Error updating rol', e);
          Alert.alert('Error', 'No se pudo actualizar el rol.');
        }
      } }
    ]);
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: layout.spacing.md, backgroundColor: colors.background }}>
        <Text style={{ color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }}>Acceso denegado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer }}
          >
            <ChevronLeft size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 20, color: colors.onSurface }}>Usuarios</Text>
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>
              Gestiona estado y rol real de cada cuenta
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => String(item.id ?? index)}
          contentContainerStyle={{ padding: layout.spacing.md }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, marginTop: 30, fontFamily: typography.fonts.regular }}>
              No hay usuarios para mostrar.
            </Text>
          }
          renderItem={({ item }) => (
            <InfoCard style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <UserCog size={22} color={colors.onSurfaceVariant} />
                </View>

                <View style={{ flex: 1, gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 15 }}>
                        {item.nombre_completo || item.usuario || 'Usuario'}
                      </Text>
                      <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                        {item.email || 'Sin correo'}
                      </Text>
                    </View>

                    <View style={{ backgroundColor: item.activo ? colors.primaryContainer : colors.errorContainer, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 11, color: item.activo ? colors.onPrimaryContainer : colors.onErrorContainer }}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {(() => {
                      const roleName = getPrimaryRole(item);
                      const meta = getRoleMeta(roleName);
                      const RoleIcon = meta.icon;
                      return (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: meta.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                          <RoleIcon size={14} color={meta.accent} />
                          <Text style={{ color: meta.accent, fontFamily: typography.fonts.bold, fontSize: 11 }}>
                            {meta.label}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                    <Pressable
                      disabled={item.id === user?.id}
                      onPress={() => toggleRol(item)}
                      style={({ pressed }) => [
                        styles.roleButton,
                        {
                          backgroundColor: getPrimaryRole(item) === 'administrador' ? colors.secondaryContainer : colors.primaryContainer,
                          borderColor: getPrimaryRole(item) === 'administrador' ? colors.secondary : colors.primary,
                          opacity: item.id === user?.id ? 0.45 : pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text style={{ color: getPrimaryRole(item) === 'administrador' ? colors.onSecondaryContainer : colors.onPrimaryContainer, fontFamily: typography.fonts.bold, fontSize: 12 }}>
                        {getPrimaryRole(item) === 'administrador' ? 'Bajar a Enfermero' : 'Promover a Administrador'}
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={item.id === user?.id && item.activo}
                      onPress={() => toggleEstado(item)}
                      style={({ pressed }) => [
                        styles.stateButton,
                        {
                          backgroundColor: item.activo ? colors.errorContainer : colors.primaryContainer,
                          borderColor: item.activo ? colors.error : colors.primary,
                          opacity: item.id === user?.id && item.activo ? 0.45 : pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text style={{ color: item.activo ? colors.onErrorContainer : colors.onPrimaryContainer, fontFamily: typography.fonts.bold, fontSize: 12 }}>
                        {item.id === user?.id && item.activo ? 'Cuenta actual' : item.activo ? 'Desactivar' : 'Activar'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </InfoCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
  },
  roleButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  stateButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
