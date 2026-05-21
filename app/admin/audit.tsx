import { useRouter } from 'expo-router';
import { Activity, ArrowLeft, Clock3, FileClock, ShieldAlert } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { adminService } from '../../src/services/adminService';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';

export default function AdminAudit() {
  const { colors, typography, layout } = useAppTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.roles?.some(r => r.nombre === 'administrador');

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin]);

  const normalizeLogs = (res: any) => {
    if (Array.isArray(res)) return res;
    return res?.datos || res?.data?.datos || res?.data || [];
  };

  const totalLogs = useMemo(() => logs.length, [logs]);

  const formatAuditAction = (item: any) => {
    const action = String(item?.accion || item?.evento || '').toLowerCase();
    const resource = String(item?.recurso || '').toLowerCase();
    const details = String(item?.detalles || item?.detalle || '').toLowerCase();

    if (action.includes('actualizar') && action.includes('rol')) {
      if (details.includes('administrador')) return 'Rol cambiado a Administrador';
      if (details.includes('enfermero')) return 'Rol cambiado a Enfermero';
      return 'Cambio de rol';
    }

    if (action.includes('actualizar') && resource === 'usuario') {
      return 'Usuario actualizado';
    }

    if (action.includes('crear')) return 'Creación registrada';
    if (action.includes('eliminar')) return 'Eliminación registrada';
    if (action.includes('iniciar')) return 'Inicio de sesión';

    return item?.accion || item?.evento || 'Actividad registrada';
  };

  const formatAuditDetail = (item: any) => {
    const detail = item?.detalles || item?.detalle || '';
    if (detail) return detail;

    const resource = item?.recurso ? String(item.recurso).toLowerCase() : '';
    if (resource === 'usuario') return 'Se aplicó un cambio sobre el usuario.';
    if (resource === 'auditoria') return 'Se registró una acción administrativa.';

    return 'Sin detalle disponible.';
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditoria();
      const normalized = normalizeLogs(res);
      setLogs(normalized);
    } catch (e) {
      console.warn('Error loading audit', e);
      Alert.alert('Error', 'No se pudieron cargar los registros de auditoría.');
    } finally {
      setLoading(false);
    }
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
            <ArrowLeft size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 20, color: colors.onSurface }}>Auditoría</Text>
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>
              Registro de actividad del sistema y acciones administrativas
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => String(item.id ?? item.created_at ?? index)}
          contentContainerStyle={{ padding: layout.spacing.md, gap: 12 }}
          ListHeaderComponent={
            <InfoCard style={{ marginBottom: 4, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={22} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 15 }}>
                    {totalLogs} registros encontrados
                  </Text>
                  <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
                    Últimos movimientos del sistema
                  </Text>
                </View>
                <View style={{ backgroundColor: colors.surfaceContainer, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurfaceVariant, fontSize: 11 }}>
                    {totalLogs > 0 ? 'Activo' : 'Vacío'}
                  </Text>
                </View>
              </View>
            </InfoCard>
          }
          ListEmptyComponent={
            <InfoCard style={{ padding: 16 }}>
              <View style={{ alignItems: 'center', gap: 10 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={26} color={colors.onSurfaceVariant} />
                </View>
                <Text style={{ textAlign: 'center', color: colors.onSurface, fontFamily: typography.fonts.bold, fontSize: 15 }}>
                  No hay registros de auditoría disponibles
                </Text>
                <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular, fontSize: 12, lineHeight: 18 }}>
                  Cuando el backend registre acciones administrativas, aparecerán aquí con el detalle y la fecha correspondiente.
                </Text>
              </View>
            </InfoCard>
          }
          renderItem={({ item, index }) => {
            const fecha = item.creado_en || item.timestamp || item.created_at;
            const title = item.usuario_nombre || item.usuario || 'Sistema';
            const action = formatAuditAction(item);
            const detail = formatAuditDetail(item);
            const resource = String(item.recurso || item.resource || '').trim();
            const accent = index % 2 === 0 ? colors.primary : colors.secondary;
            const bg = index % 2 === 0 ? colors.primaryContainer : colors.secondaryContainer;
            return (
              <InfoCard style={{ padding: 14, borderLeftWidth: 4, borderLeftColor: accent }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                    <FileClock size={18} color={accent} />
                  </View>

                  <View style={{ flex: 1, gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 14, flex: 1 }}>
                        {title}
                      </Text>
                      {resource ? (
                        <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                          <Text style={{ color: accent, fontFamily: typography.fonts.bold, fontSize: 10 }}>
                            {resource}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={{ fontFamily: typography.fonts.medium, color: accent, fontSize: 13 }}>
                      {action}
                    </Text>

                    <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 12, lineHeight: 18 }}>
                      {detail}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock3 size={12} color={colors.onSurfaceVariant} />
                      <Text style={{ fontFamily: typography.fonts.monospace, color: colors.onSurfaceVariant, fontSize: 11 }}>
                        {fecha ? new Date(fecha).toLocaleString() : 'Sin fecha'}
                      </Text>
                    </View>
                  </View>
                </View>
              </InfoCard>
            );
          }}
        />
      )}
    </View>
  );
}
