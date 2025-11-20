/**
 * Notifications Screen
 * Display user notifications
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     RefreshControl,
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
} from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { formatDate } from '@/lib/utils/dateFormatter';
import { router } from 'expo-router';

interface Notification {
     id: string;
     type: 'order' | 'payment' | 'system' | 'product' | 'success' | 'warning';
     title: string;
     message: string;
     read: boolean;
     createdAt: string;
}

// Mock data - replace with API call
const MOCK_NOTIFICATIONS: Notification[] = [
     {
          id: '1',
          type: 'order',
          title: 'New Order',
          message: 'You have received a new order for "Lightroom Preset Pack"',
          read: false,
          createdAt: new Date().toISOString(),
     },
     {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received $45.00 for order #12345',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
     },
     {
          id: '3',
          type: 'success',
          title: 'Withdrawal Successful',
          message: 'Your withdrawal of $100.00 has been processed',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
     },
     {
          id: '4',
          type: 'product',
          title: 'Product Purchased',
          message: 'Your purchase of "Professional Preset Bundle" is ready to download',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
     },
     {
          id: '5',
          type: 'warning',
          title: 'Order Reported',
          message: 'Order #12345 has been reported by the buyer',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
     },
     {
          id: '6',
          type: 'system',
          title: 'Welcome to Lensor!',
          message: 'Thank you for joining our community of creators',
          read: true,
          createdAt: new Date(Date.now() - 604800000).toISOString(),
     },
];

export default function NotificationsScreen() {
     const { colors } = useTheme();
     const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
     const [refreshing, setRefreshing] = useState(false);

     const handleRefresh = async () => {
          setRefreshing(true);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          setRefreshing(false);
     };

     const handleMarkAsRead = (id: string) => {
          setNotifications(prev =>
               prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
          );
     };

     const handleMarkAllAsRead = () => {
          setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
     };

     const unreadCount = notifications.filter(n => !n.read).length;

     const getIcon = (type: Notification['type']) => {
          const iconSize = 24;
          switch (type) {
               case 'order':
                    return <ShoppingBag size={iconSize} color={colors.primary} />;
               case 'payment':
                    return <DollarSign size={iconSize} color="#10b981" />;
               case 'success':
                    return <CheckCircle size={iconSize} color="#10b981" />;
               case 'warning':
                    return <AlertCircle size={iconSize} color="#f59e0b" />;
               case 'product':
                    return <Package size={iconSize} color="#8b5cf6" />;
               default:
                    return <Info size={iconSize} color={colors.mutedForeground} />;
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
                    {notifications.length === 0 ? (
                         <View style={styles.emptyState}>
                              <Bell size={48} color={colors.mutedForeground} />
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   No notifications yet
                              </Text>
                         </View>
                    ) : (
                         notifications.map((notification) => (
                              <TouchableOpacity
                                   key={notification.id}
                                   style={[
                                        styles.notificationCard,
                                        {
                                             backgroundColor: notification.read ? colors.card : colors.muted,
                                             borderColor: colors.border,
                                        },
                                   ]}
                                   onPress={() => handleMarkAsRead(notification.id)}
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
                                                            fontWeight: notification.read ? '500' : 'bold',
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

                                        <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                                             {formatDate(notification.createdAt)}
                                        </Text>
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
          width: 48,
          height: 48,
          borderRadius: 24,
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
          fontSize: 16,
          flex: 1,
     },
     unreadDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: Spacing.xs,
     },
     notificationMessage: {
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 4,
     },
     notificationTime: {
          fontSize: 12,
     },
});
