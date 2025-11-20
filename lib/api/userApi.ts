import { apiClient } from './client';

const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX || '';

export const userApi = {
     getUserProfile: async (userId: string) => {
          const res = await apiClient.get(`${API_PREFIX}/users/${userId}`);
          return res.data;
     },

     followUser: async (userId: string) => {
          const res = await apiClient.post(`${API_PREFIX}/user-follows/${userId}`);
          return res.data;
     },

     unfollowUser: async (userId: string) => {
          const res = await apiClient.delete(`${API_PREFIX}/user-follows/${userId}`);
          return res.data;
     },
};
