import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import '@/i18n';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DEV_CONFIG } from '@/lib/auth/devToken';
import { logger } from '@/lib/utils/logger';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // If using dev token, skip authentication and go directly to app
    if (DEV_CONFIG.USE_DEV_TOKEN) {
      setSession({
        access_token: DEV_CONFIG.DEV_ACCESS_TOKEN,
        token_type: 'bearer',
        user: {
          id: DEV_CONFIG.DEV_USER.id,
          email: DEV_CONFIG.DEV_USER.email,
          user_metadata: {
            full_name: DEV_CONFIG.DEV_USER.full_name,
            avatar_url: DEV_CONFIG.DEV_USER.avatar_url,
          },
        },
      } as Session);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Removed: Deep link handler for payment returns (now using WebView modal approach)

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';

    // Skip login redirect if using dev token
    if (DEV_CONFIG.USE_DEV_TOKEN) {
      if (inAuthGroup) {
        router.replace('/(tabs)/forum');
      }
      return;
    }

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/forum');
    }
  }, [session, segments, loading, router]);

  // Handle OAuth callback for login (Supabase)
  useEffect(() => {
    const handleAuthCallback = async (url: string) => {
      if (!url.includes('auth-callback')) return;

      const hashParams = url.split('#')[1];
      if (!hashParams) return;

      const params = new URLSearchParams(hashParams);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            logger.error('Auth callback error:', error);
            return;
          }

          if (data.session) {
            setSession(data.session);
            router.replace('/(tabs)/forum');
          }
        } catch (error) {
          logger.error('Failed to set session:', error);
        }
      }
    };

    // Listen for auth callback deep links
    const subscription = Linking.addEventListener('url', (event) => {
      handleAuthCallback(event.url);
    });

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthCallback(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return <>{children}</>;
}

function RootStack() {
  const { colors } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.foreground,
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: colors.background,
    },
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="product-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ headerShown: false }} />
      <Stack.Screen name="withdrawal" options={{ headerShown: false }} />
      <Stack.Screen name="sold-orders" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ headerShown: false }} />
      <Stack.Screen name="purchased-orders" options={{ headerShown: false }} />
      <Stack.Screen name="withdrawal-history" options={{ headerShown: false }} />
      <Stack.Screen name="create-ticket" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="my-posts" options={{ headerShown: false }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
      <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="saved-posts" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
