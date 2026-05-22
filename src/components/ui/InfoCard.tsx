import React from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../styles/theme';

interface InfoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ children, style, onPress }) => {
  const { colors, layout } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: layout.spacing.md,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};
