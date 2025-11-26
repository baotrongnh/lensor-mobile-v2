import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Users, ArrowLeft } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { getMyFollowing } from '@/lib/api/followApi';
import { Follow } from '@/types/follow';
import { logger } from '@/lib/utils/logger';

export default function FollowingScreen() {
     const { colors } = useTheme();
     const [following, setFollowing] = useState<Follow[]>([]);
     const [loading, setLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);

     useEffect(() => {
          fetchFollowing();
     }, []);

     const fetchFollowing = async () => {
          try {
               setLoading(true);
               const response = await getMyFollowing();
               setFollowing(response.data || []);
          } catch (error) {
               logger.error('Error fetching following:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleRefresh = async () => {
          setRefreshing(true);
          await fetchFollowing();
          setRefreshing(false);
     };

     const renderFollowingItem = ({ item }: { item: Follow }) => {
          const followingUser = item.following;
          if (!followingUser) return null;

          return (
               <View
                    style={[styles.followingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
               >
                    <Avatar
                         source={followingUser.avatarUrl}
                         name={followingUser.name || followingUser.email?.charAt(0) || 'U'}
                         size={50}
                    />
                    <View style={styles.followingInfo}>
                         <Text style={[styles.followingName, { color: colors.foreground }]}>
                              {followingUser.name || 'User'}
                         </Text>
                         <Text style={[styles.followingEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
                              {followingUser.email}
                         </Text>
                    </View>
               </View>
          );
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
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Following</Text>
                              <View style={{ width: 24 }} />
                         </View>
                         <View style={styles.centered}>
                              <ActivityIndicator size="large" color={colors.primary} />
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
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                              Following ({following.length})
                         </Text>
                         <View style={{ width: 24 }} />
                    </View>

                    {following.length === 0 ? (
                         <View style={styles.centered}>
                              <Users size={64} color={colors.mutedForeground} opacity={0.3} />
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   Not following anyone yet
                              </Text>
                         </View>
                    ) : (
                         <FlatList
                              data={following}
                              renderItem={renderFollowingItem}
                              keyExtractor={item => item.id}
                              refreshing={refreshing}
                              onRefresh={handleRefresh}
                              contentContainerStyle={styles.listContent}
                         />
                    )}
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
     },
     listContent: {
          flexGrow: 1,
     },
     followingItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          gap: Spacing.md,
     },
     followingInfo: {
          flex: 1,
     },
     followingName: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
          marginBottom: 2,
     },
     followingEmail: {
          fontSize: FontSizes.sm,
     },
     emptyText: {
          fontSize: FontSizes.md,
          marginTop: Spacing.md,
     },
});
