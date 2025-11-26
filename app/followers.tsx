import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { Users, ArrowLeft } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { getMyFollowers } from '@/lib/api/followApi';
import { Follow } from '@/types/follow';
import { logger } from '@/lib/utils/logger';

export default function FollowersScreen() {
     const { colors } = useTheme();
     const [followers, setFollowers] = useState<Follow[]>([]);
     const [loading, setLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);

     useEffect(() => {
          fetchFollowers();
     }, []);

     const fetchFollowers = async () => {
          try {
               setLoading(true);
               const response = await getMyFollowers();
               setFollowers(response.data || []);
          } catch (error) {
               logger.error('Error fetching followers:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleRefresh = async () => {
          setRefreshing(true);
          await fetchFollowers();
          setRefreshing(false);
     };

     const renderFollowerItem = ({ item }: { item: Follow }) => {
          const follower = item.follower;
          if (!follower) return null;

          return (
               <View
                    style={[styles.followerItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
               >
                    <Avatar
                         source={follower.avatarUrl}
                         name={follower.name || follower.email?.charAt(0) || 'U'}
                         size={50}
                    />
                    <View style={styles.followerInfo}>
                         <Text style={[styles.followerName, { color: colors.foreground }]}>
                              {follower.name || 'User'}
                         </Text>
                         <Text style={[styles.followerEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
                              {follower.email}
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
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Followers</Text>
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
                              Followers ({followers.length})
                         </Text>
                         <View style={{ width: 24 }} />
                    </View>

                    {followers.length === 0 ? (
                         <View style={styles.centered}>
                              <Users size={64} color={colors.mutedForeground} opacity={0.3} />
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   No followers yet
                              </Text>
                         </View>
                    ) : (
                         <FlatList
                              data={followers}
                              renderItem={renderFollowerItem}
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
     followerItem: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          gap: Spacing.md,
     },
     followerInfo: {
          flex: 1,
     },
     followerName: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
          marginBottom: 2,
     },
     followerEmail: {
          fontSize: FontSizes.sm,
     },
     emptyText: {
          fontSize: FontSizes.md,
          marginTop: Spacing.md,
     },
});
