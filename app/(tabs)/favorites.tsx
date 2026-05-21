import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useSearchStore } from '../../src/store/searchStore';
import { useAppTheme } from '../../src/styles/theme';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { Button } from '../../src/components/ui/Button';
import { nandaService } from '../../src/services/nandaService';
import { NandaCatalog } from '../../src/types/base_type';
import { useRouter } from 'expo-router';

export default function FavoritesTab() {
  const { colors, typography, layout } = useAppTheme();
  const { isGuest } = useAuthStore();
  const router = useRouter();
  
  const [favoriteList, setFavoriteList] = useState<NandaCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingMap, setIsTogglingMap] = useState<Record<string, boolean>>({});

  const favorites = useSearchStore(state => state.favorites);
  const setFavorites = useSearchStore(state => state.setFavorites);
  const toggleFavoriteLocal = useSearchStore(state => state.toggleFavoriteLocal);

  useEffect(() => {
    if (!isGuest) {
      fetchFavorites();
    }
  }, [favorites.length, isGuest]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await nandaService.getFavoritos();
      // res has total and datos
      setFavoriteList(res.datos || []);
      
      const codes = (res.datos || []).map((d: NandaCatalog) => d.codigo);
      setFavorites(codes);
    } catch (e) {
      console.warn("Fallo al obtener favoritos", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (codigo: string) => {
    setIsTogglingMap(prev => ({ ...prev, [codigo]: true }));
    try {
      await nandaService.toggleFavorito(codigo);
      toggleFavoriteLocal(codigo);
      setFavoriteList(prev => prev.filter(item => item.codigo !== codigo));
    } catch (e) {
      console.warn("Error al remover favorito", e);
      Alert.alert('Error', 'No se pudo quitar el diagnóstico de favoritos.');
    } finally {
      setIsTogglingMap(prev => ({ ...prev, [codigo]: false }));
    }
  };

  const renderItem = ({ item }: { item: NandaCatalog }) => {
    const isRemoving = isTogglingMap[item.codigo] || false;

    return (
      <InfoCard 
        style={{ marginBottom: layout.spacing.md }} 
        onPress={() => router.push(`/diagnosis/${item.codigo}`)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: layout.spacing.md }}>
            <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, fontSize: 16 }}>
              {item.nombre}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: layout.spacing.xs }}>
              <View style={{ backgroundColor: colors.primaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: layout.spacing.sm }}>
                <Text style={{ fontFamily: typography.fonts.monospace, color: colors.onPrimaryContainer, fontSize: 11 }}>
                  {item.codigo}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => handleRemoveFavorite(item.codigo)}
            disabled={isRemoving}
            style={{ padding: 4 }}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>
              {isRemoving ? '⏳' : '♥'}
            </Text>
          </TouchableOpacity>
        </View>

        {item.sintomas && (
          <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, marginTop: layout.spacing.sm, fontSize: 13 }} numberOfLines={2}>
            {item.sintomas}
          </Text>
        )}
      </InfoCard>
    );
  };

  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: layout.spacing.lg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.surface, padding: layout.spacing.xl, borderRadius: layout.radius.md, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', width: '100%' }}>
          <Text style={{ fontSize: 48, marginBottom: layout.spacing.md }}>🔒</Text>
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 18, color: colors.onSurface, marginBottom: layout.spacing.sm, textAlign: 'center' }}>
            Favoritos Protegidos
          </Text>
          <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: layout.spacing.lg, lineHeight: 20 }}>
            Inicia sesión con tu cuenta de enfermero para poder marcar diagnósticos como favoritos y acceder a ellos rápidamente.
          </Text>
          <Button 
            title="Iniciar sesión" 
            variant="primary" 
            style={{ width: '100%' }}
            onPress={() => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/');
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 22, color: colors.onSurface }}>
          Mis Favoritos 💖
        </Text>
        <Text style={{ fontFamily: typography.fonts.regular, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>
          Listado de diagnósticos rápidos de uso clínico
        </Text>
      </View>

      {isLoading && favoriteList.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favoriteList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: layout.spacing.md }}
          onRefresh={fetchFavorites}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', marginTop: 60, paddingHorizontal: layout.spacing.lg }}>
              <Text style={{ fontSize: 48, marginBottom: layout.spacing.md }}>📋</Text>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurface, marginBottom: layout.spacing.xs, textAlign: 'center' }}>
                Sin favoritos guardados
              </Text>
              <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: layout.spacing.lg, lineHeight: 20 }}>
                Aún no tienes diagnósticos marcados. Toca el corazón ♡ en los detalles de cualquier diagnóstico NANDA para guardarlo aquí.
              </Text>
              <Button 
                title="Buscar Diagnósticos" 
                variant="outlined" 
                style={{ paddingHorizontal: layout.spacing.lg }}
                onPress={() => router.push('/(tabs)/search')}
              />
            </View>
          }
        />
      )}
    </View>
  );
}
