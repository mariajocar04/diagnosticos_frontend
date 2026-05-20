import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { NandaCatalog, Patient } from '../../src/types/base_type';
import { useAppTheme } from '../../src/styles/theme';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/authStore';
import { useSearchStore } from '../../src/store/searchStore';
import { patientService } from '../../src/services/patientService';
import { Search } from 'lucide-react-native';

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, typography, layout } = useAppTheme();
  const { isGuest } = useAuthStore();
  const router = useRouter();
  
  const [diagnosis, setDiagnosis] = useState<NandaCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const favorites = useSearchStore(state => state.favorites);
  const toggleFavoriteLocal = useSearchStore(state => state.toggleFavoriteLocal);
  const setFavorites = useSearchStore(state => state.setFavorites);

  // Estados para la asignación de pacientes
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [outcome, setOutcome] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchDetail();
    if (!isGuest) {
      fetchFavorites();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/diagnosticos/${id}`);
      setDiagnosis(res.data);
    } catch (e) {
      console.warn('Error fetching detail', e);
      Alert.alert('Error', 'No se pudo cargar el diagnóstico');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/diagnosticos/favoritos');
      const favoriteCodes = res.data.datos.map((d: any) => d.codigo);
      setFavorites(favoriteCodes);
    } catch (e) {
      console.warn("Fallo al obtener favoritos de la API", e);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isGuest) {
      Alert.alert(
        'Inicia sesión', 
        'Debes iniciar sesión para poder guardar diagnósticos en tus favoritos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir al Login', onPress: () => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/');
          }}
        ]
      );
      return;
    }

    if (!diagnosis) return;

    setIsTogglingFav(true);
    try {
      await api.post(`/diagnosticos/${diagnosis.codigo}/favorito`);
      toggleFavoriteLocal(diagnosis.codigo);
    } catch (e) {
      console.warn("Fallo al guardar/quitar favorito", e);
      Alert.alert('Error', 'No se pudo actualizar el favorito.');
    } finally {
      setIsTogglingFav(false);
    }
  };

  const handleAssignPress = async () => {
    if (isGuest) {
      Alert.alert(
        'Inicia sesión', 
        'Debes iniciar sesión para poder asignar diagnósticos a los pacientes.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir al Login', onPress: () => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/');
          }}
        ]
      );
      return;
    }
    setShowAssignModal(true);
    fetchPatients('');
  };

  const fetchPatients = async (query: string = '') => {
    setPatientsLoading(true);
    try {
      const data = await patientService.getPatients(query);
      setPatients(data);
    } catch (e) {
      console.warn('Error al cargar pacientes', e);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedPatient || !diagnosis) return;
    setIsAssigning(true);
    try {
      await patientService.assignDiagnosis(selectedPatient.id, {
        codigo_nanda: diagnosis.codigo,
        resultado: outcome.trim() || undefined,
      });
      setSelectedPatient(null);
      setShowAssignModal(false);
      setOutcome('');
      Alert.alert('Éxito', `Diagnóstico asignado correctamente a ${selectedPatient.nombre_completo}.`);
    } catch (e: any) {
      console.warn('Error al asignar diagnóstico', e);
      const detail = e.response?.data?.detail || 'No se pudo asignar el diagnóstico. Intenta de nuevo.';
      Alert.alert('Error', detail);
    } finally {
      setIsAssigning(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.patientRow, { borderBottomColor: colors.outlineVariant }]}
      onPress={() => setSelectedPatient(item)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primaryContainer + '30' }]}>
        <Text style={[styles.avatarText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
          {getInitials(item.nombre_completo)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.patientName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
          {item.nombre_completo}
        </Text>
        <Text style={[styles.patientDoc, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
          H.C.: {item.numero_historia} | {item.tipo_documento} {item.numero_documento}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || !diagnosis) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest }}>
      {/* Header de Volver Stitch */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingTop: 45, 
        paddingHorizontal: layout.spacing.md,
        paddingBottom: layout.spacing.sm,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant,
      }}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            height: 36,
            paddingHorizontal: layout.spacing.sm,
            borderRadius: layout.radius.sm,
            borderWidth: 1,
            borderColor: colors.outline,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 13 }}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={{ 
          fontFamily: typography.fonts.bold, 
          fontSize: 16, 
          color: colors.onSurface, 
          marginLeft: layout.spacing.md,
          flex: 1
        }} numberOfLines={1}>
          Detalle Diagnóstico NANDA
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: layout.spacing.lg }}>
        
        <View style={{ backgroundColor: colors.primaryContainer, alignSelf: 'flex-start', paddingHorizontal: layout.spacing.sm, paddingVertical: 4, borderRadius: layout.radius.sm, marginBottom: layout.spacing.sm }}>
          <Text style={{ fontFamily: typography.fonts.monospace, color: colors.onPrimaryContainer, fontSize: 14 }}>
            {diagnosis.codigo}
          </Text>
        </View>

        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onSurface, marginBottom: layout.spacing.lg }}>
          {diagnosis.nombre}
        </Text>

        {diagnosis.sintomas && (
          <View style={{ marginBottom: layout.spacing.lg }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurfaceVariant, marginBottom: layout.spacing.xs }}>Síntomas Relacionados</Text>
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 15, color: colors.onSurface, lineHeight: 22 }}>
              {diagnosis.sintomas}
            </Text>
          </View>
        )}

        {diagnosis.intervenciones_nic && (
          <View style={{ marginBottom: layout.spacing.lg, padding: layout.spacing.md, backgroundColor: colors.surface, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.primary, marginBottom: layout.spacing.xs }}>Intervenciones (NIC)</Text>
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurface, lineHeight: 22 }}>
              {diagnosis.intervenciones_nic}
            </Text>
          </View>
        )}

        {diagnosis.resultados_noc && (
          <View style={{ marginBottom: layout.spacing.lg, padding: layout.spacing.md, backgroundColor: colors.surface, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.secondary, marginBottom: layout.spacing.xs }}>Resultados Esperados (NOC)</Text>
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurface, lineHeight: 22 }}>
              {diagnosis.resultados_noc}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, flexDirection: 'row', gap: layout.spacing.md }}>
        <Button 
          title={favorites.includes(diagnosis.codigo) ? "♥ Guardado" : "♡ Guardar"} 
          variant={favorites.includes(diagnosis.codigo) ? "primary" : "outlined"} 
          onPress={handleFavoriteToggle} 
          isLoading={isTogglingFav}
          style={{ flex: 1 }} 
        />
        <Button 
          title="Asignar" 
          variant="primary" 
          onPress={handleAssignPress} 
          style={{ flex: 1 }} 
        />
      </View>

      {/* Modal de Asignación */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        onRequestClose={() => {
          if (selectedPatient) {
            setSelectedPatient(null);
          } else {
            setShowAssignModal(false);
          }
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant, paddingTop: 45 }]}>
            <TouchableOpacity
              onPress={() => {
                if (selectedPatient) {
                  setSelectedPatient(null);
                } else {
                  setShowAssignModal(false);
                }
              }}
              style={styles.closeButton}
            >
              <Text style={{ fontFamily: typography.fonts.bold, color: colors.primary, fontSize: 14 }}>
                {selectedPatient ? '← Atrás' : 'Cerrar'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold, textAlign: 'center', marginRight: 40 }]}>
              {selectedPatient ? 'Confirmar Asignación' : 'Seleccionar Paciente'}
            </Text>
          </View>

          {selectedPatient ? (
            /* PASO 2: Confirmar Asignación y agregar NOC */
            <ScrollView contentContainerStyle={{ padding: layout.spacing.lg }}>
              <View style={[styles.confirmDiagCard, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={{ fontFamily: typography.fonts.monospace, color: colors.primary, fontSize: 12, marginBottom: 4 }}>
                  NANDA {diagnosis?.codigo}
                </Text>
                <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 16, marginBottom: 8 }}>
                  {diagnosis?.nombre}
                </Text>
              </View>

              <View style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant, borderWidth: 1, padding: layout.spacing.md, borderRadius: layout.radius.md, marginBottom: layout.spacing.lg }}>
                <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 12 }}>
                  Asignando al paciente:
                </Text>
                <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 18, marginTop: 4 }}>
                  {selectedPatient.nombre_completo}
                </Text>
                <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>
                  H.C.: {selectedPatient.numero_historia}
                </Text>
              </View>

              <Input
                label="Resultado Esperado o Plan de Evolución (NOC) — Opcional"
                placeholder="Ej: Mantener saturación > 95%, mejorar patrón respiratorio..."
                value={outcome}
                onChangeText={setOutcome}
                multiline={true}
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top', paddingTop: 8 }}
              />

              <View style={{ marginTop: layout.spacing.lg, gap: layout.spacing.md }}>
                <Button
                  title="Confirmar Asignación"
                  variant="primary"
                  onPress={handleConfirmAssignment}
                  isLoading={isAssigning}
                />
                <Button
                  title="Cancelar"
                  variant="outlined"
                  onPress={() => setSelectedPatient(null)}
                  disabled={isAssigning}
                />
              </View>
            </ScrollView>
          ) : (
            /* PASO 1: Listado de Pacientes con buscador */
            <View style={{ flex: 1 }}>
              <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, flexDirection: 'row', gap: layout.spacing.xs, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label=""
                    placeholder="Buscar paciente por nombre o H.C...."
                    value={patientSearch}
                    onChangeText={setPatientSearch}
                    onSubmitEditing={() => fetchPatients(patientSearch)}
                    returnKeyType="search"
                    style={{ marginBottom: 0 }}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{ backgroundColor: colors.primary, height: 48, width: 48, borderRadius: layout.radius.sm, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => fetchPatients(patientSearch)}
                >
                  <Search size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {patientsLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={patients}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderPatientItem}
                  contentContainerStyle={{ padding: layout.spacing.md }}
                  ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                      <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, textAlign: 'center' }}>
                        No se encontraron pacientes registrados.
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    paddingVertical: 8,
    paddingRight: 16,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 16,
    flex: 1,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
  },
  patientName: {
    fontSize: 15,
    marginBottom: 2,
  },
  patientDoc: {
    fontSize: 12,
  },
  confirmDiagCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
});
