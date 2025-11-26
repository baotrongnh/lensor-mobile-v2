import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { DEV_CONFIG } from '@/lib/auth/devToken';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 30000,
     headers: {
          'Content-Type': 'application/json',
     },
});

apiClient.interceptors.request.use(
     async (config) => {
          try {
               // If using dev token, use it directly
               if (DEV_CONFIG.USE_DEV_TOKEN) {
                    config.headers.Authorization = `Bearer ${DEV_CONFIG.DEV_ACCESS_TOKEN}`;
                    return config;
               }

               // Otherwise, get token from Supabase session
               const { data: { session } } = await supabase.auth.getSession();
               if (session?.access_token) {
                    config.headers.Authorization = `Bearer ${session.access_token}`;
               }
          } catch (error) {
               console.error('Failed to get token:', error);
          }
          return config;
     },
     (error) => {
          return Promise.reject(error);
     }
);

apiClient.interceptors.response.use(
     (response) => response,
     async (error) => {
          // Log detailed error for debugging
          if (error.response) {
               console.error('❌ API Error:', {
                    status: error.response.status,
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                    response: error.response.data
               });
          }

          if (error.response?.status === 401) {
               // Only sign out if not using dev token
               if (!DEV_CONFIG.USE_DEV_TOKEN) {
                    await supabase.auth.signOut();
               }
          }
          return Promise.reject(error);
     }
);
