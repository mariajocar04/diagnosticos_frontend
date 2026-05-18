import { Stack } from 'expo-router';

export default function TabsLayout() {
  // Este layout de demostración se utiliza antes de implementar el sistema de 
  // Bottom Tabs real que requiere el ícono de escudo y manejo dinámico.
  // Permite renderizar y probar las vistas como un stack normal.
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
