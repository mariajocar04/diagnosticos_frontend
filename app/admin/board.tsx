import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { adminService } from '../../src/services/adminService';
import { remissionService } from '../../src/services/remissionService';
import { UnidadBoardColumn, Remision } from '../../src/types/base_type';

export default function ActiveRemissionsBoardScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const [boardData, setBoardData] = useState<UnidadBoardColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadBoard();
    }, [])
  );

  const loadBoard = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRemissionsBoard();
      setBoardData(data);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || error.message || 'No se pudo cargar el tablero de remisiones';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRemission = async (id: number) => {
    setLoading(true);
    try {
      await remissionService.changeState(id, 'ACTIVA');
      Alert.alert('Éxito', 'Remisión activada e ingreso registrado correctamente.');
      await loadBoard();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || error.message || 'No se pudo activar la remisión';
      Alert.alert('Error', msg);
      setLoading(false);
    }
  };

  const handleDischargeRemission = async (id: number) => {
    Alert.alert(
      'Confirmar Egreso',
      '¿Está seguro de que desea egresar a este paciente de la unidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Egreso',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await remissionService.changeState(id, 'EGRESADO');
              Alert.alert('Éxito', 'Paciente egresado correctamente.');
              await loadBoard();
            } catch (error: any) {
              console.error(error);
              const msg = error.response?.data?.detail || error.message || 'No se pudo egresar al paciente';
              Alert.alert('Error', msg);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA': return colors.error; // Coral/Red
      case 'MEDIA': return colors.warning; // Amber
      case 'BAJA': return colors.success; // Green
      default: return colors.outline;
    }
  };

  const renderCard = (remision: Remision) => {
    const priorityColor = getPriorityColor(remision.prioridad);
    const isPending = remision.estado === 'PENDIENTE';
    const isActive = remision.estado === 'ACTIVA';
    
    // Si está pendiente, usar fecha_remision. Si está activa, usar fecha_ingreso.
    const displayDate = isActive ? remision.fecha_ingreso : remision.fecha_remision;
    const dateStr = displayDate ? new Date(displayDate).toLocaleDateString() : '';

    return (
      <View 
        key={remision.id} 
        style={[styles.remissionCard, { backgroundColor: colors.surface, borderLeftColor: priorityColor }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.patientName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
            {remision.paciente?.nombre_completo || `Paciente #${remision.paciente_id}`}
          </Text>
        </View>
        
        <View style={styles.badgesRow}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColor, fontFamily: typography.fonts.bold }]}>
              {remision.prioridad}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: isPending ? colors.warning + '20' : colors.primary + '20' }]}>
            <Text style={[styles.statusText, { color: isPending ? colors.warning : colors.primary, fontFamily: typography.fonts.bold }]}>
              {remision.estado}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Clock size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
            {isPending ? 'Solicitado: ' : 'Ingreso: '}{dateStr}
          </Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHigh }]} 
            onPress={() => router.push(`/patient/${remision.paciente_id}`)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, { color: colors.onSurface, fontFamily: typography.fonts.medium }]}>
              Ver Ficha
            </Text>
          </TouchableOpacity>

          {isPending && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
              onPress={() => handleActivateRemission(remision.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: colors.onPrimary, fontFamily: typography.fonts.bold }]}>
                Activar
              </Text>
            </TouchableOpacity>
          )}

          {isActive && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.error }]} 
              onPress={() => handleDischargeRemission(remision.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionBtnText, { color: colors.onError, fontFamily: typography.fonts.bold }]}>
                Egresar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderColumn = (column: UnidadBoardColumn) => {
    return (
      <View key={column.unidad.id} style={[styles.column, { backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={[styles.columnHeader, { borderBottomColor: colors.outlineVariant }]}>
          <Text style={[styles.columnTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
            {column.unidad.nombre}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.countText, { color: colors.onPrimary, fontFamily: typography.fonts.medium }]}>
              {column.remisiones_activas.length}
            </Text>
          </View>
        </View>
        <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
          {column.remisiones_activas.length > 0 ? (
            column.remisiones_activas.map(renderCard)
          ) : (
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
              No hay pacientes
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerTitle: 'Tablero de Remisiones',
          headerTitleStyle: { fontFamily: typography.fonts.bold },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <ArrowLeft color={colors.onSurface} size={24} />
            </TouchableOpacity>
          )
        }} 
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardContainer}>
          {boardData.map(renderColumn)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    padding: 16,
    gap: 16,
  },
  column: {
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  columnTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
  },
  columnScroll: {
    padding: 12,
  },
  remissionCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardHeader: {
    marginBottom: 8,
  },
  patientName: {
    fontSize: 14,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  }
});
