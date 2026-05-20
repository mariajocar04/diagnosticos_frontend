import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { patientService } from '../../src/services/patientService';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';

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
      if (isEditMode && patientId) {
        await patientService.updatePatient(patientId, data);
        Alert.alert('Éxito', 'Paciente actualizado correctamente.');
      } else {
        await patientService.createPatient(data);
        Alert.alert('Éxito', 'Paciente registrado correctamente.');
      }
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
