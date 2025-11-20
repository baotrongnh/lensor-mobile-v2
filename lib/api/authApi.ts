import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || '';

// Create a separate axios instance for auth endpoints (no token required)
const authClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 30000,
     headers: {
          'Content-Type': 'application/json',
     },
});

export interface OAuthUrlResponse {
     url: string;
     provider: string;
}

export interface OAuthExchangeResponse {
     user: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
     };
     access_token: string;
     refresh_token: string;
}

export const authApi = {
     /**
      * Step 1: Get OAuth URL for provider
      * @param provider - 'google' | 'facebook' | 'github'
      * @param redirectTo - Frontend callback URL
      */
     getOAuthUrl: async (provider: 'google' | 'facebook' | 'github', redirectTo: string) => {
          const response = await authClient.post<{ data: OAuthUrlResponse }>(`${API_PREFIX}/auth/oauth`, {
               provider,
               redirectTo,
          });
          // Backend wraps response in { data: { ... } }
          return response.data.data;
     },

     /**
      * Step 2: Exchange OAuth tokens for formatted user data
      * @param accessToken - Access token from OAuth callback
      * @param refreshToken - Refresh token from OAuth callback
      */
     exchangeOAuthTokens: async (accessToken: string, refreshToken: string) => {
          const response = await authClient.post<{ data: OAuthExchangeResponse }>(
               `${API_PREFIX}/auth/callback/exchange`,
               {
                    access_token: accessToken,
                    refresh_token: refreshToken,
               }
          );
          // Backend wraps response in { data: { ... } }
          return response.data.data;
     },
};
