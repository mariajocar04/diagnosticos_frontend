import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { useAppTheme } from '../../styles/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, onFocus, onBlur, ...props }) => {
  const { colors, typography, layout } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={{ marginBottom: layout.spacing.md }}>
      <Text style={{
        fontFamily: typography.fonts.semiBold,
        fontSize: 12,
        color: colors.onSurface,
        marginBottom: layout.spacing.xs,
        letterSpacing: 0.5,
      }}>
        {label}
      </Text>
      <TextInput
        style={[{
          height: layout.touchTarget,
          borderWidth: isFocused ? 2 : 1,
          borderColor: error ? colors.error : (isFocused ? colors.primary : colors.outlineVariant),
          borderRadius: layout.radius.sm,
          paddingHorizontal: layout.spacing.md,
          color: colors.onSurface,
          fontFamily: typography.fonts.regular,
          fontSize: 16,
          backgroundColor: colors.surface,
        }, style]}
        placeholderTextColor={colors.onSurfaceVariant}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <Text style={{
          fontFamily: typography.fonts.regular,
          fontSize: 12,
          color: colors.error,
          marginTop: layout.spacing.xs / 2,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};
