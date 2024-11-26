import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "react-native";
import { UserProvider, useUser } from "./context/userContext";

function ProtectedLayout({ children }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";

      console.log("Current segments:", segments);
      console.log("Auth status:", { user: !!user, inAuthGroup, inTabsGroup });

      if (!user) {
        if (segments.length > 0 && !inAuthGroup) {
          router.replace("/");
        }
      } else {
        if (segments.length > 0 && !inTabsGroup) {
          router.replace("/(tabs)");
        }
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return null;
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
            gestureEnabled: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />
        </Stack>
      </ProtectedLayout>
    </UserProvider>
  );
}
