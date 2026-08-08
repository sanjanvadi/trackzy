import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/config/queryClient';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { hasCompletedOnboarding } from '@/src/services/onboarding.service';
import { LedgerProvider } from '@/src/contexts/LedgerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function RootLayoutNav() {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    let cancelled = false;

    const redirect = async () => {
      if (cancelled) return;
      if (initializing) return;

      const inAuthGroup = segments[0] === "(auth)";

      if (!user && !inAuthGroup) {

        const completed =
          await hasCompletedOnboarding();

        if (completed) {
          router.replace("/(auth)/login");
        } else {
          router.replace("/(auth)/onboarding");
        }

      } else if (user && inAuthGroup) {

        router.replace("/(tabs)");

      }
    };

    redirect();

    return () => {
      cancelled = true;
    };

  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
      <ThemeProvider>
        <AuthProvider>
          <LedgerProvider>
            <RootLayoutNav />
          </LedgerProvider>
        </AuthProvider>
      </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
