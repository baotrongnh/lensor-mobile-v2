/**
 * OAuth Callback Handler
 * Handles the OAuth redirect from providers and exchanges tokens
 */

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '@/lib/api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const params = useLocalSearchParams();

     useEffect(() => {
          handleOAuthCallback();
     }, []);

     const handleOAuthCallback = async () => {
          try {
               // Check for magic link code first
               const code = params.code as string;

               if (code) {
                    // Magic link flow - exchange code for session
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                         console.error('Code exchange error:', error);
                         router.replace('/login');
                         return;
                    }

                    if (data.session) {
                         // Session created successfully
                         // Sync cart if needed
                         const tempCart = await AsyncStorage.getItem('temp_cart');
                         if (tempCart) {
                              try {
                                   const items = JSON.parse(tempCart);
                                   const { cartApi } = await import('@/lib/api/cartApi');
                                   for (const item of items) {
                                        await cartApi.addItem({ productId: item.productId, quantity: item.quantity });
                                   }
                                   await AsyncStorage.removeItem('temp_cart');
                              } catch (e) {
                                   console.error('Cart sync error:', e);
                              }
                         }

                         router.replace('/(tabs)/forum');
                         return;
                    }
               }

               // OAuth flow - extract tokens from URL hash or query params
               const accessToken = params.access_token as string;
               const refreshToken = params.refresh_token as string;

               if (!accessToken || !refreshToken) {
                    router.replace('/login');
                    return;
               }

               // Step 2: Exchange tokens for formatted user data
               const userData = await authApi.exchangeOAuthTokens(accessToken, refreshToken);

               // Save tokens and user data
               await AsyncStorage.setItem('access_token', userData.access_token);
               await AsyncStorage.setItem('refresh_token', userData.refresh_token);
               await AsyncStorage.setItem('user', JSON.stringify(userData.user));

               // Navigate to main app
               router.replace('/(tabs)/forum');
          } catch (error) {
               console.error('Auth callback error:', error);
               router.replace('/login');
          }
     };

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <ActivityIndicator size="large" color={colors.primary} />
               <Text style={[styles.text, { color: colors.foreground }]}>
                    Completing sign in...
               </Text>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
     },
     text: {
          fontSize: 16,
          fontWeight: '500',
     },
});
