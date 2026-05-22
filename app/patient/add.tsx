import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { patientService } from '../../src/services/patientService';
import { unidadService } from '../../src/services/unidadService';
import { remissionService } from '../../src/services/remissionService';
import { Unidad } from '../../src/types/base_type';
import { ChevronLeft, ChevronDown, CheckSquare, Square } from 'lucide-react-native';

const DOCUMENT_TYPES = [
  { label: 'Cédula de Ciudadanía (CC)', value: 'cc' },
  { label: 'Tarjeta de Identidad (TI)', value: 'ti' },
  { label: 'Pasaporte', value: 'pasaporte' },
  { label: 'Registro Civil (RC)', value: 'rc' },
  { label: 'Cédula de Extranjería (CE)', value: 'ce' }
];

export default function AddEditPatientScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.id ? Number(params.id) : null;
  const isEditMode = !!patientId;

  // Form states
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [numeroHistoria, setNumeroHistoria] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('cc');
  const [numeroDocumento, setNumeroDocumento] = useState('');

  // Validation/Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);

  // Remission states
  const [crearRemision, setCrearRemision] = useState(false);
  const [unidadId, setUnidadId] = useState<number | null>(null);
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [motivo, setMotivo] = useState('');
  
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    try {
      const data = await unidadService.getUnidades();
      setUnidades(data.datos);
    } catch (e) {
      console.warn('Error al cargar unidades', e);
    }
  };

  useEffect(() => {
    if (isEditMode && patientId) {
      loadPatientData(patientId);
    }
  }, [patientId]);

  const loadPatientData = async (id: number) => {
    setIsLoading(true);
    try {
      const patient = await patientService.getPatientById(id);
      setNombreCompleto(patient.nombre_completo);
      setNumeroHistoria(patient.numero_historia);
      setTipoDocumento(patient.tipo_documento);
      setNumeroDocumento(patient.numero_documento);
    } catch (e) {
      console.warn('Error al cargar datos del paciente', e);
      Alert.alert('Error', 'No se pudo cargar la información del paciente.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!nombreCompleto.trim()) tempErrors.nombreCompleto = 'El nombre completo es requerido';
    if (!numeroHistoria.trim()) tempErrors.numeroHistoria = 'El número de historia clínica es requerido';
    if (!numeroDocumento.trim()) tempErrors.numeroDocumento = 'El número de documento es requerido';
    
    if (crearRemision && !unidadId) {
      tempErrors.unidadId = 'Debe seleccionar una unidad para la remisión';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const data = {
      nombre_completo: nombreCompleto.trim(),
      numero_historia: numeroHistoria.trim(),
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento.trim(),
    };

    try {
      let newPatientId = patientId;
      if (isEditMode && patientId) {
        await patientService.updatePatient(patientId, data);
      } else {
        const newPatient = await patientService.createPatient(data);
        newPatientId = newPatient.id;
      }

      if (crearRemision && newPatientId && unidadId) {
        await remissionService.createRemission({
          paciente_id: newPatientId,
          unidad_id: unidadId,
          motivo: motivo.trim(),
          prioridad: prioridad,
        });
      }

      Alert.alert('Éxito', `Paciente ${isEditMode ? 'actualizado' : 'registrado'} correctamente.`);
      router.back();
    } catch (e: any) {
      console.warn('Error al guardar paciente', e);
      const detail = e.response?.data?.detail || 'No se pudo guardar la información del paciente. Intenta de nuevo.';
      Alert.alert('Error', detail);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedDocTypeLabel = () => {
    return DOCUMENT_TYPES.find(t => t.value === tipoDocumento)?.label || 'Seleccionar...';
  };

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
          {isEditMode ? 'Editar Paciente' : 'Registrar Paciente'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Nombre completo */}
        <Input
          label="Nombre Completo"
          placeholder="Ej: Juan Pérez Gómez"
          value={nombreCompleto}
          onChangeText={setNombreCompleto}
          error={errors.nombreCompleto}
          editable={!isLoading}
        />

        {/* Historia Clínica */}
        <Input
          label="Número de Historia Clínica"
          placeholder="Ej: HC-10294"
          value={numeroHistoria}
          onChangeText={setNumeroHistoria}
          error={errors.numeroHistoria}
          editable={!isLoading}
          autoCapitalize="characters"
        />

        {/* Tipo de Documento */}
        <Text style={[styles.label, { color: colors.onSurface, fontFamily: typography.fonts.semiBold }]}>
          Tipo de Documento
        </Text>
        <TouchableOpacity
          style={[styles.dropdownTrigger, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}
          onPress={() => setShowDocTypeModal(true)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownTriggerText, { color: colors.onSurface, fontFamily: typography.fonts.regular }]}>
            {getSelectedDocTypeLabel()}
          </Text>
          <ChevronDown size={20} color={colors.outline} />
        </TouchableOpacity>

        {/* Número de documento */}
        <Input
          label="Número de Documento"
          placeholder="Ej: 1098765432"
          value={numeroDocumento}
          onChangeText={setNumeroDocumento}
          error={errors.numeroDocumento}
          keyboardType="numeric"
          editable={!isLoading}
        />

        {!isEditMode && (
          <View style={[styles.remissionSection, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <TouchableOpacity 
              style={styles.remissionToggle} 
              onPress={() => setCrearRemision(!crearRemision)}
              activeOpacity={0.7}
            >
              {crearRemision ? 
                <CheckSquare color={colors.primary} size={20} /> : 
                <Square color={colors.outline} size={20} />
              }
              <Text style={[styles.remissionTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Crear Remisión Inmediata (Opcional)
              </Text>
            </TouchableOpacity>

            {crearRemision && (
              <View style={styles.remissionForm}>
                <Text style={[styles.label, { color: colors.onSurface, fontFamily: typography.fonts.semiBold }]}>
                  Unidad de Destino *
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownTrigger, { borderColor: errors.unidadId ? colors.error : colors.outlineVariant, backgroundColor: colors.surface }]}
                  onPress={() => setShowUnitModal(true)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownTriggerText, { color: unidadId ? colors.onSurface : colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                    {unidadId ? unidades.find(u => u.id === unidadId)?.nombre : 'Seleccionar Unidad...'}
                  </Text>
                  <ChevronDown size={20} color={colors.outline} />
                </TouchableOpacity>
                {errors.unidadId && <Text style={{ color: colors.error, fontSize: 12, marginTop: -12, marginBottom: 12 }}>{errors.unidadId}</Text>}

                <Text style={[styles.label, { color: colors.onSurface, fontFamily: typography.fonts.semiBold }]}>
                  Prioridad
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownTrigger, { borderColor: colors.outlineVariant, backgroundColor: colors.surface }]}
                  onPress={() => setShowPriorityModal(true)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownTriggerText, { color: colors.onSurface, fontFamily: typography.fonts.regular }]}>
                    {prioridad}
                  </Text>
                  <ChevronDown size={20} color={colors.outline} />
                </TouchableOpacity>

                <Input
                  label="Motivo de la remisión (Opcional)"
                  placeholder="Detalles sobre por qué se remite..."
                  value={motivo}
                  onChangeText={setMotivo}
                  editable={!isLoading}
                />
              </View>
            )}
          </View>
        )}

        {/* Botón de guardar */}
        <Button
          title={isEditMode ? 'Guardar Cambios' : 'Registrar Paciente'}
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>

      {/* Modal para selección de tipo de documento */}
      <Modal
        visible={showDocTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocTypeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDocTypeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Selecciona Tipo de Documento
              </Text>
            </View>

            <FlatList
              data={DOCUMENT_TYPES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomColor: colors.outlineVariant }]}
                  onPress={() => {
                    setTipoDocumento(item.value);
                    setShowDocTypeModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, { 
                    color: tipoDocumento === item.value ? colors.primary : colors.onSurface,
                    fontFamily: tipoDocumento === item.value ? typography.fonts.bold : typography.fonts.regular 
                  }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para selección de Unidad */}
      <Modal
        visible={showUnitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowUnitModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Selecciona Unidad Destino
              </Text>
            </View>

            <FlatList
              data={unidades}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomColor: colors.outlineVariant }]}
                  onPress={() => {
                    setUnidadId(item.id);
                    setShowUnitModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, { 
                    color: unidadId === item.id ? colors.primary : colors.onSurface,
                    fontFamily: unidadId === item.id ? typography.fonts.bold : typography.fonts.regular 
                  }]}>
                    {item.nombre} - Capacidad: {item.capacidad}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para selección de Prioridad */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowPriorityModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.outlineVariant }]}>
              <Text style={[styles.modalTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Selecciona Prioridad
              </Text>
            </View>

            {['ALTA', 'MEDIA', 'BAJA'].map(prio => (
              <TouchableOpacity
                key={prio}
                style={[styles.modalOption, { borderBottomColor: colors.outlineVariant }]}
                onPress={() => {
                  setPrioridad(prio);
                  setShowPriorityModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalOptionText, { 
                  color: prioridad === prio ? colors.primary : colors.onSurface,
                  fontFamily: prioridad === prio ? typography.fonts.bold : typography.fonts.regular 
                }]}>
                  {prio}
                </Text>
              </TouchableOpacity>
            ))}
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
    fontSize: 18,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdownTriggerText: {
    fontSize: 16,
  },
  remissionSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  remissionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  remissionTitle: {
    fontSize: 15,
    marginLeft: 8,
  },
  remissionForm: {
    marginTop: 12,
  },
  saveButton: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
