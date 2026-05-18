import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function RecoveryScreen() {
  const { colors, typography, layout } = useAppTheme();
  return (
    <View style={{ flex: 1, padding: layout.spacing.lg, backgroundColor: colors.surfaceContainerLowest }}>
      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onSurface, marginBottom: layout.spacing.xs }}>Recuperar Acceso</Text>
      <Text style={{ fontFamily: typography.fonts.regular, marginBottom: layout.spacing.lg, color: colors.onSurfaceVariant, lineHeight: 20 }}>Ingresa tu correo institucional y te enviaremos instrucciones seguras para recuperar tu cuenta.</Text>
      <Input label="Correo Electrónico" placeholder="juan@ticos.com" keyboardType="email-address" />
      <Button title="Enviar instrucciones" onPress={() => {}} style={{ marginTop: layout.spacing.md }} />
    </View>
  );
}
