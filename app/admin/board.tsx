import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { adminService } from '../../src/services/adminService';
import { UnidadBoardColumn, Remision } from '../../src/types/base_type';

export default function ActiveRemissionsBoardScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const [boardData, setBoardData] = useState<UnidadBoardColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRemissionsBoard();
      setBoardData(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el tablero de remisiones');
    } finally {
      setLoading(false);
    }
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
    const dateStr = remision.fecha_ingreso ? new Date(remision.fecha_ingreso).toLocaleDateString() : '';

    return (
      <TouchableOpacity 
        key={remision.id} 
        style={[styles.remissionCard, { backgroundColor: colors.surface, borderLeftColor: priorityColor }]}
        onPress={() => router.push(`/patient/${remision.paciente_id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.patientName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
            {remision.paciente?.nombre_completo || `Paciente #${remision.paciente_id}`}
          </Text>
        </View>
        
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
          <Text style={[styles.priorityText, { color: priorityColor, fontFamily: typography.fonts.bold }]}>
            {remision.prioridad}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Clock size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
            Ingreso: {dateStr}
          </Text>
        </View>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
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
