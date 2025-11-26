/**
 * Login Screen - Google OAuth Only
 * Đăng nhập chỉ bằng Google
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     TouchableOpacity,
     ActivityIndicator,
     Alert,
     ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { authHelpers, supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// Complete the web browser session when component unmounts
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const [loading, setLoading] = useState(false);

     const handleGoogleLogin = async () => {
          setLoading(true);
          try {
               // Use Supabase OAuth for Google login
               const { data, error, result } = await authHelpers.signInWithOAuth('google');

               if (error) {
                    Alert.alert('Login Failed', error.message);
                    setLoading(false);
                    return;
               }

               if (result?.type === 'success' && result.url) {
                    // OAuth success, processing tokens

                    // Parse tokens from callback URL
                    const url = result.url;
                    const hashParams = url.split('#')[1];

                    if (hashParams) {
                         const params = new URLSearchParams(hashParams);
                         const accessToken = params.get('access_token');
                         const refreshToken = params.get('refresh_token');

                         if (accessToken && refreshToken) {
                              // Set session with Supabase
                              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                                   access_token: accessToken,
                                   refresh_token: refreshToken,
                              });

                              if (sessionError) {
                                   console.error('Session error:', sessionError);
                                   Alert.alert('Login Failed', sessionError.message);
                              } else if (sessionData.session) {
                                   console.log('Login successful!');
                                   Alert.alert('Success', 'Login successful!');
                                   router.replace('/(tabs)/forum');
                              }
                         } else {
                              Alert.alert('Error', 'Failed to get authentication tokens');
                         }
                    } else {
                         Alert.alert('Error', 'Invalid callback URL');
                    }
               } else if (result?.type === 'cancel') {
                    Alert.alert('Cancelled', 'Login was cancelled');
               }
          } catch (error) {
               console.error('OAuth error:', error);
               Alert.alert('Error', 'Failed to login. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     return (
          <ScrollView
               style={[styles.container, { backgroundColor: colors.background }]}
               contentContainerStyle={styles.content}
          >
               {/* Header */}
               <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         Welcome to Lensor
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                         Sign in with your Google account to continue
                    </Text>
               </View>

               {/* Logo or Icon Area */}
               <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
                         <Text style={[styles.logoText, { color: colors.primary }]}>L</Text>
                    </View>
               </View>

               {/* Google Sign In Button */}
               <TouchableOpacity
                    style={[styles.googleBtn, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}
                    onPress={handleGoogleLogin}
                    disabled={loading}
               >
                    {loading ? (
                         <ActivityIndicator color="#DB4437" />
                    ) : (
                         <>
                              <View style={styles.googleIcon}>
                                   <Text style={styles.googleIconText}>G</Text>
                              </View>
                              <Text style={styles.googleBtnText}>Continue with Google</Text>
                         </>
                    )}
               </TouchableOpacity>

               {/* Footer */}
               <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                         By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
               </View>
          </ScrollView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     content: {
          flex: 1,
          padding: Spacing.xl,
          justifyContent: 'center',
     },
     header: {
          alignItems: 'center',
          marginBottom: Spacing.xl * 2,
     },
     title: {
          fontSize: 32,
          fontWeight: 'bold',
          marginBottom: Spacing.sm,
          textAlign: 'center',
     },
     subtitle: {
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 22,
     },
     logoContainer: {
          alignItems: 'center',
          marginBottom: Spacing.xl * 2,
     },
     logoCircle: {
          width: 100,
          height: 100,
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
     },
     logoText: {
          fontSize: 48,
          fontWeight: 'bold',
     },
     googleBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          gap: Spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
     },
     googleIcon: {
          width: 24,
          height: 24,
          borderRadius: 4,
          backgroundColor: '#DB4437',
          alignItems: 'center',
          justifyContent: 'center',
     },
     googleIconText: {
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
     },
     googleBtnText: {
          fontSize: 16,
          fontWeight: '600',
          color: '#333',
     },
     footer: {
          marginTop: Spacing.xl * 2,
          alignItems: 'center',
     },
     footerText: {
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 18,
          paddingHorizontal: Spacing.lg,
     },
});
