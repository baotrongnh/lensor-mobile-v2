/**
 * My Posts Screen
 * Hiển thị danh sách các bài viết của user
 */

import React, { useEffect, useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     FlatList,
     ActivityIndicator,
     RefreshControl,
     TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { PostItem } from '@/components/forum/PostItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/Colors';
import { PostType } from '@/types/post';
import { userApi } from '@/lib/api/userApi';
import { useUserStore } from '@/stores/userStore';
import { FileText, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MyPostsScreen() {
     const { colors } = useTheme();
     const user = useUserStore((state) => state.user);
     const [posts, setPosts] = useState<PostType[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [isRefreshing, setIsRefreshing] = useState(false);
     const [error, setError] = useState(false);

     const fetchUserPosts = React.useCallback(async (isRefresh = false) => {
          if (!user?.id) return;

          try {
               if (isRefresh) {
                    setIsRefreshing(true);
               } else {
                    setIsLoading(true);
               }
               setError(false);

               const { data } = await userApi.getUserProfile(user.id);

               // Transform user posts to PostType format
               const userPosts = data.posts.map((post: any) => ({
                    ...post,
                    user: {
                         id: data.id,
                         name: data.name,
                         avatarUrl: data.avatarUrl,
                         isFollowed: false,
                    },
                    voteCount: 0,
                    commentCount: 0,
                    isLiked: false,
               })) as PostType[];

               setPosts(userPosts);
          } catch (err) {
               console.error('Error fetching user posts:', err);
               setError(true);
          } finally {
               setIsLoading(false);
               setIsRefreshing(false);
          }
     }, [user?.id]);

     useEffect(() => {
          fetchUserPosts();
     }, [fetchUserPosts]);

     const handleRefresh = () => {
          fetchUserPosts(true);
     };

     const handleRetry = () => {
          setError(false);
          fetchUserPosts();
     };

     const renderItem = ({ item }: { item: PostType }) => <PostItem post={item} />;

     const renderEmpty = () => {
          if (error) {
               return (
                    <View style={styles.emptyContainer}>
                         <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                              Unable to load posts
                         </Text>
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              Something went wrong. Please try again.
                         </Text>
                         <TouchableOpacity
                              style={[styles.retryButton, { backgroundColor: colors.primary }]}
                              onPress={handleRetry}
                         >
                              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
                         </TouchableOpacity>
                    </View>
               );
          }

          return (
               <View style={styles.emptyContainer}>
                    <FileText size={64} color={colors.mutedForeground} style={styles.emptyIcon} />
                    <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                         You haven&apos;t created any posts yet. Share your photography with the community!
                    </Text>
               </View>
          );
     };

     if (isLoading) {
          return (
               <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                         <TouchableOpacity
                              onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))}
                              style={styles.backBtn}
                         >
                              <ChevronLeft size={24} color={colors.foreground} />
                         </TouchableOpacity>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Posts</Text>
                         <View style={styles.headerRight} />
                    </View>
                    <View style={styles.loadingContainer}>
                         <ActivityIndicator size="large" color={colors.primary} />
                    </View>
               </SafeAreaView>
          );
     }

     return (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
               <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Posts</Text>
                    <View style={styles.headerRight} />
               </View>

               <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                         <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                    contentContainerStyle={posts.length === 0 ? styles.emptyListContent : styles.listContent}
               />
          </SafeAreaView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     headerRight: {
          width: 40,
     },
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     listContent: {
          padding: Spacing.sm,
     },
     emptyListContent: {
          flexGrow: 1,
          justifyContent: 'center',
     },
     emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: 100,
     },
     emptyIcon: {
          marginBottom: Spacing.md,
     },
     emptyTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: Spacing.sm,
          textAlign: 'center',
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          maxWidth: 300,
     },
     retryButton: {
          marginTop: Spacing.lg,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.xl,
          borderRadius: 12,
     },
     retryButtonText: {
          fontSize: 16,
          fontWeight: '600',
     },
});
