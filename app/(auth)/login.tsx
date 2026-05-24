import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';
import { useAppTheme } from '../../src/styles/theme';

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
      
    } catch (error: any) {
      console.warn('Fallo en API de login:', error);
      const message = 'No se pudo iniciar sesión. Verifica tus credenciales y la conexión.';
      Alert.alert('Error de autenticación', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: layout.spacing.lg, backgroundColor: colors.surfaceContainerLowest }}>
      <View style={{ alignItems: 'center', marginBottom: layout.spacing.xl, marginTop: layout.spacing.lg }}>
        <View style={{ 
          backgroundColor: '#ffffff', // Fondo blanco para que el JPEG se vea bien en tema oscuro si tiene fondo
          padding: 8, 
          borderRadius: 20, 
          marginBottom: layout.spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Image 
            source={require('../../assets/images/logo.jpeg')} 
            style={{ 
              width: 120, 
              height: 120, 
              borderRadius: 16 
            }} 
            resizeMode="contain"
          />
        </View>
        <Text style={{ fontFamily: typography.fonts.bold, fontSize: 28, color: colors.onSurface, textAlign: 'center' }}>
          TICOS
        </Text>
        <Text style={{ fontFamily: typography.fonts.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
          ¡Bienvenido de nuevo!
        </Text>
      </View>
      
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
      
      
    </View>
  );
}
