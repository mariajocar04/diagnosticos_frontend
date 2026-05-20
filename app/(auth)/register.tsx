import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAppTheme } from '../../src/styles/theme';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

export default function RegisterScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombreCompleto.trim() || !usuario.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        nombre_completo: nombreCompleto.trim(),
        usuario: usuario.trim(),
        email: email.trim(),
        password: password.trim()
      });

      Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.', [
        { text: 'Ir al Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (e: any) {
      console.warn("Error de registro", e);
      const errMsg = e.response?.data?.detail || 'No se pudo crear la cuenta. Inténtalo de nuevo.';
      Alert.alert('Fallo en el registro', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: layout.spacing.lg, backgroundColor: colors.surfaceContainerLowest, flexGrow: 1 }}>
      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 26, color: colors.onSurface, marginBottom: layout.spacing.lg, marginTop: 20 }}>
        Crea tu cuenta clínica 🩺
      </Text>
      
      <Input 
        label="Nombre Completo" 
        placeholder="Ej. Juan Pérez" 
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
      />
      
      <Input 
        label="Usuario (Nombre de usuario)" 
        placeholder="Ej. jperez" 
        autoCapitalize="none"
        value={usuario}
        onChangeText={setUsuario}
      />
      
      <Input 
        label="Correo Electrónico" 
        placeholder="juan@ticos.com" 
        keyboardType="email-address" 
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      <Input 
        label="Contraseña" 
        placeholder="********" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />
      
      <Button 
        title="Registrarse" 
        onPress={handleRegister} 
        isLoading={isLoading}
        style={{ marginTop: layout.spacing.md }} 
      />

      <Text 
        onPress={() => router.replace('/(auth)/login')} 
        style={{ 
          color: colors.primary, 
          fontFamily: typography.fonts.medium, 
          textAlign: 'center', 
          marginTop: layout.spacing.lg 
        }}
      >
        ¿Ya tienes cuenta? Inicia sesión aquí
      </Text>
    </ScrollView>
  );
}
