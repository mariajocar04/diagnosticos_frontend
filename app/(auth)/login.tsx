import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';
import { useAppTheme } from '../../src/styles/theme';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

export default function LoginScreen() {
  const { colors, layout, typography } = useAppTheme();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);
  const setGuestMode = useAuthStore(state => state.setGuestMode);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    try {
      // Petición real al backend FastAPI usando authService
      const res = await authService.login(email, password);
      
      await setToken(res.access_token);
      
      // Obtener el perfil del usuario autenticado
      const userRes = await authService.getMe(); // El interceptor ya pone el token
      
      setUser(userRes);
      setGuestMode(false);
      router.replace('/(tabs)/search');
      
    } catch (error) {
      console.warn('Fallo en API de login. Iniciando MOCK DEMO para la prueba de vista.', error);
      
      // MOCK FALLBACK: Permite demostrar las vistas aunque el backend esté desconectado
      const isMockAdmin = email.includes('admin');
      
      await setToken(isMockAdmin ? 'mock-admin-token' : 'mock-nurse-token');
      setUser({ 
        id: isMockAdmin ? 1 : 2, 
        usuario: email.split('@')[0],
        email: email, 
        nombre_completo: isMockAdmin ? 'Dra. Administradora' : 'Lic. Enfermero Base', 
        roles: [{ nombre: isMockAdmin ? 'administrador' : 'enfermero' }], 
        activo: true 
      });
      
      setGuestMode(false);
      router.replace('/(tabs)/search');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: layout.spacing.lg, backgroundColor: colors.surfaceContainerLowest }}>
      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 28, color: colors.onSurface, marginBottom: layout.spacing.lg }}>
        ¡Bienvenido de nuevo!
      </Text>
      
      <Input 
        label="Usuario (Email)" 
        placeholder="ejemplo@ticos.com" 
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
      
      <Text 
        onPress={() => router.push('/(auth)/recovery')} 
        style={{ color: colors.primary, fontFamily: typography.fonts.medium, alignSelf: 'flex-end', marginBottom: layout.spacing.xl }}
      >
        ¿Olvidaste tu contraseña?
      </Text>
      
      <Button title="Ingresar" onPress={handleLogin} isLoading={isLoading} />
      
      <View style={{ marginTop: layout.spacing.xl, padding: layout.spacing.md, backgroundColor: colors.surfaceContainer, borderRadius: layout.radius.md }}>
         <Text style={{ fontFamily: typography.fonts.medium, color: colors.onSurfaceVariant }}>Tip de Demo de Roles:</Text>
         <Text style={{ fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
           Escribe "admin@ticos.com" para entrar a la vista Administrador, o cualquier otro correo para la vista de Enfermero.
         </Text>
      </View>
    </View>
  );
}
