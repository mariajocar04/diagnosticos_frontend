import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useSearchStore } from '../../src/store/searchStore';

const COMMON_SYMPTOMS = [
  'Dolor',
  'Fiebre',
  'Disnea',
  'Ansiedad',
  'Fatiga',
  'Insomnio',
  'Náuseas',
  'Tos',
  'Debilidad',
  'Estreñimiento'
];
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/services/api';
import { NandaCatalog } from '../../src/types/base_type';
import { useRouter } from 'expo-router';

export default function SearchTab() {
  const { colors, typography, layout } = useAppTheme();
  const { isGuest, user, logout } = useAuthStore();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NandaCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const recentSearches = useSearchStore(state => state.recentSearches);
  const setRecentSearches = useSearchStore(state => state.setRecentSearches);
  const clearRecentSearches = useSearchStore(state => state.clearRecentSearches);

  useEffect(() => {
    fetchDiagnoses();
    if (!isGuest) {
      fetchSearchHistory();
    }
  }, [isGuest]);

  const fetchDiagnoses = async (searchQuery: string = '') => {
    setIsLoading(true);
    try {
      const res = await api.get(`/diagnosticos?q=${searchQuery}`);
      setResults(res.data.datos || []);
      
      // Refresh history from backend if a query was made by professional user
      if (searchQuery.trim() && !isGuest) {
        fetchSearchHistory();
      }
    } catch (e) {
      console.warn("Fallo al obtener NANDA", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const res = await api.get('/diagnosticos/historial');
      const terms = res.data.datos.map((d: any) => d.termino);
      setRecentSearches(terms);
    } catch (e) {
      console.warn("Error al cargar historial", e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/diagnosticos/historial');
      clearRecentSearches();
    } catch (e) {
      console.warn("Error al limpiar historial", e);
      Alert.alert('Error', 'No se pudo limpiar el historial');
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text === '') {
      setSelectedSymptoms([]);
    }
  };

  const handleSymptomPress = (symptom: string) => {
    const isSelected = selectedSymptoms.includes(symptom);
    const updated = isSelected
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    
    setSelectedSymptoms(updated);
    
    const newQuery = updated.join(', ');
    setQuery(newQuery);
    fetchDiagnoses(newQuery);
  };

  const handleSearch = () => {
    fetchDiagnoses(query);
  };

  const renderItem = ({ item }: { item: NandaCatalog }) => (
    <InfoCard 
      style={{ marginBottom: layout.spacing.md }} 
      onPress={() => router.push(`/diagnosis/${item.codigo}`)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurface, flex: 1, marginRight: layout.spacing.sm }}>
          {item.nombre}
        </Text>
        <View style={{ backgroundColor: colors.primaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
          <Text style={{ fontFamily: typography.fonts.monospace, color: colors.onPrimaryContainer, fontSize: 12 }}>
            {item.codigo}
          </Text>
        </View>
      </View>
      {item.sintomas && (
        <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, marginTop: layout.spacing.xs, fontSize: 13 }} numberOfLines={2}>
          {item.sintomas}
        </Text>
      )}
    </InfoCard>
  );

  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        
        {/* Banner de Rol cuando está logueado */}
        {!isGuest && (
          <View style={{ 
            backgroundColor: is_admin ? colors.secondaryContainer + '1A' : colors.primaryContainer + '0F', 
            padding: layout.spacing.md, 
            borderRadius: layout.radius.md, 
            marginBottom: layout.spacing.md,
            borderWidth: 1,
            borderColor: is_admin ? colors.secondary : colors.primary,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: layout.spacing.sm }}>
                <Text style={{ fontFamily: typography.fonts.bold, fontSize: 18, color: colors.onSurface }}>
                  🏥 Hola, {user ? (user.nombre_completo || user.usuario || '').split(' ')[0] : 'Enfermero'}!
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontFamily: typography.fonts.regular, fontSize: 13, color: colors.onSurfaceVariant, marginRight: 6 }}>
                    Rol actual:
                  </Text>
                  <View style={{ 
                    backgroundColor: is_admin ? colors.secondary : colors.primary, 
                    paddingHorizontal: 8, 
                    paddingVertical: 3, 
                    borderRadius: layout.radius.pill 
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 11, fontFamily: typography.fonts.bold }}>
                      {is_admin ? '🛡️ Administrador' : '🩺 Enfermero'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.7}
                style={{
                  height: 38,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: layout.radius.sm,
                  borderWidth: 1,
                  borderColor: colors.error,
                  backgroundColor: colors.surface,
                }}
                onPress={async () => {
                  await logout();
                  router.replace('/');
                }}
              >
                <Text style={{ 
                  color: colors.error, 
                  fontFamily: typography.fonts.bold, 
                  fontSize: 12 
                }}>
                  Salir 🚪
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isGuest && (
          <View style={{ backgroundColor: colors.secondaryContainer, padding: layout.spacing.sm, borderRadius: layout.radius.sm, marginBottom: layout.spacing.md }}>
            <Text style={{ color: colors.onSecondaryContainer, fontFamily: typography.fonts.medium, fontSize: 13, marginBottom: layout.spacing.xs }}>
              👋 Estás en Modo Invitado. Solo puedes consultar el catálogo.
            </Text>
            <Button 
              title="Iniciar sesión" 
              variant="primary" 
              style={{ height: 36, alignSelf: 'flex-start', paddingHorizontal: layout.spacing.md }}
              onPress={() => {
                useAuthStore.getState().setGuestMode(false);
                router.replace('/(auth)/login');
              }}
            />
          </View>
        )}
        <Input 
          label="" 
          placeholder="Buscar diagnóstico o síntoma..." 
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={{ marginBottom: layout.spacing.sm }}
        />

        <View style={{ marginTop: layout.spacing.xs }}>
          <Text style={{ fontFamily: typography.fonts.bold, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 6 }}>
            Filtrar por síntomas clínicos:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2 }}>
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  activeOpacity={0.7}
                  onPress={() => handleSymptomPress(symptom)}
                  style={{
                    backgroundColor: isSelected ? colors.primary : colors.surfaceContainer,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: layout.radius.pill,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.outlineVariant,
                    marginRight: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 32,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ 
                    fontFamily: typography.fonts.medium, 
                    fontSize: 12, 
                    color: isSelected ? '#ffffff' : colors.onSurface 
                  }}>
                    {isSelected ? '✓ ' : ''}{symptom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {isGuest && selectedSymptoms.length < 2 && (
            <Text style={{ fontFamily: typography.fonts.regular, fontSize: 11, color: colors.primary, marginTop: 6 }}>
              💡 Selecciona al menos 2 síntomas para buscar en modo invitado.
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : query.trim() === '' && !isGuest && recentSearches.length > 0 ? (
        <View style={{ flex: 1, padding: layout.spacing.md }}>
          <Text style={{ fontFamily: typography.fonts.bold, color: colors.onSurfaceVariant, marginBottom: layout.spacing.sm, fontSize: 14 }}>
            Búsquedas recientes
          </Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: layout.spacing.sm, 
                  borderBottomWidth: 1, 
                  borderBottomColor: colors.outlineVariant 
                }}
                onPress={() => {
                  setQuery(item);
                  fetchDiagnoses(item);
                }}
              >
                <Text style={{ fontSize: 16, marginRight: layout.spacing.sm, color: colors.onSurfaceVariant }}>🕒</Text>
                <Text style={{ fontFamily: typography.fonts.regular, fontSize: 15, color: colors.onSurface, flex: 1 }}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity 
                activeOpacity={0.7}
                style={{ marginTop: layout.spacing.md, alignSelf: 'flex-start' }}
                onPress={handleClearHistory}
              >
                <Text style={{ fontFamily: typography.fonts.bold, color: colors.error, fontSize: 14 }}>
                  Borrar historial 🗑️
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: layout.spacing.md }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, marginTop: layout.spacing.xl, fontFamily: typography.fonts.regular }}>
              {query.trim() === '' ? 'Ingresa un término para comenzar a buscar.' : 'No se encontraron diagnósticos.'}
            </Text>
          }
        />
      )}
    </View>
  );
}
