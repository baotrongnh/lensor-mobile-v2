/**
 * Login Screen - Simple & Clean
 * Hỗ trợ: Email/Password + OAuth (Google, Facebook, GitHub)
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     TextInput,
     TouchableOpacity,
     ActivityIndicator,
     Alert,
     ScrollView,
     KeyboardAvoidingView,
     Platform,
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
     const [formType, setFormType] = useState<'login' | 'register'>('login');
     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
     });
     const [errors, setErrors] = useState({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
     });

     const validateForm = () => {
          const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

          // Email validation
          if (!formData.email) {
               newErrors.email = 'Email is required';
          } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
               newErrors.email = 'Please enter a valid email';
          }

          // Password validation
          if (!formData.password) {
               newErrors.password = 'Password is required';
          } else if (formData.password.length < 6) {
               newErrors.password = 'Password must be at least 6 characters';
          }

          // Register validations
          if (formType === 'register') {
               if (!formData.name.trim()) {
                    newErrors.name = 'Full name is required';
               }
               if (!formData.confirmPassword) {
                    newErrors.confirmPassword = 'Please confirm password';
               } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
               }
          }

          setErrors(newErrors);
          return !Object.values(newErrors).some(err => err !== '');
     };

     const handleSubmit = async () => {
          if (!validateForm()) return;

          setLoading(true);
          try {
               if (formType === 'login') {
                    const { data, error } = await authHelpers.signInWithEmail(
                         formData.email,
                         formData.password
                    );

                    if (error) {
                         Alert.alert('Login Failed', error.message);
                    } else if (data.user) {
                         Alert.alert('Success', 'Login successful!');
                         router.replace('/(tabs)/forum');
                    }
               } else {
                    const { data, error } = await authHelpers.signUpWithEmail(
                         formData.name,
                         formData.email.toLowerCase().trim(),
                         formData.password
                    );

                    if (error) {
                         Alert.alert('Registration Failed', error.message);
                    } else if (data.user) {
                         Alert.alert('Success', 'Account created! Please check your email to verify.');
                         setFormType('login');
                         setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
                    }
               }
          } catch {
               Alert.alert('Error', 'An error occurred. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'github') => {
          setLoading(true);
          try {
               // Use Supabase OAuth like web version
               const { data, error, result } = await authHelpers.signInWithOAuth(provider);

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
          <KeyboardAvoidingView
               style={{ flex: 1 }}
               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
               <ScrollView
                    style={[styles.container, { backgroundColor: colors.background }]}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
               >
                    {/* Header */}
                    <View style={styles.header}>
                         <Text style={[styles.title, { color: colors.foreground }]}>
                              {formType === 'login' ? 'Welcome Back' : 'Create Account'}
                         </Text>
                    </View>

                    {/* OAuth Buttons */}
                    <View style={styles.oauthButtons}>
                         <TouchableOpacity
                              style={[styles.oauthBtn, { backgroundColor: '#DB4437' }]}
                              onPress={() => handleOAuthLogin('google')}
                              disabled={loading}
                         >
                              <Text style={styles.oauthIconText}>G</Text>
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={[styles.oauthBtn, { backgroundColor: '#1877F2' }]}
                              onPress={() => handleOAuthLogin('facebook')}
                              disabled={loading}
                         >
                              <Text style={styles.oauthIconText}>f</Text>
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={[styles.oauthBtn, { backgroundColor: '#24292e' }]}
                              onPress={() => handleOAuthLogin('github')}
                              disabled={loading}
                         >
                              <Text style={styles.oauthIconText}>
                                   <Text style={{ fontFamily: 'monospace' }}>⚙</Text>
                              </Text>
                         </TouchableOpacity>
                    </View>

                    {/* Separator */}
                    <View style={styles.separator}>
                         <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                         <Text style={[styles.separatorText, { color: colors.mutedForeground }]}>
                              OR CONTINUE WITH
                         </Text>
                         <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                         {formType === 'register' && (
                              <View style={styles.field}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
                                   {errors.name ? (
                                        <Text style={styles.error}>{errors.name}</Text>
                                   ) : null}
                                   <TextInput
                                        style={[
                                             styles.input,
                                             { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.name ? '#ef4444' : colors.border },
                                        ]}
                                        placeholder="John Doe"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={formData.name}
                                        onChangeText={(text) => {
                                             setFormData({ ...formData, name: text });
                                             setErrors({ ...errors, name: '' });
                                        }}
                                        editable={!loading}
                                   />
                              </View>
                         )}

                         <View style={styles.field}>
                              <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
                              {errors.email ? (
                                   <Text style={styles.error}>{errors.email}</Text>
                              ) : null}
                              <TextInput
                                   style={[
                                        styles.input,
                                        { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.email ? '#ef4444' : colors.border },
                                   ]}
                                   placeholder="you@example.com"
                                   placeholderTextColor={colors.mutedForeground}
                                   value={formData.email}
                                   onChangeText={(text) => {
                                        setFormData({ ...formData, email: text });
                                        setErrors({ ...errors, email: '' });
                                   }}
                                   keyboardType="email-address"
                                   autoCapitalize="none"
                                   editable={!loading}
                              />
                         </View>

                         <View style={styles.field}>
                              <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
                              {errors.password ? (
                                   <Text style={styles.error}>{errors.password}</Text>
                              ) : null}
                              <TextInput
                                   style={[
                                        styles.input,
                                        { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.password ? '#ef4444' : colors.border },
                                   ]}
                                   placeholder="••••••••"
                                   placeholderTextColor={colors.mutedForeground}
                                   value={formData.password}
                                   onChangeText={(text) => {
                                        setFormData({ ...formData, password: text });
                                        setErrors({ ...errors, password: '' });
                                   }}
                                   secureTextEntry
                                   editable={!loading}
                              />
                         </View>

                         {formType === 'register' && (
                              <View style={styles.field}>
                                   <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
                                   {errors.confirmPassword ? (
                                        <Text style={styles.error}>{errors.confirmPassword}</Text>
                                   ) : null}
                                   <TextInput
                                        style={[
                                             styles.input,
                                             { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.confirmPassword ? '#ef4444' : colors.border },
                                        ]}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => {
                                             setFormData({ ...formData, confirmPassword: text });
                                             setErrors({ ...errors, confirmPassword: '' });
                                        }}
                                        secureTextEntry
                                        editable={!loading}
                                   />
                              </View>
                         )}

                         {/* Submit Button */}
                         <TouchableOpacity
                              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                              onPress={handleSubmit}
                              disabled={loading}
                         >
                              {loading ? (
                                   <ActivityIndicator color={colors.primaryForeground} />
                              ) : (
                                   <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                                        {formType === 'login' ? 'Sign In' : 'Sign Up'}
                                   </Text>
                              )}
                         </TouchableOpacity>
                    </View>

                    {/* Toggle Form Type */}
                    <View style={styles.footer}>
                         <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                              {formType === 'login' ? "Don't have an account? " : 'Already have an account? '}
                         </Text>
                         <TouchableOpacity
                              onPress={() => {
                                   setFormType(formType === 'login' ? 'register' : 'login');
                                   setErrors({ name: '', email: '', password: '', confirmPassword: '' });
                              }}
                              disabled={loading}
                         >
                              <Text style={[styles.footerLink, { color: colors.primary }]}>
                                   {formType === 'login' ? 'Sign Up' : 'Sign In'}
                              </Text>
                         </TouchableOpacity>
                    </View>
               </ScrollView>
          </KeyboardAvoidingView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     content: {
          padding: Spacing.lg,
          paddingTop: 60,
     },
     header: {
          alignItems: 'center',
          marginBottom: Spacing.lg,
     },
     title: {
          fontSize: 28,
          fontWeight: 'bold',
     },
     oauthButtons: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.lg,
     },
     oauthBtn: {
          width: 50,
          height: 50,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
     },
     oauthIconText: {
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
     },
     separator: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.lg,
     },
     separatorLine: {
          flex: 1,
          height: 1,
     },
     separatorText: {
          fontSize: 11,
          marginHorizontal: Spacing.sm,
     },
     form: {
          gap: Spacing.md,
     },
     field: {
          gap: 6,
     },
     label: {
          fontSize: 14,
          fontWeight: '500',
     },
     error: {
          fontSize: 12,
          color: '#ef4444',
     },
     input: {
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 15,
     },
     submitBtn: {
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: Spacing.sm,
     },
     submitBtnText: {
          fontSize: 16,
          fontWeight: '600',
     },
     footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: Spacing.lg,
     },
     footerText: {
          fontSize: 14,
     },
     footerLink: {
          fontSize: 14,
          fontWeight: '600',
     },
});
