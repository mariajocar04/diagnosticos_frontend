import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Building, Plus, ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { unidadService } from '../../src/services/unidadService';
import { Unidad } from '../../src/types/base_type';

export default function UnitsManagementScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const response = await unidadService.getUnidades();
      setUnidades(response.datos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las unidades hospitalarias');
    } finally {
      setLoading(false);
    }
  };

  const renderUnitCard = ({ item }: { item: Unidad }) => {
    const occupancyPercent = item.capacidad > 0 
      ? Math.min(100, Math.round(((item.pacientes_activos || 0) / item.capacidad) * 100))
      : 0;
    
    let occupancyColor = colors.success;
    if (occupancyPercent >= 90) occupancyColor = colors.error;
    else if (occupancyPercent >= 75) occupancyColor = colors.warning;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Building size={20} color={colors.primary} />
            <Text style={[styles.unitName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
              {item.nombre}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.surfaceContainerHigh }]}>
            <Text style={[styles.badgeText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.medium }]}>
              {item.tipo}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
          {item.descripcion || 'Sin descripción'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
              Capacidad
            </Text>
            <Text style={[styles.statValue, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
              {item.capacidad}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
              Pacientes Activos
            </Text>
            <Text style={[styles.statValue, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
              {item.pacientes_activos || 0}
            </Text>
          </View>
        </View>

        <View style={styles.occupancyBarContainer}>
          <View style={[styles.occupancyBarBg, { backgroundColor: colors.surfaceContainerHighest }]}>
            <View style={[styles.occupancyBarFill, { width: `${occupancyPercent}%`, backgroundColor: occupancyColor }]} />
          </View>
          <Text style={[styles.occupancyText, { color: occupancyColor, fontFamily: typography.fonts.medium }]}>
            {occupancyPercent}% Ocupación
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerTitle: 'Gestión de Unidades',
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
        <FlatList
          data={unidades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUnitCard}
          contentContainerStyle={{ padding: layout.spacing.md, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: typography.fonts.medium, color: colors.onSurfaceVariant }}>
              No hay unidades registradas
            </Text>
          }
        />
      )}

      {/* FAB para agregar unidad - Podría abrir un modal o ir a otra pantalla */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('Aviso', 'Formulario para crear unidad en construcción')}
      >
        <Plus color={colors.onPrimary} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
  },
  occupancyBarContainer: {
    marginTop: 8,
  },
  occupancyBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  occupancyText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
