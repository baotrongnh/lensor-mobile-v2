import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

interface Notification {
     id: string;
     type: 'withdrawal_approved' | 'withdrawal_rejected' | 'order' | 'system';
     title: string;
     message: string;
     time: string;
     read: boolean;
}

export default function NotificationScreen() {
     const { t } = useTranslation();
     const { colors } = useTheme();

     // Mock data
     const notifications: Notification[] = [
          {
               id: '1',
               type: 'withdrawal_approved',
               title: 'Rút tiền thành công',
               message: 'Yêu cầu rút tiền 500,000đ đã được duyệt',
               time: new Date().toISOString(),
               read: false,
          },
          {
               id: '2',
               type: 'order',
               title: 'Đơn hàng mới',
               message: 'Bạn có đơn hàng mới từ Nguyễn Văn A',
               time: new Date(Date.now() - 3600000).toISOString(),
               read: false,
          },
          {
               id: '3',
               type: 'system',
               title: 'Cập nhật hệ thống',
               message: 'Hệ thống đã được cập nhật phiên bản mới',
               time: new Date(Date.now() - 86400000).toISOString(),
               read: true,
          },
     ];

     const unreadCount = notifications.filter(n => !n.read).length;

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

     const formatTime = (time: string) => {
          try {
               const date = new Date(time);
               const now = new Date();
               const diff = now.getTime() - date.getTime();
               const minutes = Math.floor(diff / 60000);
               const hours = Math.floor(diff / 3600000);
               const days = Math.floor(diff / 86400000);

               if (minutes < 60) return `${minutes} phút trước`;
               if (hours < 24) return `${hours} giờ trước`;
               return `${days} ngày trước`;
          } catch {
               return time;
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
                              {formatTime(item.time)}
                         </Text>
                    </View>
               </View>
          </TouchableOpacity>
     );

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
                         <Button variant="outline" size="sm">
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
