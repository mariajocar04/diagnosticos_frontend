import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../../src/styles/theme';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { InfoCard } from '../../../src/components/ui/InfoCard';
import { patientService } from '../../../src/services/patientService';
import { api } from '../../../src/services/api';
import { NandaCatalog, Patient } from '../../../src/types/base_type';
import { ChevronLeft, Search, Plus } from 'lucide-react-native';

export default function AssignDiagnosisScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [diagnoses, setDiagnoses] = useState<NandaCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Assignment confirmation modal states
  const [selectedDiag, setSelectedDiag] = useState<NandaCatalog | null>(null);
  const [outcome, setOutcome] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatient();
      fetchDiagnoses('');
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const data = await patientService.getPatientById(patientId);
      setPatient(data);
    } catch (e) {
      console.warn('Error al obtener paciente', e);
      Alert.alert('Error', 'No se pudo cargar la información del paciente.');
      router.back();
    }
  };

  const fetchDiagnoses = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/diagnosticos?q=${query}`);
      setDiagnoses(res.data.datos || []);
    } catch (e) {
      console.warn('Error al obtener catálogo NANDA', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDiagnoses(searchQuery);
  };

  const handleSelectDiagnosis = (diag: NandaCatalog) => {
    setSelectedDiag(diag);
    setOutcome('');
    setShowConfirmModal(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedDiag) return;

    setIsAssigning(true);
    try {
      await patientService.assignDiagnosis(patientId, {
        codigo_nanda: selectedDiag.codigo,
        resultado: outcome.trim() || undefined,
      });
      setShowConfirmModal(false);
      Alert.alert('Éxito', 'Diagnóstico asignado correctamente.');
      router.back();
    } catch (e: any) {
      console.warn('Error al asignar diagnóstico', e);
      const detail = e.response?.data?.detail || 'No se pudo asignar el diagnóstico. Intenta de nuevo.';
      Alert.alert('Error', detail);
    } finally {
      setIsAssigning(false);
    }
  };

  const renderItem = ({ item }: { item: NandaCatalog }) => (
    <InfoCard
      style={styles.card}
      onPress={() => handleSelectDiagnosis(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.diagName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={2}>
          {item.nombre}
        </Text>
        <View style={[styles.codeBadge, { backgroundColor: colors.primaryContainer + '20' }]}>
          <Text style={[styles.codeText, { color: colors.primary, fontFamily: typography.fonts.monospace }]}>
            {item.codigo}
          </Text>
        </View>
      </View>
      {item.sintomas && (
        <Text style={[styles.symptomsText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]} numberOfLines={2}>
          Síntomas: {item.sintomas}
        </Text>
      )}
    </InfoCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
          Asignar Diagnóstico NANDA
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Contexto Paciente */}
      {patient && (
        <View style={[styles.contextBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
          <Text style={[styles.contextText, { color: colors.onSurface, fontFamily: typography.fonts.medium }]}>
            Paciente: <Text style={{ fontFamily: typography.fonts.bold }}>{patient.nombre_completo}</Text>
          </Text>
        </View>
      )}

      {/* Buscador */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Input
              label=""
              placeholder="Buscar por código NANDA o descripción..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Search size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={diagnoses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
              {searchQuery.trim() === '' ? 'Busca un código o término en el catálogo.' : 'No se encontraron diagnósticos que coincidan.'}
            </Text>
          }
        />
      )}

      {/* Modal para Confirmar Asignación y agregar Resultado NOC */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowConfirmModal(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalHeaderTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
              Confirmar Asignación
            </Text>

            {selectedDiag && (
              <View style={[styles.selectedDiagCard, { backgroundColor: colors.surfaceContainer }]}>
                <View style={styles.selectedDiagHeader}>
                  <Text style={[styles.selectedDiagCode, { color: colors.primary, fontFamily: typography.fonts.monospace }]}>
                    NANDA {selectedDiag.codigo}
                  </Text>
                </View>
                <Text style={[styles.selectedDiagName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                  {selectedDiag.nombre}
                </Text>
              </View>
            )}

            <Input
              label="Resultado Esperado o Plan de Evolución (NOC) — Opcional"
              placeholder="Ej: Mantener saturación > 95%, mejorar patrón respiratorio..."
              value={outcome}
              onChangeText={setOutcome}
              multiline={true}
              numberOfLines={3}
              style={[styles.outcomeInput, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="outlined"
                style={styles.modalButton}
                onPress={() => setShowConfirmModal(false)}
                disabled={isAssigning}
              />
              <Button
                title="Asignar"
                style={styles.modalButton}
                onPress={handleConfirmAssignment}
                isLoading={isAssigning}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  contextBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  contextText: {
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  searchButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  diagName: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 12,
  },
  symptomsText: {
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalHeaderTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedDiagCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedDiagHeader: {
    marginBottom: 4,
  },
  selectedDiagCode: {
    fontSize: 13,
  },
  selectedDiagName: {
    fontSize: 15,
  },
  outcomeInput: {
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 0.48,
  },
});
