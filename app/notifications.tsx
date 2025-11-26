/**
 * Notifications Screen
 * Display user notifications
 */

import React, { useState, useEffect } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     RefreshControl,
     ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
     Bell,
     ShoppingBag,
     DollarSign,
     AlertCircle,
     CheckCircle,
     Info,
     Package,
     ChevronLeft,
     Clock,
} from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { formatDate } from '@/lib/utils/dateFormatter';
import { formatTimeAgo } from '@/lib/utils/timeFormatter';
import { router } from 'expo-router';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/useNotificationHooks';
import { Notification } from '@/types/notification';
import { logger } from '@/lib/utils/logger';

export default function NotificationsScreen() {
     const { colors } = useTheme();
     const { data, isLoading, error, mutate } = useNotifications();
     const { mutate: markAsRead } = useMarkAsRead();
     const { mutate: markAllAsRead } = useMarkAllAsRead();
     const [refreshing, setRefreshing] = useState(false);

     // Debug logging
     useEffect(() => {
          logger.log('Notifications data:', data);
          logger.log('Notifications loading:', isLoading);
          logger.log('Notifications error:', error);
     }, [data, isLoading, error]);

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

     const getIcon = (type: string) => {
          const iconSize = 20;
          switch (type) {
               case 'withdrawal_approved':
                    return <CheckCircle size={iconSize} color="#10b981" />;
               case 'withdrawal_rejected':
                    return <AlertCircle size={iconSize} color="#ef4444" />;
               case 'order':
                    return <ShoppingBag size={iconSize} color={colors.primary} />;
               case 'payment':
                    return <DollarSign size={iconSize} color="#10b981" />;
               case 'product':
                    return <Package size={iconSize} color="#8b5cf6" />;
               default:
                    return <Bell size={iconSize} color={colors.mutedForeground} />;
          }
     };

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/notification')}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                         <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                              Notifications
                         </Text>
                         {unreadCount > 0 && (
                              <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                                   <Text style={[styles.badgeText, { color: colors.destructiveForeground }]}>
                                        {unreadCount}
                                   </Text>
                              </View>
                         )}
                    </View>
                    {unreadCount > 0 ? (
                         <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerRight}>
                              <Text style={[styles.markAllBtn, { color: colors.primary }]}>
                                   Mark all
                              </Text>
                         </TouchableOpacity>
                    ) : (
                         <View style={styles.headerRight} />
                    )}
               </View>

               {/* Notifications List */}
               <ScrollView
                    style={styles.list}
                    refreshControl={
                         <RefreshControl
                              refreshing={refreshing}
                              onRefresh={handleRefresh}
                              colors={[colors.primary]}
                         />
                    }
               >
                    {isLoading && !refreshing ? (
                         <View style={styles.centerContent}>
                              <ActivityIndicator size="large" color={colors.primary} />
                         </View>
                    ) : notifications.length === 0 ? (
                         <View style={styles.emptyState}>
                              <Bell size={48} color={colors.mutedForeground} />
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   No notifications yet
                              </Text>
                         </View>
                    ) : (
                         notifications.map((notification: Notification) => (
                              <TouchableOpacity
                                   key={notification.id}
                                   style={[
                                        styles.notificationCard,
                                        {
                                             backgroundColor: notification.read ? colors.card : colors.muted,
                                             borderColor: colors.border,
                                        },
                                   ]}
                                   onPress={() => !notification.read && handleMarkAsRead(notification.id)}
                              >
                                   <View style={[styles.iconWrapper, { backgroundColor: colors.background }]}>
                                        {getIcon(notification.type)}
                                   </View>

                                   <View style={styles.notificationContent}>
                                        <View style={styles.notificationHeader}>
                                             <Text
                                                  style={[
                                                       styles.notificationTitle,
                                                       {
                                                            color: colors.foreground,
                                                            fontWeight: notification.read ? '500' : '700',
                                                       },
                                                  ]}
                                             >
                                                  {notification.title}
                                             </Text>
                                             {!notification.read && (
                                                  <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                                             )}
                                        </View>

                                        <Text
                                             style={[
                                                  styles.notificationMessage,
                                                  { color: colors.mutedForeground },
                                             ]}
                                             numberOfLines={2}
                                        >
                                             {notification.message}
                                        </Text>

                                        {notification.actionUrl && (
                                             <Text style={[styles.actionLink, { color: colors.primary }]}>
                                                  View details →
                                             </Text>
                                        )}

                                        <View style={styles.notificationFooter}>
                                             <Clock size={12} color={colors.mutedForeground} />
                                             <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                                                  {formatTimeAgo(notification.time)}
                                             </Text>
                                        </View>
                                   </View>
                              </TouchableOpacity>
                         ))
                    )}
               </ScrollView>
          </View>
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
          paddingTop: 60,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
     },
     headerCenter: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     headerRight: {
          width: 60,
          alignItems: 'flex-end',
     },
     badge: {
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12,
          minWidth: 24,
          alignItems: 'center',
          justifyContent: 'center',
     },
     badgeText: {
          fontSize: 12,
          fontWeight: 'bold',
     },
     markAllBtn: {
          fontSize: 13,
          fontWeight: '600',
     },
     list: {
          flex: 1,
     },
     centerContent: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: Spacing.xxl * 2,
     },
     emptyState: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.xxl * 2,
          gap: Spacing.md,
     },
     emptyText: {
          fontSize: 16,
     },
     notificationCard: {
          flexDirection: 'row',
          padding: Spacing.md,
          gap: Spacing.sm,
          borderBottomWidth: 1,
     },
     iconWrapper: {
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
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
     },
     notificationTitle: {
          fontSize: 15,
          flex: 1,
     },
     unreadDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: Spacing.xs,
     },
     notificationMessage: {
          fontSize: 13,
          lineHeight: 18,
          marginBottom: 4,
     },
     actionLink: {
          fontSize: 13,
          marginBottom: 6,
          fontWeight: '500',
     },
     notificationFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
     },
     notificationTime: {
          fontSize: 11,
     },
});
