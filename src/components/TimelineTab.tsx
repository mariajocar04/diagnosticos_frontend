import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../styles/theme';
import { useAuthStore } from '../store/authStore';
import { patientService } from '../services/patientService';
import { EventoHistorial } from '../types/base_type';
import { FileText, ClipboardList, Clock } from 'lucide-react-native';

interface TimelineTabProps {
  patientId: number;
  focusKey?: number;
}

export default function TimelineTab({ patientId, focusKey }: TimelineTabProps) {
  const { colors, typography, layout } = useAppTheme();
  const { isGuest } = useAuthStore();
  const [timeline, setTimeline] = useState<EventoHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [patientId, focusKey]);

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getUnifiedTimeline(patientId);
      setTimeline(data);
    } catch (e) {
      console.warn('Error al cargar historial clínico', e);
    } finally {
      setIsLoading(false);
    }
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

  const renderTimelineItem = ({ item, index }: { item: EventoHistorial; index: number }) => {
    const isNote = item.tipo === 'nota';
    const isLast = index === timeline.length - 1;

    return (
      <View style={styles.timelineRow}>
        {/* Left column: Icon and Vertical Line */}
        <View style={styles.leftCol}>
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: isNote ? colors.primaryContainer + '20' : colors.secondaryContainer + '20',
              borderColor: isNote ? colors.primary : colors.secondary
            }
          ]}>
            {isNote ? (
              <FileText size={16} color={colors.primary} />
            ) : (
              <ClipboardList size={16} color={colors.secondary} />
            )}
          </View>
          {!isLast && <View style={[styles.verticalLine, { backgroundColor: colors.outlineVariant }]} />}
        </View>

        {/* Right column: Event Details */}
        <View style={[styles.rightCol, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
              {item.descripcion}
            </Text>
            <View style={styles.timeContainer}>
              <Clock size={12} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text style={[styles.eventTime, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                {formatDate(item.fecha)}
              </Text>
            </View>
          </View>

          <Text style={[styles.eventDesc, { color: colors.onSurface, fontFamily: typography.fonts.regular }]}>
            {item.detalle}
          </Text>

          {/* If diagnosis, show monospaced code badge if metadata contains code */}
          {item.metadata?.codigo_nanda && (
            <View style={[styles.codeBadge, { backgroundColor: colors.surfaceContainer }]}>
              <Text style={[styles.codeText, { color: colors.onSurface, fontFamily: typography.fonts.monospace }]}>
                NANDA: {item.metadata.codigo_nanda}
              </Text>
            </View>
          )}

          {/* Event Author */}
          {item.usuario && (
            <Text style={[styles.eventAuthor, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.medium }]}>
              Por: {item.usuario.nombre_completo || item.usuario.usuario}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={timeline}
          keyExtractor={(item, index) => `${item.tipo}-${item.id}-${index}`}
          renderItem={renderTimelineItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 40 }]}
          refreshing={isLoading}
          onRefresh={fetchTimeline}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceContainer }]}>
                <Clock size={40} color={colors.outline} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                Historial vacío
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                Las notas clínicas y diagnósticos asignados aparecerán organizados cronológicamente en esta línea de tiempo.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  rightCol: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 11,
  },
  eventDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 11,
  },
  eventAuthor: {
    fontSize: 11,
    textAlign: 'right',
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
    paddingVertical: 64,
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
    color: '#666',
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});
