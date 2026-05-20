import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { NandaCatalog } from '../../src/types/base_type';
import { useAppTheme } from '../../src/styles/theme';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useSearchStore } from '../../src/store/searchStore';

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
              router.replace('/(auth)/login');
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

  const handleAction = (action: string) => {
    if (isGuest) {
      Alert.alert(
        'Inicia sesión', 
        `Debes iniciar sesión para poder ${action}.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir al Login', onPress: () => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/(auth)/login');
          }}
        ]
      );
      return;
    }
    Alert.alert('Acción', `${action} (Se implementará en el Día 2/4)`);
  };

  if (isLoading || !diagnosis) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceContainerLowest }}>
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
          onPress={() => handleAction('asignar a un paciente')} 
          style={{ flex: 1 }} 
        />
      </View>
    </View>
  );
}
