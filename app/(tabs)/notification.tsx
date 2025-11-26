import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Bell, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/useNotificationHooks';
import { Notification } from '@/types/notification';
import { formatTimeAgo } from '@/lib/utils/timeFormatter';
import { logger } from '@/lib/utils/logger';

export default function NotificationScreen() {
     const { colors } = useTheme();
     const { data, isLoading, error, mutate } = useNotifications();
     const { mutate: markAsRead } = useMarkAsRead();
     const { mutate: markAllAsRead } = useMarkAllAsRead();
     const [refreshing, setRefreshing] = React.useState(false);

     const notifications = data?.data?.notifications || [];
     const unreadCount = data?.data?.meta?.unreadCount || 0;

     const handleRefresh = async () => {
          setRefreshing(true);
          await mutate();
          setRefreshing(false);
     };

     const handleMarkAsRead = async (id: string) => {
          try {
               await markAsRead(id);
          } catch (error) {
               logger.error('Error marking as read:', error);
          }
     };

     const handleMarkAllAsRead = async () => {
          try {
               await markAllAsRead();
          } catch (error) {
               logger.error('Error marking all as read:', error);
          }
     };

     const getNotificationIcon = (type: string) => {
          switch (type) {
               case 'withdrawal_approved':
                    return <CheckCircle size={20} color="#10b981" />;
               case 'withdrawal_rejected':
                    return <AlertCircle size={20} color="#ef4444" />;
               default:
                    return <Bell size={20} color={colors.primary} />;
          }
     };

     const renderNotificationItem = ({ item }: { item: Notification }) => (
          <TouchableOpacity
               style={[
                    styles.notificationItem,
                    {
                         backgroundColor: item.read ? 'transparent' : colors.accent + '40',
                         borderBottomColor: colors.border
                    }
               ]}
               onPress={() => {
                    if (!item.read) {
                         handleMarkAsRead(item.id);
                    }
               }}
          >
               <View style={styles.iconContainer}>
                    {getNotificationIcon(item.type)}
               </View>
               <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                         <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
                              {item.title}
                         </Text>
                         {!item.read && (
                              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                         )}
                    </View>
                    <Text style={[styles.notificationMessage, { color: colors.mutedForeground }]}>
                         {item.message}
                    </Text>
                    <View style={styles.timeContainer}>
                         <Clock size={12} color={colors.mutedForeground} />
                         <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                              {formatTimeAgo(item.time)}
                         </Text>
                    </View>
               </View>
          </TouchableOpacity>
     );

     if (isLoading && !refreshing) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
               </View>
          );
     }

     if (error) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                    <AlertCircle size={48} color={colors.destructive} />
                    <Text style={[styles.emptyText, { color: colors.foreground, marginTop: Spacing.md }]}>Không thể tải thông báo</Text>
                    <Button
                         onPress={() => mutate()}
                         style={{ marginTop: Spacing.md }}
                    >
                         Thử lại
                    </Button>
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.headerLeft}>
                         <Bell size={24} color={colors.foreground} />
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                              Thông báo
                         </Text>
                         {unreadCount > 0 && (
                              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                   <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
                                        {unreadCount}
                                   </Text>
                              </View>
                         )}
                    </View>
                    <TouchableOpacity>
                         <Settings size={24} color={colors.foreground} />
                    </TouchableOpacity>
               </View>

               {unreadCount > 0 && (
                    <View style={[styles.actionBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                         <Button variant="outline" size="sm" onPress={handleMarkAllAsRead}>
                              Đánh dấu tất cả đã đọc
                         </Button>
                    </View>
               )}

               {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                         <Bell size={64} color={colors.mutedForeground} opacity={0.5} />
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              Không có thông báo
                         </Text>
                    </View>
               ) : (
                    <FlatList
                         data={notifications}
                         renderItem={renderNotificationItem}
                         keyExtractor={item => item.id}
                         contentContainerStyle={styles.listContent}
                         refreshControl={
                              <RefreshControl
                                   refreshing={refreshing}
                                   onRefresh={handleRefresh}
                                   colors={[colors.primary]}
                              />
                         }
                    />
               )}
          </View>
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
     headerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
     },
     headerTitle: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
     },
     badge: {
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
     },
     badgeText: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.bold,
     },
     actionBar: {
          padding: Spacing.sm,
          borderBottomWidth: 1,
          alignItems: 'flex-end',
     },
     listContent: {
          flexGrow: 1,
     },
     notificationItem: {
          flexDirection: 'row',
          padding: Spacing.md,
          borderBottomWidth: 1,
          gap: Spacing.sm,
     },
     iconContainer: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
     },
     notificationContent: {
          flex: 1,
     },
     notificationHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
     },
     notificationTitle: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
          flex: 1,
     },
     unreadDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
     },
     notificationMessage: {
          fontSize: FontSizes.sm,
          marginBottom: 6,
     },
     timeContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
     },
     notificationTime: {
          fontSize: FontSizes.xs,
     },
     emptyState: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
     },
     emptyText: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.semibold,
          marginTop: Spacing.md,
     },
});
