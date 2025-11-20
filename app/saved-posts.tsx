/**
 * Saved Posts Screen
 * Hiển thị danh sách các bài viết đã lưu
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSavedPosts } from '@/lib/hooks/usePostHooks';
import { PostItem } from '@/components/forum/PostItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/Colors';
import { SavedPostItem } from '@/types/post';

export default function SavedPostsScreen() {
     const { colors } = useTheme();
     const { t } = useTranslation();
     const { data, isLoading, mutate, isValidating } = useSavedPosts(20, 0);

     const renderItem = ({ item }: { item: SavedPostItem }) => (
          <PostItem post={item.post} />
     );

     const renderEmpty = () => (
          <View style={styles.emptyContainer}>
               <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    {t('Forum.noSavedPosts')}
               </Text>
          </View>
     );

     if (isLoading) {
          return (
               <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                    <View style={styles.header}>
                         <Text style={[styles.title, { color: colors.foreground }]}>
                              {t('Forum.savedPosts')}
                         </Text>
                    </View>
                    <View style={styles.loadingContainer}>
                         <ActivityIndicator size='large' color={colors.primary} />
                    </View>
               </SafeAreaView>
          );
     }

     return (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
               <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         {t('Forum.savedPosts')} ({data?.data?.total || 0})
                    </Text>
               </View>
               <FlatList
                    data={data?.data?.savedPosts || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                         <RefreshControl
                              refreshing={isValidating}
                              onRefresh={mutate}
                              tintColor={colors.primary}
                         />
                    }
                    contentContainerStyle={styles.listContent}
               />
          </SafeAreaView>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     header: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.1)',
     },
     title: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     listContent: {
          flexGrow: 1,
     },
     emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 100,
     },
     emptyText: {
          fontSize: 16,
     },
});
