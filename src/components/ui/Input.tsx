import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../styles/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  style, 
  onFocus, 
  onBlur, 
  secureTextEntry, 
  isPassword, 
  ...props 
}) => {
  const { colors, typography, layout } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isPasswordField = isPassword || secureTextEntry;
  const isSecure = isPasswordField && !showPassword;

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
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[{
            height: layout.touchTarget,
            borderWidth: isFocused ? 2 : 1,
            borderColor: error ? colors.error : (isFocused ? colors.primary : colors.outlineVariant),
            borderRadius: layout.radius.sm,
            paddingLeft: layout.spacing.md,
            paddingRight: isPasswordField ? 44 : layout.spacing.md,
            color: colors.onSurface,
            fontFamily: typography.fonts.regular,
            fontSize: 16,
            backgroundColor: colors.surface,
          }, style]}
          placeholderTextColor={colors.onSurfaceVariant}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPasswordField && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              right: 12,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.onSurfaceVariant} />
            ) : (
              <Eye size={20} color={colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>
        )}
      </View>
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
