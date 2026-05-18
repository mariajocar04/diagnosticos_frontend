import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../src/styles/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function RegisterScreen() {
  const { colors, typography, layout } = useAppTheme();
  return (
    <View style={{ flex: 1, padding: layout.spacing.lg, backgroundColor: colors.surfaceContainerLowest }}>
      <Text style={{ fontFamily: typography.fonts.bold, fontSize: 24, color: colors.onSurface, marginBottom: layout.spacing.lg }}>Crea tu cuenta clínica</Text>
      <Input label="Nombre Completo" placeholder="Ej. Juan Pérez" />
      <Input label="Correo Electrónico" placeholder="juan@ticos.com" keyboardType="email-address" />
      <Input label="Contraseña" placeholder="********" secureTextEntry />
      <Button title="Registrarse" onPress={() => {}} style={{ marginTop: layout.spacing.md }} />
    </View>
  );
}
