import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../styles/theme';
import { useAuthStore } from '../store/authStore';
import { patientService } from '../services/patientService';
import { NotaEnfermeria } from '../types/base_type';
import { InfoCard } from './ui/InfoCard';
import { Badge } from './ui/Badge';
import { FileText, Plus, Trash2, ShieldAlert } from 'lucide-react-native';

interface NotesTabProps {
  patientId: number;
  focusKey?: number;
}

export default function NotesTab({ patientId, focusKey }: NotesTabProps) {
  const { colors, typography, layout } = useAppTheme();
  const { user, isGuest } = useAuthStore();
  const router = useRouter();

  const [notes, setNotes] = useState<NotaEnfermeria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [patientId, focusKey]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getNotes(patientId);
      setNotes(data);
    } catch (e: any) {
      console.warn('Error al cargar notas de enfermería', e);
      if (!isGuest) {
        Alert.alert('Error', 'No se pudieron obtener las notas clínicas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = (noteId: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta nota clínica? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await patientService.deleteNote(noteId);
              setNotes(prev => prev.filter(n => n.id !== noteId));
              Alert.alert('Éxito', 'Nota clínica eliminada.');
            } catch (e) {
              console.warn('Error al eliminar nota', e);
              Alert.alert('Error', 'No tienes permisos para eliminar esta nota o ocurrió un error.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const isNoteAuthor = (note: NotaEnfermeria) => {
    return user && note.usuario_id === user.id;
  };

  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');

  const handleAddNotePress = () => {
    if (isGuest) {
      Alert.alert('Acceso restringido', 'Debes iniciar sesión para agregar notas de enfermería.');
      return;
    }
    router.push(`/patient/${patientId}/add_note`);
  };

  const renderItem = ({ item }: { item: NotaEnfermeria }) => {
    const showDeleteBtn = is_admin || isNoteAuthor(item);
    
    return (
      <InfoCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.authorRow}>
            <View style={[styles.miniAvatar, { backgroundColor: colors.primaryContainer + '20' }]}>
              <Text style={[styles.miniAvatarText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
                {item.usuario?.nombre_completo?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'E'}
              </Text>
            </View>
            <View>
              <Text style={[styles.authorName, { color: colors.onSurface, fontFamily: typography.fonts.semiBold }]}>
                {item.usuario?.nombre_completo || 'Enfermero responsable'}
              </Text>
              <Text style={[styles.dateText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                {formatDate(item.creado_en)}
              </Text>
            </View>
          </View>
          {showDeleteBtn && (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => handleDeleteNote(item.id)}
              style={styles.deleteButton}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.noteContent, { color: colors.onSurface, fontFamily: typography.fonts.regular }]}>
          {item.contenido}
        </Text>
      </InfoCard>
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner de restricción nota:leer_propio si es enfermero normal */}
      {!isGuest && !is_admin && (
        <View style={[styles.banner, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
          <ShieldAlert size={20} color={colors.warning} style={styles.bannerIcon} />
          <Text style={[styles.bannerText, { color: colors.onSurface, fontFamily: typography.fonts.medium }]}>
            Estás visualizando únicamente tus propias notas de enfermería redactadas (restricción RBAC).
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
          refreshing={isLoading}
          onRefresh={fetchNotes}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceContainer }]}>
                <FileText size={40} color={colors.outline} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                No hay notas clínicas registradas
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                {is_admin 
                  ? 'Este paciente aún no tiene ninguna nota clínica registrada.'
                  : 'Aún no has registrado ninguna nota clínica para este paciente.'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.addNoteBtnInline, { backgroundColor: colors.primary }]}
                onPress={handleAddNotePress}
              >
                <Plus size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#ffffff', fontFamily: typography.fonts.bold, fontSize: 14 }}>
                  Agregar Nota
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB inline bottom floating button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddNotePress}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniAvatarText: {
    fontSize: 12,
  },
  authorName: {
    fontSize: 14,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 24,
    lineHeight: 18,
    marginBottom: 16,
  },
  addNoteBtnInline: {
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
