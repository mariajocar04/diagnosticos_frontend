import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAppTheme } from '../../src/styles/theme';

export default function TabsLayout() {
  const { colors, typography, layout } = useAppTheme();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.onSurfaceVariant,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: {
        fontFamily: typography.fonts.medium,
        fontSize: 12,
      }
    }}>
      <Tabs.Screen 
        name="search" 
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💖</Text>
          ),
        }}
      />
    </Tabs>
  );
}
