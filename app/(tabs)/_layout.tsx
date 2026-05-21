import { Tabs } from 'expo-router';
import { useAppTheme } from '../../src/styles/theme';
import { useAuthStore } from '../../src/store/authStore';
import { Search, Heart, Users, User, Shield } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors, typography } = useAppTheme();
  const { isGuest, user } = useAuthStore();
  
  const is_admin = user?.roles?.some(r => r.nombre === 'administrador');

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
          href: isGuest ? null : undefined, // Ocultar pestaña para invitados
          tabBarIcon: ({ color, size }) => (
            <Users size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favoritos',
          href: isGuest ? null : undefined, // Ocultar pestaña para invitados
          tabBarIcon: ({ color, size }) => (
            <Heart size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="admin" 
        options={{
          title: 'Admin',
          href: is_admin ? undefined : null, // Ocultar si no es admin
          tabBarIcon: ({ color, size }) => (
            <Shield size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

