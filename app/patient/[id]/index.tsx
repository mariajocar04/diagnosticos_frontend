import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Calendar, ChevronLeft, Edit, FileText, FolderHeart, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotesTab from '../../../src/components/NotesTab';
import TimelineTab from '../../../src/components/TimelineTab';
import { InfoCard } from '../../../src/components/ui/InfoCard';
import { patientService } from '../../../src/services/patientService';
import { reporteService } from '../../../src/services/reporteService';
import { useAuthStore } from '../../../src/store/authStore';
import { useAppTheme } from '../../../src/styles/theme';
import { DiagnosticoClinico, Patient } from '../../../src/types/base_type';

type TabType = 'diagnosticos' | 'notas' | 'historial';

export default function PatientDetailScreen() {
  const { colors, typography, layout } = useAppTheme();
  const { user, isGuest } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticoClinico[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('diagnosticos');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDiags, setIsLoadingDiags] = useState(false);
  const [focusKey, setFocusKey] = useState(0);

  // Incrementar focusKey cada vez que la pantalla gana el foco (por ejemplo, al volver de asignación/notas)
  useFocusEffect(
    useCallback(() => {
      setFocusKey(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId, focusKey]);

  useEffect(() => {
    if (patientId && activeTab === 'diagnosticos') {
      loadDiagnostics();
    }
  }, [patientId, activeTab, focusKey]);

  const loadPatient = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatientById(patientId);
      setPatient(data);
    } catch (e) {
      console.warn('Error al cargar paciente', e);
      Alert.alert('Error', 'No se pudo cargar la información del paciente.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiagnostics = async () => {
    setIsLoadingDiags(true);
    try {
      const data = await patientService.getDiagnostics(patientId);
      setDiagnostics(data);
    } catch (e) {
      console.warn('Error al cargar diagnósticos del paciente', e);
    } finally {
      setIsLoadingDiags(false);
    }
  };

  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');

  const handleDeletePatient = () => {
    Alert.alert(
      'Eliminar paciente',
      `¿Estás seguro de que deseas eliminar permanentemente a ${patient?.nombre_completo}? Esta acción eliminará su historia clínica, diagnósticos y notas asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Paciente',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientService.deletePatient(patientId);
              Alert.alert('Éxito', 'Paciente eliminado correctamente.');
              router.replace('/(tabs)/patients');
            } catch (e) {
              console.warn('Error al eliminar paciente', e);
              Alert.alert('Error', 'No se pudo eliminar el paciente. Verifica tus permisos.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteDiagnosis = (assignmentId: number, code: string) => {
    Alert.alert(
      'Remover diagnóstico',
      `¿Deseas desasociar el diagnóstico NANDA ${code} de este paciente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientService.deleteDiagnosis(assignmentId);
              setDiagnostics(prev => prev.filter(d => d.id !== assignmentId));
              Alert.alert('Éxito', 'Diagnóstico desasociado correctamente.');
            } catch (e) {
              console.warn('Error al remover diagnóstico', e);
              Alert.alert('Error', 'No se pudo remover el diagnóstico.');
            }
          }
        }
      ]
    );
  };

  const handleEditPatient = () => {
    router.push({
      pathname: '/patient/add',
      params: { id: patientId }
    });
  };

  const handleAssignDiagnosis = () => {
    if (isGuest) {
      Alert.alert('Acceso restringido', 'Inicia sesión para asignar diagnósticos a pacientes.');
      return;
    }
    router.push(`/patient/${patientId}/assign`);
  };

  const handleExportPdf = async () => {
    try {
      Alert.alert('Exportando...', 'Generando el PDF de la historia clínica...');
      const blob = await reporteService.exportPatientPdf(patientId);
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const fileUri = `${FileSystem.documentDirectory}historia_clinica_${patientId}.pdf`;
        
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: 'base64'
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Historia Clínica PDF',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('Éxito', 'El PDF se ha guardado en el dispositivo.');
        }
      };
    } catch (e) {
      console.warn('Error al exportar PDF', e);
      Alert.alert('Error', 'No se pudo exportar el PDF. Asegúrate de tener permisos suficientes.');
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setActiveTab(tab)}
        style={[
          styles.tabButton,
          { 
            borderBottomColor: isActive ? colors.primary : 'transparent',
            borderBottomWidth: isActive ? 2 : 0 
          }
        ]}
      >
        <Text style={[
          styles.tabButtonText,
          { 
            color: isActive ? colors.primary : colors.onSurfaceVariant,
            fontFamily: isActive ? typography.fonts.bold : typography.fonts.medium
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDiagnosticItem = ({ item }: { item: DiagnosticoClinico }) => (
    <InfoCard style={styles.diagCard}>
      <View style={styles.diagCardHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.diagNameText, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
            {item.catalogo?.nombre || 'Diagnóstico Clínico'}
          </Text>
          <View style={[styles.codeBadge, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.codeText, { color: colors.onSurface, fontFamily: typography.fonts.monospace }]}>
              NANDA {item.codigo_nanda}
            </Text>
          </View>
        </View>
        {!isGuest && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleDeleteDiagnosis(item.id, item.codigo_nanda)}
            style={styles.trashBtn}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {item.resultado && (
        <View style={[styles.outcomeContainer, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.outcomeLabel, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
            Resultado (NOC) / Evolución:
          </Text>
          <Text style={[styles.outcomeText, { color: colors.onSurface, fontFamily: typography.fonts.regular }]}>
            {item.resultado}
          </Text>
        </View>
      )}

      <View style={styles.diagFooter}>
        <Calendar size={12} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
        <Text style={[styles.diagDateText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
          Asignado: {formatDate(item.fecha_hora)}
        </Text>
        {item.usuario && (
          <Text style={[styles.diagDateText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.medium, marginLeft: 8 }]}>
            • Por: {item.usuario.nombre_completo || item.usuario.usuario}
          </Text>
        )}
      </View>
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
        <Text style={[styles.headerTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
          Detalle Clínico
        </Text>
        
        {/* Acciones de Cabecera */}
        <View style={styles.headerActions}>
          {!isGuest && (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleExportPdf}
                activeOpacity={0.7}
              >
                <FileText size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { marginLeft: 4 }]} 
                onPress={handleEditPatient}
                activeOpacity={0.7}
              >
                <Edit size={20} color={colors.secondary} />
              </TouchableOpacity>
            </>
          )}
          {is_admin && (
            <TouchableOpacity 
              style={[styles.actionButton, { marginLeft: 8 }]} 
              onPress={handleDeletePatient}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : patient ? (
        <View style={{ flex: 1 }}>
          {/* Ficha Demográfica del Paciente */}
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryContainer + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                  {getInitials(patient.nombre_completo)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.patientNameText, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                  {patient.nombre_completo}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.patientMetaText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                    HC: <Text style={{ fontFamily: typography.fonts.semiBold }}>{patient.numero_historia}</Text>
                  </Text>
                  <Text style={[styles.patientMetaText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular, marginLeft: 16 }]}>
                    Doc: <Text style={{ fontFamily: typography.fonts.semiBold }}>{patient.tipo_documento.toUpperCase()} {patient.numero_documento}</Text>
                  </Text>
                </View>
                <Text style={[styles.createdText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                  Ingreso: {formatDate(patient.creado_en)}
                </Text>
              </View>
            </View>
          </View>

          {/* Navegación por pestañas */}
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
            {renderTabButton('diagnosticos', 'Diagnósticos')}
            {renderTabButton('notas', 'Notas Clínicas')}
            {renderTabButton('historial', 'Línea de Tiempo')}
          </View>

          {/* Contenido de la pestaña */}
          <View style={{ flex: 1 }}>
            {activeTab === 'diagnosticos' && (
              <View style={{ flex: 1 }}>
                {isLoadingDiags ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <FlatList
                    data={diagnostics}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDiagnosticItem}
                    contentContainerStyle={[styles.diagsList, { paddingBottom: 80 }]}
                    refreshing={isLoadingDiags}
                    onRefresh={loadDiagnostics}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceContainer }]}>
                          <FolderHeart size={40} color={colors.outline} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                          Sin diagnósticos asignados
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                          Este paciente no tiene diagnósticos de enfermería registrados actualmente.
                        </Text>
                        {!isGuest && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={[styles.assignBtnInline, { backgroundColor: colors.primary }]}
                            onPress={handleAssignDiagnosis}
                          >
                            <Plus size={16} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#ffffff', fontFamily: typography.fonts.bold, fontSize: 14 }}>
                              Asignar Diagnóstico
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    }
                  />
                )}
                {!isGuest && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={handleAssignDiagnosis}
                  >
                    <Plus size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {activeTab === 'notas' && (
              <NotesTab patientId={patientId} focusKey={focusKey} />
            )}

            {activeTab === 'historial' && (
              <TimelineTab patientId={patientId} focusKey={focusKey} />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }}>
            No se pudo cargar el paciente.
          </Text>
        </View>
      )}
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  actionButton: {
    padding: 8,
  },
  profileCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
  },
  patientNameText: {
    fontSize: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientMetaText: {
    fontSize: 13,
  },
  createdText: {
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
  },
  diagsList: {
    padding: 16,
  },
  diagCard: {
    marginBottom: 16,
    padding: 16,
  },
  diagCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  diagNameText: {
    fontSize: 15,
    marginBottom: 6,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  codeText: {
    fontSize: 11,
  },
  trashBtn: {
    padding: 8,
  },
  outcomeContainer: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 12,
  },
  outcomeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  diagFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagDateText: {
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
    marginBottom: 16,
  },
  assignBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
