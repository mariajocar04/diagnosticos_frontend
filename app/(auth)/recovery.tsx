import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authService } from '../../src/services/authService';

type Step = 'REQUEST' | 'VERIFY' | 'RESET';

export default function RecoveryScreen() {
  const { colors, typography, layout } = useAppTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>('REQUEST');
  const [loading, setLoading] = useState(false);

  // Formularios
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Token
  const [resetToken, setResetToken] = useState('');

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await authService.requestOTP(email);
      setStep('VERIFY');
      Alert.alert('Código enviado', 'Revisa tu correo para obtener el código de 8 dígitos.');
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'No se pudo solicitar el código. Verifica tu correo.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length < 8) {
      Alert.alert('Error', 'Ingresa un código válido de 8 dígitos');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verifyOTP(email, otp);
      setResetToken(response.reset_token);
      setStep('RESET');
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Código inválido o expirado.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      Alert.alert('¡Éxito!', 'Tu contraseña ha sido actualizada.', [
        { text: 'Ir al Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Error al cambiar la contraseña.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLowest }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => {
          if (step === 'REQUEST') router.back();
          else if (step === 'VERIFY') setStep('REQUEST');
          else if (step === 'RESET') setStep('VERIFY');
        }}
      >
        <ChevronLeft size={28} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {step === 'REQUEST' && (
          <>
            <Text style={[styles.title, { fontFamily: typography.fonts.bold, color: colors.onSurface }]}>
              Recuperar Acceso
            </Text>
            <Text style={[styles.subtitle, { fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }]}>
              Ingresa tu correo institucional y te enviaremos un código seguro para recuperar tu cuenta.
            </Text>
            <Input 
              label="Correo Electrónico" 
              placeholder="juan@ticos.com" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <Button 
              title="Enviar Código" 
              onPress={handleRequestOTP} 
              isLoading={loading}
              style={{ marginTop: layout.spacing.lg }} 
            />
          </>
        )}

        {step === 'VERIFY' && (
          <>
            <Text style={[styles.title, { fontFamily: typography.fonts.bold, color: colors.onSurface }]}>
              Verificar Código
            </Text>
            <Text style={[styles.subtitle, { fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }]}>
              Hemos enviado un código de 8 dígitos a <Text style={{ fontFamily: typography.fonts.bold }}>{email}</Text>. Ingrésalo a continuación.
            </Text>
            <Input 
              label="Código OTP" 
              placeholder="12345678" 
              keyboardType="number-pad" 
              maxLength={8}
              value={otp}
              onChangeText={setOtp}
              editable={!loading}
            />
            <Button 
              title="Verificar" 
              onPress={handleVerifyOTP} 
              isLoading={loading}
              style={{ marginTop: layout.spacing.lg }} 
            />
          </>
        )}

        {step === 'RESET' && (
          <>
            <Text style={[styles.title, { fontFamily: typography.fonts.bold, color: colors.onSurface }]}>
              Nueva Contraseña
            </Text>
            <Text style={[styles.subtitle, { fontFamily: typography.fonts.regular, color: colors.onSurfaceVariant }]}>
              Elige una contraseña segura que puedas recordar.
            </Text>
            <Input 
              label="Nueva Contraseña" 
              placeholder="********" 
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />
            <Input 
              label="Confirmar Contraseña" 
              placeholder="********" 
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <Button 
              title="Guardar Contraseña" 
              onPress={handleResetPassword} 
              isLoading={loading}
              style={{ marginTop: layout.spacing.lg }} 
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 22,
  },
});
