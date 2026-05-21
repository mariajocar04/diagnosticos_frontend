import { useRouter } from 'expo-router';
import { Building2, Clock, LogOut, Shield, Stethoscope, Trash2, UserX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { Input } from '../../src/components/ui/Input';
import { nandaService } from '../../src/services/nandaService';
import { useAuthStore } from '../../src/store/authStore';
import { useSearchStore } from '../../src/store/searchStore';
import { useAppTheme } from '../../src/styles/theme';
import { NandaCatalog } from '../../src/types/base_type';

const COMMON_SYMPTOMS = [
  'Fatiga',
  'Dificultad para respirar',
  'Cianosis',
  'Dolor abdominal',
  'Dolor de cabeza',
  'Aumento de peso',
  'Pérdida de peso',
  'Defecación infrecuente',
  'Estrés o ansiedad',
  'Falta de energía',
  'Obesidad',
  'Desnutrición',
  'Mareos',
  'Interés en aprender',
  'Tos persistente'
];

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
      const res = await nandaService.searchDiagnoses(searchQuery);
      const diagResults = res?.datos || [];
      setResults(diagResults);
      
      // Refresh history from backend if a query was made by professional user
      if (searchQuery.trim() && !isGuest) {
        fetchSearchHistory();
      }
    } catch (e: any) {
      Alert.alert('Error', `Error al buscar diagnósticos: ${e.message}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const res = await nandaService.getHistorial();
      const terms = res?.datos?.map((d: any) => d.termino) || [];
      setRecentSearches(terms);
    } catch (e: any) {
      console.warn("Error al cargar historial", e.message);
    }
  };

  const handleClearHistory = async () => {
    try {
      await nandaService.clearHistorial();
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
                  <Building2 size={18} color={colors.onSurface} /> Hola, {user ? (user.nombre_completo || user.usuario || '').split(' ')[0] : 'Enfermero'}!
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {is_admin ? <Shield size={12} color="#ffffff" /> : <Stethoscope size={12} color="#ffffff" />}
                      <Text style={{ color: '#ffffff', fontSize: 11, fontFamily: typography.fonts.bold }}>
                        {is_admin ? 'Administrador' : 'Enfermero'}
                      </Text>
                    </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ 
                    color: colors.error, 
                    fontFamily: typography.fonts.bold, 
                    fontSize: 12 
                  }}>
                    Salir
                  </Text>
                  <LogOut size={14} color={colors.error} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isGuest && (
          <View style={{ backgroundColor: colors.secondaryContainer, padding: layout.spacing.sm, borderRadius: layout.radius.sm, marginBottom: layout.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: layout.spacing.xs, gap: 6 }}>
              <UserX size={16} color={colors.onSecondaryContainer} />
              <Text style={{ color: colors.onSecondaryContainer, fontFamily: typography.fonts.medium, fontSize: 13 }}>
                Estás en Modo Invitado. Solo puedes consultar el catálogo.
              </Text>
            </View>
            <Button 
              title="Iniciar sesión" 
              variant="primary" 
              style={{ height: 36, alignSelf: 'flex-start', paddingHorizontal: layout.spacing.md }}
              onPress={() => {
                useAuthStore.getState().setGuestMode(false);
                router.replace('/');
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
                <Clock size={16} color={colors.onSurfaceVariant} style={{ marginRight: layout.spacing.sm }} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: typography.fonts.bold, color: colors.error, fontSize: 14 }}>
                    Borrar historial
                  </Text>
                  <Trash2 size={16} color={colors.error} />
                </View>
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
