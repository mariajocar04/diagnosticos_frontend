import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useAppTheme } from '../../styles/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outlined';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  style, 
  disabled, 
  ...props 
}) => {
  const { colors, typography, layout } = useAppTheme();

  const getContainerStyle = () => {
    const baseStyle = {
      height: layout.touchTarget,
      borderRadius: layout.radius.sm,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      paddingHorizontal: layout.spacing.md,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.secondary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontFamily: typography.fonts.bold,
      fontSize: 14,
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.onPrimary,
        };
      case 'outlined':
        return {
          ...baseStyle,
          color: colors.secondary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity 
      style={[getContainerStyle(), style]} 
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outlined' ? colors.secondary : colors.onPrimary} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
