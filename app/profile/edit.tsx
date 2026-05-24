import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, User, Mail, Shield, UserCheck } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function EditProfileScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [nombreCompleto, setNombreCompleto] = useState(user?.nombre_completo || '');
  const [usuario, setUsuario] = useState(user?.usuario || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio';
    }
    if (!usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es obligatorio';
    }
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (password) {
      if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dataToUpdate: any = {
        nombre_completo: nombreCompleto.trim(),
        usuario: usuario.trim(),
        email: email.trim(),
      };

      if (password.trim() !== '') {
        dataToUpdate.password = password;
      }

      const updatedUser = await authService.updateMe(dataToUpdate);
      
      // Actualizar el estado global
      setUser(updatedUser);

      Alert.alert('Éxito', 'Tus datos han sido actualizados correctamente.', [
        { text: 'Aceptar', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.warn('Error al actualizar perfil', error);
      const detailMsg = error.response?.data?.detail || error.message || 'No se pudo guardar la información.';
      Alert.alert('Error', detailMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');
  };

  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />

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
          Editar Perfil
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.avatarText, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
              {getInitials(nombreCompleto || user?.usuario || '')}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.roleLabel, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.medium }]}>
              Rol Asignado
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: is_admin ? colors.secondary : colors.primary }]}>
              {is_admin ? <Shield size={12} color="#ffffff" /> : <UserCheck size={12} color="#ffffff" />}
              <Text style={styles.roleBadgeText}>
                {is_admin ? 'Administrador' : 'Enfermero'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
            Datos Personales
          </Text>

          <Input
            label="Nombre Completo *"
            placeholder="Ej. Angela Kemer"
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
            error={errors.nombreCompleto}
            editable={!isLoading}
          />

          <Input
            label="Nombre de Usuario *"
            placeholder="Ej. angela_k"
            autoCapitalize="none"
            value={usuario}
            onChangeText={setUsuario}
            error={errors.usuario}
            editable={!isLoading}
          />

          <Input
            label="Correo Electrónico *"
            placeholder="ejemplo@ticos.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            editable={!isLoading}
          />

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fonts.bold }]}>
            Seguridad (Opcional)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant, fontFamily: typography.fonts.regular }]}>
            Completa estos campos únicamente si deseas cambiar tu contraseña de acceso actual.
          </Text>

          <Input
            label="Nueva Contraseña"
            placeholder="Dejar vacío para mantener actual"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            editable={!isLoading}
          />

          <Input
            label="Confirmar Nueva Contraseña"
            placeholder="Dejar vacío para mantener actual"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            editable={!isLoading}
          />
        </View>

        <Button
          title="Guardar Cambios"
          onPress={handleSave}
          isLoading={isLoading}
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
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  avatarInfo: {
    justifyContent: 'center',
    gap: 4,
  },
  roleLabel: {
    fontSize: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});
