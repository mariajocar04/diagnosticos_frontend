import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { InfoCard } from '../../src/components/ui/InfoCard';
import { patientService } from '../../src/services/patientService';
import { Patient } from '../../src/types/base_type';
import { useRouter } from 'expo-router';
import { Plus, Search, ChevronRight, User } from 'lucide-react-native';

export default function PatientsTab() {
  const { colors, typography, layout } = useAppTheme();
  const { isGuest, user } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query: string = '') => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients(query);
      setPatients(data);
    } catch (e: any) {
      console.warn('Error al obtener pacientes', e);
      if (!isGuest) {
        Alert.alert('Error', 'No se pudieron cargar los pacientes. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPatients(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchPatients('');
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

  const handleAddPatientPress = () => {
    if (isGuest) {
      Alert.alert(
        'Acceso restringido',
        'Inicia sesión para poder registrar pacientes y gestionar sus diagnósticos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar sesión', 
            onPress: () => {
              useAuthStore.getState().setGuestMode(false);
              router.replace('/(auth)/login');
            } 
          }
        ]
      );
      return;
    }
    router.push('/patient/add');
  };

  const renderItem = ({ item }: { item: Patient }) => (
    <InfoCard
      style={styles.card}
      onPress={() => router.push(`/patient/${item.id}`)}
    >
      <View style={styles.cardContent}>
        <View style={[styles.avatar, { backgroundColor: colors.secondaryContainer }]}>
          <Text style={[styles.avatarText, { color: colors.onSecondaryContainer, fontFamily: typography.fonts.bold }]}>
            {getInitials(item.nombre_completo)}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, { color: colors.onSurface, fontFamily: typography.fonts.bold }]} numberOfLines={1}>
            {item.nombre_completo}
          </Text>
          <Text style={[styles.subText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
            HC: {item.numero_historia}
          </Text>
          <Text style={[styles.subText, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
            {item.tipo_documento.toUpperCase()} {item.numero_documento}
          </Text>
        </View>

        <ChevronRight size={20} color={colors.outline} />
      </View>
    </InfoCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <Text style={[styles.headerTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
          Mis Pacientes
        </Text>
        
        {/* Buscador */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Input
              label=""
              placeholder="Buscar por nombre, documento o HC..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Search size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: layout.spacing.xl * 2 }]}
          refreshing={isLoading}
          onRefresh={() => fetchPatients(search)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceContainer }]}>
                <User size={48} color={colors.outline} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface, fontFamily: typography.fonts.bold }]}>
                {search.trim() === '' ? 'Aún no tienes pacientes' : 'No se encontraron pacientes'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
                {search.trim() === ''
                  ? 'Registra a tus pacientes para gestionar sus diagnósticos de enfermería.'
                  : 'Prueba a buscar con otro término o limpia el buscador.'}
              </Text>
              {search.trim() !== '' && (
                <TouchableOpacity 
                  style={[styles.clearSearchButton, { borderColor: colors.primary }]}
                  onPress={handleClearSearch}
                >
                  <Text style={{ color: colors.primary, fontFamily: typography.fonts.bold }}>
                    Limpiar Búsqueda
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Botón FAB Flotante */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddPatientPress}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    marginBottom: 0,
  },
  searchButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 32,
    lineHeight: 20,
    marginBottom: 16,
  },
  clearSearchButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
