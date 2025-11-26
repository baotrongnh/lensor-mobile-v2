import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ArrowLeft, MessageCircle, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { userApi } from '@/lib/api/userApi';
import { getUserFollowers, getUserFollowing } from '@/lib/api/followApi';
import { useChatStore } from '@/stores/chatStore';
import { logger } from '@/lib/utils/logger';
import { useUserStore } from '@/stores/userStore';

interface UserProfile {
     id: string;
     name: string;
     email: string;
     avatarUrl?: string;
     bio?: string;
}

export default function UserProfileScreen() {
     const { id } = useLocalSearchParams();
     const { colors } = useTheme();
     const currentUser = useUserStore(state => state.user);
     const [profile, setProfile] = useState<UserProfile | null>(null);
     const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
     const [loading, setLoading] = useState(true);
     const [creatingChat, setCreatingChat] = useState(false);
     const { createDirectChat } = useChatStore();

     const isOwnProfile = currentUser?.id === id;

     const fetchUserProfile = async () => {
          if (!id) return;
          try {
               setLoading(true);
               const [profileRes, followersRes, followingRes] = await Promise.all([
                    userApi.getUserProfile(id as string),
                    getUserFollowers(id as string),
                    getUserFollowing(id as string),
               ]);

               logger.log('Profile response:', profileRes);

               // Set profile from user data - handle different response structures
               if (profileRes?.data) {
                    const userData = profileRes.data.user || profileRes.data;

                    if (userData && userData.id) {
                         setProfile({
                              id: userData.id,
                              name: userData.name || 'Unknown User',
                              email: userData.email || '',
                              avatarUrl: userData.avatarUrl || userData.avatar,
                              bio: userData.bio,
                         });

                         setStats({
                              followers: followersRes.data.length || 0,
                              following: followingRes.data.length || 0,
                              posts: profileRes.data.posts?.length || 0,
                         });
                    } else {
                         throw new Error('Invalid user data structure');
                    }
               } else {
                    throw new Error('No data in response');
               }
          } catch (error) {
               logger.error('Error fetching user profile:', error);
               Alert.alert('Error', 'Failed to load user profile');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchUserProfile();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [id]);

     const handleMessage = async () => {
          if (!id || !profile) return;

          // Don't create chat via API - just navigate and let chat screen handle it
          // The chat screen will find existing room or allow creating one by sending first message
          router.push(`/chat-detail/${id}`);
     };

     if (loading) {
          return (
               <>
                    <Stack.Screen options={{ headerShown: false }} />
                    <View style={[styles.container, { backgroundColor: colors.background }]}>
                         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                   <ArrowLeft size={24} color={colors.foreground} />
                              </TouchableOpacity>
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
                              <View style={{ width: 24 }} />
                         </View>
                         <View style={styles.centered}>
                              <ActivityIndicator size="large" color={colors.primary} />
                         </View>
                    </View>
               </>
          );
     }

     if (!profile) {
          return (
               <>
                    <Stack.Screen options={{ headerShown: false }} />
                    <View style={[styles.container, { backgroundColor: colors.background }]}>
                         <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                   <ArrowLeft size={24} color={colors.foreground} />
                              </TouchableOpacity>
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
                              <View style={{ width: 24 }} />
                         </View>
                         <View style={styles.centered}>
                              <Text style={[styles.errorText, { color: colors.foreground }]}>User not found</Text>
                         </View>
                    </View>
               </>
          );
     }

     return (
          <>
               <Stack.Screen options={{ headerShown: false }} />
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                              <ArrowLeft size={24} color={colors.foreground} />
                         </TouchableOpacity>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
                         <View style={{ width: 24 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                         <Card style={styles.profileCard}>
                              {/* Cover gradient */}
                              <View style={[styles.coverGradient, { backgroundColor: colors.primary }]} />

                              {/* Avatar */}
                              <View style={styles.avatarContainer}>
                                   <Avatar
                                        source={profile.avatarUrl}
                                        name={profile.name || profile.email?.charAt(0) || 'U'}
                                        size={100}
                                   />
                              </View>

                              {/* User Info */}
                              <View style={styles.userInfo}>
                                   <Text style={[styles.userName, { color: colors.foreground }]}>
                                        {profile.name}
                                   </Text>
                                   <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
                                        {profile.email}
                                   </Text>
                                   {profile.bio && (
                                        <Text style={[styles.userBio, { color: colors.foreground }]}>
                                             {profile.bio}
                                        </Text>
                                   )}
                              </View>

                              {/* Stats */}
                              <View style={styles.statsContainer}>
                                   <TouchableOpacity
                                        style={styles.statItem}
                                        onPress={() => router.push('/followers')}
                                   >
                                        <Text style={[styles.statValue, { color: colors.foreground }]}>
                                             {stats.posts}
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                                             Posts
                                        </Text>
                                   </TouchableOpacity>
                                   <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                                   <TouchableOpacity
                                        style={styles.statItem}
                                        onPress={() => router.push('/followers')}
                                   >
                                        <Text style={[styles.statValue, { color: colors.foreground }]}>
                                             {stats.followers}
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                                             Followers
                                        </Text>
                                   </TouchableOpacity>
                                   <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                                   <TouchableOpacity
                                        style={styles.statItem}
                                        onPress={() => router.push('/following')}
                                   >
                                        <Text style={[styles.statValue, { color: colors.foreground }]}>
                                             {stats.following}
                                        </Text>
                                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                                             Following
                                        </Text>
                                   </TouchableOpacity>
                              </View>

                              {/* Action Buttons */}
                              {!isOwnProfile && (
                                   <View style={styles.actionsContainer}>
                                        <TouchableOpacity
                                             onPress={handleMessage}
                                             style={[styles.messageButton, { backgroundColor: colors.primary }]}
                                             disabled={creatingChat}
                                             activeOpacity={0.8}
                                        >
                                             {creatingChat ? (
                                                  <ActivityIndicator size="small" color="#fff" />
                                             ) : (
                                                  <>
                                                       <MessageCircle size={20} color="#fff" />
                                                       <Text style={styles.messageButtonText}>Message</Text>
                                                  </>
                                             )}
                                        </TouchableOpacity>
                                   </View>
                              )}
                         </Card>

                         {/* Posts Section - Placeholder */}
                         <Card style={styles.postsCard}>
                              <View style={styles.postsHeader}>
                                   <Text style={[styles.postsTitle, { color: colors.foreground }]}>
                                        Posts
                                   </Text>
                              </View>
                              <View style={styles.centered}>
                                   <Users size={48} color={colors.mutedForeground} opacity={0.3} />
                                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                        No posts yet
                                   </Text>
                              </View>
                         </Card>
                    </ScrollView>
               </View>
          </>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          paddingTop: Spacing.xxl + Spacing.md,
     },
     backButton: {
          padding: Spacing.xs,
     },
     headerTitle: {
          fontSize: FontSizes.xl,
          fontWeight: FontWeights.bold,
     },
     centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
     },
     errorText: {
          fontSize: FontSizes.md,
     },
     profileCard: {
          margin: Spacing.md,
          padding: 0,
          overflow: 'hidden',
     },
     coverGradient: {
          height: 120,
          opacity: 0.8,
     },
     avatarContainer: {
          alignItems: 'center',
          marginTop: -50,
          marginBottom: Spacing.md,
     },
     userInfo: {
          alignItems: 'center',
          paddingHorizontal: Spacing.lg,
          marginBottom: Spacing.lg,
     },
     userName: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.xs,
     },
     userEmail: {
          fontSize: FontSizes.md,
          marginBottom: Spacing.sm,
     },
     userBio: {
          fontSize: FontSizes.md,
          textAlign: 'center',
          marginTop: Spacing.sm,
     },
     statsContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
     },
     statItem: {
          flex: 1,
          alignItems: 'center',
     },
     statDivider: {
          width: 1,
          height: 40,
     },
     statValue: {
          fontSize: FontSizes.xl,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.xs,
     },
     statLabel: {
          fontSize: FontSizes.sm,
     },
     actionsContainer: {
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.lg,
          gap: Spacing.sm,
     },
     messageButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.md,
          borderRadius: 12,
     },
     messageButtonText: {
          color: '#fff',
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
     },
     postsCard: {
          margin: Spacing.md,
          marginTop: 0,
          minHeight: 200,
     },
     postsHeader: {
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(128, 128, 128, 0.2)',
          marginBottom: Spacing.md,
     },
     postsTitle: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.bold,
     },
     emptyText: {
          fontSize: FontSizes.md,
          marginTop: Spacing.md,
     },
});
