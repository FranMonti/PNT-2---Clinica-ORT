import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from "react-native";
import { UserProvider, useUser } from './context/userContext';

function ProtectedLayout({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      // Verificamos el segmento actual
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";
      
      console.log('Current segments:', segments);
      console.log('Auth status:', { user: !!user, inAuthGroup, inTabsGroup });

      if (!user) {
        // Si no hay usuario, redirigir al login excepto si ya está ahí
        if (segments.length > 0 && !inAuthGroup) {
          router.replace("/");
        }
      } else {
        // Si hay usuario, asegurar que esté en tabs excepto durante la transición inicial
        if (segments.length > 0 && !inTabsGroup) {
          router.replace("/(tabs)");
        }
      }
    }
  }, [user, loading, segments]);

  // Opcional: Puedes mostrar un loading mientras se verifica el estado
  if (loading) {
    return null; // o un componente de loading
  }

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
      <ProtectedLayout>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: false // Deshabilitamos gestos para todas las pantallas
          }}
        >
          {/* Ruta del login */}
          <Stack.Screen 
            name="index"
            options={{
              gestureEnabled: false,
              // Opcional: Prevenir que el usuario regrese al login si está autenticado
              headerBackVisible: false
            }}
          />
          
          {/* Grupo de tabs para usuarios autenticados */}
          <Stack.Screen 
            name="(tabs)"
            options={{
              gestureEnabled: false,
              headerBackVisible: false // Prevenir navegación manual a login
            }}
          />

          {/* Si tienes otras rutas, puedes agregarlas aquí */}
        </Stack>
      </ProtectedLayout>
    </UserProvider>
  );
}