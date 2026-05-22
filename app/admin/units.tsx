import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Building, Plus, ArrowLeft, X } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { unidadService } from '../../src/services/unidadService';
import { Unidad } from '../../src/types/base_type';

export default function UnitsManagementScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ codigo: '', nombre: '', tipo: '', capacidad: '', descripcion: '' });
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUnidades();
    }, [])
  );

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

  const handleCreateUnit = async () => {
    if (!newUnit.codigo || !newUnit.nombre || !newUnit.tipo || !newUnit.capacidad) {
      Alert.alert('Error', 'Por favor llena los campos obligatorios (Código, Nombre, Tipo, Capacidad)');
      return;
    }
    
    setIsSaving(true);
    try {
      await unidadService.createUnidad({
        codigo: newUnit.codigo.trim(),
        nombre: newUnit.nombre.trim(),
        tipo: newUnit.tipo.trim(),
        capacidad: parseInt(newUnit.capacidad),
        descripcion: newUnit.descripcion.trim()
      });
      setShowAddModal(false);
      setNewUnit({ codigo: '', nombre: '', tipo: '', capacidad: '', descripcion: '' });
      Alert.alert('Éxito', 'Unidad hospitalaria creada correctamente');
      loadUnidades();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'No se pudo crear la unidad';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
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

      {/* FAB para agregar unidad */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus color={colors.onPrimary} size={24} />
      </TouchableOpacity>

      {/* Modal para Crear Unidad */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Nueva Unidad Hospitalaria
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={colors.onSurfaceVariant} size={24} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <Input
                label="Código de la Unidad *"
                placeholder="Ej. UCI-01"
                value={newUnit.codigo}
                onChangeText={(t) => setNewUnit({...newUnit, codigo: t})}
                editable={!isSaving}
              />
              <Input
                label="Nombre de la Unidad *"
                placeholder="Ej. Cuidados Intensivos (UCI)"
                value={newUnit.nombre}
                onChangeText={(t) => setNewUnit({...newUnit, nombre: t})}
                editable={!isSaving}
              />
              <Input
                label="Tipo *"
                placeholder="Ej. Crítica, Intermedia, General"
                value={newUnit.tipo}
                onChangeText={(t) => setNewUnit({...newUnit, tipo: t})}
                editable={!isSaving}
              />
              <Input
                label="Capacidad (Número de camas) *"
                placeholder="Ej. 10"
                keyboardType="numeric"
                value={newUnit.capacidad}
                onChangeText={(t) => setNewUnit({...newUnit, capacidad: t.replace(/[^0-9]/g, '')})}
                editable={!isSaving}
              />
              <Input
                label="Descripción (Opcional)"
                placeholder="Detalles sobre el área..."
                value={newUnit.descripcion}
                onChangeText={(t) => setNewUnit({...newUnit, descripcion: t})}
                editable={!isSaving}
              />

              <Button
                title="Guardar Unidad"
                onPress={handleCreateUnit}
                isLoading={isSaving}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
  },
});
