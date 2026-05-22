import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { nandaService } from '../../src/services/nandaService';
import { useAppTheme } from '../../src/styles/theme';

interface DiagnosisDetail {
  id: number;
  codigo: string;
  nombre: string;
  sintomas?: string;
  intervenciones_nic?: string;
  resultados_noc?: string;
  [key: string]: any;
}

export default function DiagnosisDetailScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const codigo = typeof params.codigo === 'string' ? params.codigo : String(params.codigo);

  const [diagnosis, setDiagnosis] = useState<DiagnosisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiagnosis = async () => {
      if (!codigo) {
        Alert.alert('Ruta inválida', 'No se encontró el código del diagnóstico.');
        router.back();
        return;
      }

      setIsLoading(true);
      try {
        const res = await nandaService.getDiagnosisById(codigo);
        setDiagnosis(res?.datos || res || null);
      } catch (error: any) {
        console.warn('Error al cargar diagnóstico', error);
        Alert.alert('Error', 'No se pudo cargar el detalle del diagnóstico.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadDiagnosis();
  }, [codigo, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: layout.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ChevronLeft size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontFamily: typography.fonts.bold, fontSize: 16 }}>Volver</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : diagnosis ? (
        <ScrollView contentContainerStyle={{ padding: layout.spacing.md }}>
          <View style={{ marginBottom: layout.spacing.md }}>
            <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onBackground, marginBottom: layout.spacing.xs }}>
              {diagnosis.nombre}
            </Text>
            <Text style={{ fontFamily: typography.fonts.monospace, color: colors.onSurfaceVariant, fontSize: 14 }}>
              Código: {diagnosis.codigo}
            </Text>
          </View>

          {diagnosis.sintomas ? (
            <View style={{ marginBottom: layout.spacing.md }}>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurface }}>Síntomas</Text>
              <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, marginTop: layout.spacing.xs }}>{diagnosis.sintomas}</Text>
            </View>
          ) : null}

          {diagnosis.intervenciones_nic ? (
            <View style={{ marginBottom: layout.spacing.md }}>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurface }}>Intervenciones NIC</Text>
              <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, marginTop: layout.spacing.xs }}>{diagnosis.intervenciones_nic}</Text>
            </View>
          ) : null}

          {diagnosis.resultados_noc ? (
            <View style={{ marginBottom: layout.spacing.md }}>
              <Text style={{ fontFamily: typography.fonts.bold, fontSize: 16, color: colors.onSurface }}>Resultados NOC</Text>
              <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, marginTop: layout.spacing.xs }}>{diagnosis.resultados_noc}</Text>
            </View>
          ) : null}

          <Button title="Buscar otro diagnóstico" onPress={() => router.replace('/(tabs)/search')} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: layout.spacing.md }}>
          <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 16, textAlign: 'center' }}>
            No se encontró el detalle del diagnóstico.
          </Text>
          <Button title="Regresar" onPress={() => router.back()} style={{ marginTop: layout.spacing.md }} />
        </View>
      )}
    </View>
  );
}
