import { useRouter } from 'expo-router';
import { Activity, FileText, ShieldAlert, UserCheck, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { adminService } from '../../src/services/adminService';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';

export default function AdminTab() {
  const { colors, typography, layout } = useAppTheme();
  const { user } = useAuthStore();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');
  const router = useRouter();

  useEffect(() => {
    if (is_admin) {
      fetchMetrics();
    }
  }, [is_admin]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getMetrics();
      setMetrics(data);
    } catch (e) {
      console.warn('Error fetching metrics', e);
      Alert.alert('Error', 'No se pudieron cargar las métricas.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!is_admin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: layout.spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.surface, padding: layout.spacing.xl, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', width: '100%' }}>
          <ShieldAlert size={48} color={colors.error} style={{ marginBottom: layout.spacing.md }} />
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 18, color: colors.onSurface, marginBottom: layout.spacing.sm, textAlign: 'center' }}>
            Acceso Denegado
          </Text>
          <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 }}>
            Solo los administradores pueden acceder a este panel.
          </Text>
        </View>
      </View>
    );
  }

  const renderMetricCard = (title: string, value: string | number, Icon: any, color: string) => (
    <InfoCard style={[styles.metricCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={{ fontFamily: typography.fonts.medium, fontSize: 13, color: colors.onSurfaceVariant, marginLeft: 8 }}>
          {title}
        </Text>
      </View>
      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 28, color: colors.onSurface }}>
        {value}
      </Text>
    </InfoCard>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 22, color: colors.onSurface }}>
          Panel de Administración
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: layout.spacing.md }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : metrics ? (
          <>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurfaceVariant, marginBottom: layout.spacing.sm }}>
              Métricas Generales
            </Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricsRow}>
                {renderMetricCard('Pacientes Totales', metrics.pacientes_totales || 0, Users, colors.primary)}
                {renderMetricCard('Diagnósticos (7d)', metrics.diagnosticos_recientes || 0, Activity, colors.secondary)}
              </View>
              <View style={styles.metricsRow}>
                {renderMetricCard('Usuarios Activos', metrics.usuarios_activos || 0, UserCheck, '#ba7517')}
                {renderMetricCard('PDFs Generados', metrics.pdfs_generados || 0, FileText, colors.outline)}
              </View>
            </View>

            {/* Acciones de administración */}
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurfaceVariant, marginBottom: layout.spacing.sm, marginTop: layout.spacing.lg }}>
              Gestión
            </Text>
            <InfoCard style={{ padding: 0, overflow: 'hidden' }}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/admin/users')} style={[styles.actionRow, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
                <Users size={20} color={colors.primary} style={{ marginRight: layout.spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, fontSize: 15, color: colors.onSurface }}>Gestionar Usuarios</Text>
                  <Text style={{ fontFamily: typography.fonts.regular, fontSize: 12, color: colors.onSurfaceVariant }}>Activar, desactivar o cambiar roles</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/admin/audit')} style={[styles.actionRow, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
                <Activity size={20} color={colors.secondary} style={{ marginRight: layout.spacing.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, fontSize: 15, color: colors.onSurface }}>Auditoría de Sistema</Text>
                  <Text style={{ fontFamily: typography.fonts.regular, fontSize: 12, color: colors.onSurfaceVariant }}>Ver logs de actividad de usuarios</Text>
                </View>
              </TouchableOpacity>
            </InfoCard>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }}>
            No se pudieron cargar las métricas.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsGrid: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  }
});
