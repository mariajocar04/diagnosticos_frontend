import { Tabs } from 'expo-router';
import { useAppTheme } from '../../src/styles/theme';
import { Search, Heart, Users } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors, typography } = useAppTheme();

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
          tabBarIcon: ({ color, size }) => (
            <Search size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="patients" 
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color, size }) => (
            <Users size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <Heart size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

