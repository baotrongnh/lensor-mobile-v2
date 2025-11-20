import React, { useState } from 'react';
import {
     View,
     Text,
     FlatList,
     StyleSheet,
     RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { usePosts } from '@/lib/hooks/usePostHooks';
import { NetworkError } from '@/components/empty';
import { PostType } from '@/types/post';
import { Spacing } from '@/constants/Colors';
import { PostSkeleton } from '@/components/ui/Skeleton';
import { PostItem } from '@/components/forum/PostItem';
import { CreatePostInput } from '@/components/forum/CreatePostInput';

export default function ForumScreen() {
     const { t } = useTranslation();
     const { colors } = useTheme();
     const { data, error, isLoading, mutate } = usePosts();
     const [refreshing, setRefreshing] = useState(false);

     const onRefresh = async () => {
          setRefreshing(true);
          await mutate();
          setRefreshing(false);
     };

     // Loading state with skeleton
     if (isLoading && !data) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                              {t('Tabs.forum')}
                         </Text>
                    </View>
                    <View style={{ padding: Spacing.md }}>
                         <PostSkeleton />
                         <PostSkeleton />
                         <PostSkeleton />
                    </View>
               </View>
          );
     }

     // Error state
     if (error) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                              {t('Tabs.forum')}
                         </Text>
                    </View>
                    <NetworkError
                         onRetry={mutate}
                         title="Connection Lost"
                         description="Unable to load posts. Please check your connection and try again."
                    />
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Header - Clean minimal style */}
               <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                         {t('Tabs.forum')}
                    </Text>
               </View>

               <FlatList
                    data={data?.data || []}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                         <View style={styles.createPostWrapper}>
                              <CreatePostInput />
                         </View>
                    }
                    renderItem={({ item }: { item: PostType }) => <PostItem post={item} />}
                    refreshControl={
                         <RefreshControl
                              refreshing={refreshing}
                              onRefresh={onRefresh}
                              tintColor={colors.primary}
                         />
                    }
                    showsVerticalScrollIndicator={false}
               />
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.xxl + Spacing.sm,
          paddingBottom: Spacing.sm,
          borderBottomWidth: 0.5,
     },
     headerTitle: {
          fontSize: 24,
          fontWeight: '700',
          letterSpacing: -0.5,
     },
     createPostWrapper: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
     },
});
