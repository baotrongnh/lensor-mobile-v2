import { apiClient } from './client';
import { endpoints } from './endpoints';
import {
     FollowNotificationSettings,
     FollowResponse,
     FollowListResponse,
     CheckFollowResponseData,
     Follow,
} from '../../types/follow';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get current user ID from stored user data
const getCurrentUserId = async (): Promise<string | null> => {
     try {
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
               const user = JSON.parse(userJson);
               return user?.id || null;
          }
          return null;
     } catch {
          return null;
     }
};

// Helper to normalize follow data structure
// Backend sometimes returns flat structure (name, avatar) instead of nested (following.name, following.avatarUrl)
// type parameter: 'followers' or 'following' to know which nested object to create
const normalizeFollowData = (follow: Follow, type: 'followers' | 'following' = 'following'): Follow => {
     // For following list: create nested 'following' object
     if (type === 'following') {
          // If flat structure with name/avatar, convert to nested
          if (follow.name && !follow.following) {
               return {
                    ...follow,
                    following: {
                         id: follow.followingId,
                         name: follow.name,
                         avatarUrl: follow.avatar,
                         email: follow.email || '',
                    },
               };
          }
          // If nested structure exists but missing avatarUrl, try to use avatar
          if (follow.following && !follow.following.avatarUrl && follow.avatar) {
               return {
                    ...follow,
                    following: {
                         ...follow.following,
                         avatarUrl: follow.avatar,
                    },
               };
          }
          // If no user info at all, create placeholder
          if (!follow.following) {
               return {
                    ...follow,
                    following: {
                         id: follow.followingId,
                         name: follow.name || 'User',
                         avatarUrl: follow.avatar,
                         email: follow.email || '',
                    },
               };
          }
     }

     // For followers list: create nested 'follower' object
     if (type === 'followers') {
          // If flat structure with name/avatar, convert to nested
          if (follow.name && !follow.follower) {
               return {
                    ...follow,
                    follower: {
                         id: follow.followerId,
                         name: follow.name,
                         avatarUrl: follow.avatar,
                         email: follow.email || '',
                    },
               };
          }
          // If nested structure exists but missing avatarUrl, try to use avatar
          if (follow.follower && !follow.follower.avatarUrl && follow.avatar) {
               return {
                    ...follow,
                    follower: {
                         ...follow.follower,
                         avatarUrl: follow.avatar,
                    },
               };
          }
          // If no user info at all, create placeholder
          if (!follow.follower) {
               return {
                    ...follow,
                    follower: {
                         id: follow.followerId,
                         name: follow.name || 'User',
                         avatarUrl: follow.avatar,
                         email: follow.email || '',
                    },
               };
          }
     }

     return follow;
};

export const followUser = async (
     userId: string,
     settings?: FollowNotificationSettings
): Promise<FollowResponse> => {
     const response = await apiClient.post(endpoints.userFollows.follow(userId), settings || {});
     return response.data;
};

export const unfollowUser = async (userId: string): Promise<{ message: string }> => {
     const response = await apiClient.delete(endpoints.userFollows.unfollow(userId));
     return response.data;
};

export const updateFollowSettings = async (
     userId: string,
     settings: Partial<FollowNotificationSettings>
): Promise<FollowResponse> => {
     const response = await apiClient.patch(endpoints.userFollows.updateSettings(userId), settings);
     return response.data;
};

export const checkIfFollowing = async (userId: string): Promise<CheckFollowResponseData> => {
     const response = await apiClient.get(endpoints.userFollows.check(userId));
     return response.data;
};

export const getMyFollowers = async (): Promise<FollowListResponse> => {
     const response = await apiClient.get(endpoints.userFollows.myFollowers);
     // Handle different response structures
     let dataArray = response.data.data;

     // If response has nested structure like { data: { followers: [...] } }
     if (dataArray && typeof dataArray === 'object' && 'followers' in dataArray) {
          dataArray = dataArray.followers;
     }

     // Normalize data structure
     const normalized = {
          data: Array.isArray(dataArray)
               ? dataArray.map(item => normalizeFollowData(item, 'followers'))
               : [],
     };
     return normalized;
};

export const getMyFollowing = async (): Promise<FollowListResponse> => {
     const response = await apiClient.get(endpoints.userFollows.myFollowing);
     // Handle different response structures
     let dataArray = response.data.data;

     // If response has nested structure like { data: { following: [...] } }
     if (dataArray && typeof dataArray === 'object' && 'following' in dataArray) {
          dataArray = dataArray.following;
     }

     // Normalize data structure
     const normalized = {
          data: Array.isArray(dataArray)
               ? dataArray.map(item => normalizeFollowData(item, 'following'))
               : [],
     };
     return normalized;
};

export const getUserFollowers = async (userId: string): Promise<FollowListResponse> => {
     // Check if requesting own followers
     const currentUserId = await getCurrentUserId();
     if (currentUserId && currentUserId === userId) {
          return getMyFollowers();
     }
     const response = await apiClient.get(endpoints.userFollows.userFollowers(userId));
     // Handle different response structures
     let dataArray = response.data.data;

     // If response has nested structure like { data: { followers: [...] } }
     if (dataArray && typeof dataArray === 'object' && 'followers' in dataArray) {
          dataArray = dataArray.followers;
     }

     // Normalize data structure
     const normalized = {
          data: Array.isArray(dataArray)
               ? dataArray.map(item => normalizeFollowData(item, 'followers'))
               : [],
     };
     return normalized;
};

export const getUserFollowing = async (userId: string): Promise<FollowListResponse> => {
     // Check if requesting own following
     const currentUserId = await getCurrentUserId();
     if (currentUserId && currentUserId === userId) {
          return getMyFollowing();
     }
     const response = await apiClient.get(endpoints.userFollows.userFollowing(userId));
     // Handle different response structures
     let dataArray = response.data.data;

     // If response has nested structure like { data: { following: [...] } }
     if (dataArray && typeof dataArray === 'object' && 'following' in dataArray) {
          dataArray = dataArray.following;
     }

     // Normalize data structure
     const normalized = {
          data: Array.isArray(dataArray)
               ? dataArray.map(item => normalizeFollowData(item, 'following'))
               : [],
     };
     return normalized;
};

// Note: Backend doesn't have a dedicated stats endpoint
// Use getUserFollowers and getUserFollowing to calculate stats
// export const getUserFollowStats = async (userId: string): Promise<FollowStatsResponse> => {
//      const response = await apiClient.get(endpoints.userFollows.userStats(userId));
//      return response.data;
// };
