import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { DEV_CONFIG } from './auth/devToken';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
          storage: AsyncStorage,
          autoRefreshToken: !DEV_CONFIG.USE_DEV_TOKEN,
          persistSession: !DEV_CONFIG.USE_DEV_TOKEN,
          detectSessionInUrl: false,
     },
     global: {
          headers: DEV_CONFIG.USE_DEV_TOKEN ? {
               Authorization: `Bearer ${DEV_CONFIG.DEV_ACCESS_TOKEN}`,
          } : {},
     },
});

export const authHelpers = {
     signInWithEmail: async (email: string, password: string) => {
          const { data, error } = await supabase.auth.signInWithPassword({
               email,
               password,
          });
          return { data, error };
     },

     signUpWithEmail: async (fullName: string, email: string, password: string) => {
          const { data, error } = await supabase.auth.signUp({
               email,
               password,
               options: {
                    data: {
                         full_name: fullName,
                    },
                    emailRedirectTo: 'lensor://auth-callback',
               },
          });
          return { data, error };
     },

     signInWithOAuth: async (provider: 'google' | 'facebook' | 'github') => {
          try {
               const redirectUrl = 'lensor://auth-callback';

               const { data, error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                         redirectTo: redirectUrl,
                         skipBrowserRedirect: true,  // We handle browser manually
                    },
               });

               if (error) {
                    console.error('OAuth error:', error);
                    return { data, error, result: null };
               }

               if (data?.url) {
                    console.log('Opening OAuth URL:', data.url);
                    const result = await WebBrowser.openAuthSessionAsync(
                         data.url,
                         redirectUrl
                    );
                    console.log('Browser result:', result);

                    return { data, error: null, result };
               }

               return { data, error, result: null };
          } catch (err) {
               console.error('Exception in signInWithOAuth:', err);
               return {
                    data: null,
                    error: err as Error,
                    result: null,
               };
          }
     },

     signOut: async () => {
          const { error } = await supabase.auth.signOut();
          return { error };
     },

     getCurrentUser: async () => {
          return supabase.auth.getUser();
     },

     getSession: async () => {
          return supabase.auth.getSession();
     },

     onAuthStateChange: (callback: (event: string, session: any) => void) => {
          return supabase.auth.onAuthStateChange(callback);
     },

     resetPassword: async (email: string) => {
          const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
               redirectTo: 'mobile://reset-password',
          });
          return { data, error };
     },
};
