import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useAppTheme } from '../../styles/theme';

interface BadgeProps {
  label: string;
  variant?: 'enfermero' | 'administrador' | 'success' | 'warning' | 'error' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const { colors, typography, layout } = useAppTheme();

  const getStyle = () => {
    switch (variant) {
      case 'enfermero':
        return { bg: `${colors.primary}1A`, text: colors.primary }; // 10% opacity primary
      case 'administrador':
        return { bg: `${colors.secondary}1A`, text: colors.secondary };
      case 'success':
        return { bg: `${colors.success}1A`, text: colors.success };
      case 'warning':
        return { bg: `${colors.warning}1A`, text: colors.warning };
      case 'error':
        return { bg: `${colors.error}1A`, text: colors.error };
      case 'neutral':
      default:
        return { bg: colors.surfaceContainer, text: colors.onSurfaceVariant };
    }
  };

  const themeStyle = getStyle();

  return (
    <View style={[{
      backgroundColor: themeStyle.bg,
      paddingHorizontal: layout.spacing.sm,
      paddingVertical: layout.spacing.base,
      borderRadius: layout.radius.pill,
      alignSelf: 'flex-start',
    }, style]}>
      <Text style={{
        fontFamily: typography.fonts.semiBold,
        fontSize: 12,
        color: themeStyle.text,
      }}>
        {label}
      </Text>
    </View>
  );
};
