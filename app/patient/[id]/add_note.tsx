import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../../src/styles/theme';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { patientService } from '../../../src/services/patientService';
import { Patient } from '../../../src/types/base_type';
import { ChevronLeft } from 'lucide-react-native';

export default function AddNursingNoteScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatientById(patientId);
      setPatient(data);
    } catch (e) {
      console.warn('Error al cargar datos del paciente', e);
      Alert.alert('Error', 'No se pudo cargar la información del paciente.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!content.trim()) {
      Alert.alert('Nota vacía', 'Por favor escribe el contenido de la nota antes de guardar.');
      return;
    }

    setIsSaving(true);
    try {
      await patientService.createNote(patientId, { contenido: content.trim() });
      Alert.alert('Éxito', 'Nota de enfermería agregada correctamente.');
      router.back();
    } catch (e: any) {
      console.warn('Error al guardar nota', e);
      const detail = e.response?.data?.detail || 'No se pudo guardar la nota de enfermería. Intenta de nuevo.';
      Alert.alert('Error', detail);
    } finally {
      setIsSaving(false);
    }
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
          Agregar Nota Clínica
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Contexto del Paciente */}
        {patient && (
          <View style={[styles.contextCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer + '1A' }]}>
              <Text style={[styles.avatarText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                {patient.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                {patient.nombre_completo}
              </Text>
              <Text style={[styles.patientMeta, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                HC: {patient.numero_historia} | {patient.tipo_documento.toUpperCase()}: {patient.numero_documento}
              </Text>
            </View>
          </View>
        )}

        {/* Text Area para Nota */}
        <Input
          label="Contenido de la Nota de Enfermería"
          placeholder="Describe la evolución clínica del paciente, cuidados administrados y estado general..."
          value={content}
          onChangeText={setContent}
          multiline={true}
          numberOfLines={8}
          maxLength={1000}
          editable={!isSaving}
          style={[styles.textArea, { height: 180, textAlignVertical: 'top', paddingTop: 12 }]}
        />

        {/* Contador de caracteres */}
        <Text style={[styles.charCounter, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
          {content.length} / 1000 caracteres
        </Text>

        {/* Botón de Guardar */}
        <Button
          title="Guardar Nota Clínica"
          onPress={handleSaveNote}
          isLoading={isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
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
  contentContainer: {
    padding: 20,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 12,
  },
  textArea: {
    lineHeight: 22,
  },
  charCounter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 8,
  },
});
