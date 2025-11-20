/**
 * Purchased Orders Screen
 * Display purchased orders with download and report functionality
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     RefreshControl,
     ActivityIndicator,
     Alert,
     Linking,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Download, AlertCircle, Package, ChevronLeft, FileWarning } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { usePurchasedOrders } from '@/lib/hooks/useOrderHooks';
import { formatDate } from '@/lib/utils/dateFormatter';
import { router } from 'expo-router';
import ReportModal from '@/components/orders/ReportModal';

export default function PurchasedOrdersScreen() {
     const { colors } = useTheme();
     const { data: orders, error, isLoading, mutate, isValidating } = usePurchasedOrders();
     const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
     const [reportModalVisible, setReportModalVisible] = useState(false);
     const [selectedOrder, setSelectedOrder] = useState<any>(null);

     const handleDownload = async (productId: string, productName: string, downloadUrl: string) => {
          try {
               setDownloadingIds(prev => new Set(prev).add(productId));

               // Open download URL in browser
               const canOpen = await Linking.canOpenURL(downloadUrl);
               if (canOpen) {
                    await Linking.openURL(downloadUrl);
                    Alert.alert('Success', 'Download started in browser');
               } else {
                    throw new Error('Cannot open download URL');
               }
          } catch (error) {
               Alert.alert('Error', 'Failed to download product');
               console.error('Download error:', error);
          } finally {
               setDownloadingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
               });
          }
     };

     const handleReport = (order: any) => {
          setSelectedOrder(order);
          setReportModalVisible(true);
     };

     if (error) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.errorText, { color: colors.destructive }]}>
                         Failed to load purchased orders
                    </Text>
                    <TouchableOpacity
                         style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                         onPress={() => mutate()}
                    >
                         <Text style={[styles.retryBtnText, { color: colors.primaryForeground }]}>
                              Retry
                         </Text>
                    </TouchableOpacity>
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Custom Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                         onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/profile')}
                         style={styles.backBtn}
                    >
                         <ChevronLeft size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Purchased Orders</Text>
                    <View style={styles.headerRight} />
               </View>

               {/* Stats */}
               <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Package size={32} color={colors.primary} />
                    <View style={styles.statsInfo}>
                         <Text style={[styles.statsLabel, { color: colors.mutedForeground }]}>
                              Total Purchased Orders
                         </Text>
                         <Text style={[styles.statsValue, { color: colors.foreground }]}>
                              {orders?.length || 0}
                         </Text>
                    </View>
               </View>

               {/* Orders List */}
               <ScrollView
                    style={styles.list}
                    refreshControl={
                         <RefreshControl refreshing={isValidating} onRefresh={() => mutate()} colors={[colors.primary]} />
                    }
               >
                    {isLoading ? (
                         <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : orders?.length === 0 ? (
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              No purchased orders yet
                         </Text>
                    ) : (
                         orders?.map((order) => (
                              <View
                                   key={order.id}
                                   style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                              >
                                   <View style={styles.orderHeader}>
                                        <Text style={[styles.orderId, { color: colors.foreground }]}>
                                             Order #{order.id.slice(0, 8)}
                                        </Text>
                                        <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                                             {formatDate(order.createdAt)}
                                        </Text>
                                   </View>

                                   <View style={styles.orderBody}>
                                        <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                                             Total Amount
                                        </Text>
                                        <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                                             {parseFloat(order.totalAmount).toLocaleString('vi-VN')} ₫
                                        </Text>
                                   </View>

                                   {/* Products */}
                                   <View style={styles.productsSection}>
                                        <Text style={[styles.productsTitle, { color: colors.foreground }]}>
                                             Products ({order.items.length})
                                        </Text>
                                        {order.items.map((item, idx) => (
                                             <View
                                                  key={`${order.id}-${item.productId}-${idx}`}
                                                  style={[styles.productCard, { backgroundColor: colors.muted }]}
                                             >
                                                  <View style={styles.productInfo}>
                                                       <Text style={[styles.productName, { color: colors.foreground }]}>
                                                            {item.productTitle}
                                                       </Text>
                                                       <Text style={[styles.productPrice, { color: colors.mutedForeground }]}>
                                                            {parseFloat(item.price.toString()).toLocaleString('vi-VN')} ₫
                                                       </Text>
                                                       {item.author && (
                                                            <Text style={[styles.sellerName, { color: colors.mutedForeground }]}>
                                                                 by {item.author.name}
                                                            </Text>
                                                       )}
                                                  </View>
                                                  <View style={styles.productActions}>
                                                       {item.presetFiles && item.presetFiles.length > 0 && (
                                                            <TouchableOpacity
                                                                 style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                                                                 onPress={() => handleDownload(
                                                                      item.productId,
                                                                      item.productTitle,
                                                                      item.presetFiles![0]
                                                                 )}
                                                                 disabled={downloadingIds.has(item.productId)}
                                                            >
                                                                 {downloadingIds.has(item.productId) ? (
                                                                      <ActivityIndicator size="small" color={colors.primaryForeground} />
                                                                 ) : (
                                                                      <>
                                                                           <Download size={16} color={colors.primaryForeground} />
                                                                           <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>
                                                                                Download
                                                                           </Text>
                                                                      </>
                                                                 )}
                                                            </TouchableOpacity>
                                                       )}
                                                  </View>
                                             </View>
                                        ))}

                                        {/* Report Button for Order */}
                                        {order.status === 'completed' && (
                                             <TouchableOpacity
                                                  style={[styles.reportOrderBtn, { borderColor: colors.destructive }]}
                                                  onPress={() => handleReport(order)}
                                             >
                                                  <FileWarning size={18} color={colors.destructive} />
                                                  <Text style={[styles.reportOrderBtnText, { color: colors.destructive }]}>
                                                       Report Issue with Product
                                                  </Text>
                                             </TouchableOpacity>
                                        )}
                                   </View>
                              </View>
                         ))
                    )}
               </ScrollView>

               {/* Report Modal */}
               {selectedOrder && (
                    <ReportModal
                         visible={reportModalVisible}
                         onClose={() => {
                              setReportModalVisible(false);
                              setSelectedOrder(null);
                         }}
                         orderId={selectedOrder.id}
                         products={selectedOrder.items.map((item: any) => ({
                              productId: item.productId,
                              productTitle: item.productTitle,
                              price: item.price,
                         }))}
                         onSuccess={() => mutate()}
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
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     headerRight: {
          width: 40,
     },
     centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.lg,
     },
     statsCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          margin: Spacing.md,
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
     },
     statsInfo: {
          flex: 1,
     },
     statsLabel: {
          fontSize: 14,
          marginBottom: 4,
     },
     statsValue: {
          fontSize: 24,
          fontWeight: 'bold',
     },
     list: {
          flex: 1,
          padding: Spacing.md,
     },
     loader: {
          marginVertical: Spacing.xl,
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          marginVertical: Spacing.xl,
     },
     orderCard: {
          borderRadius: 12,
          borderWidth: 1,
          padding: Spacing.md,
          marginBottom: Spacing.md,
     },
     orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.sm,
     },
     orderId: {
          fontSize: 16,
          fontWeight: '600',
     },
     orderDate: {
          fontSize: 12,
     },
     orderBody: {
          marginBottom: Spacing.md,
     },
     totalLabel: {
          fontSize: 13,
          marginBottom: 4,
     },
     totalAmount: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     productsSection: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: Spacing.md,
     },
     productsTitle: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: Spacing.sm,
     },
     productCard: {
          padding: Spacing.sm,
          borderRadius: 8,
          marginBottom: Spacing.sm,
     },
     productInfo: {
          marginBottom: Spacing.sm,
     },
     productName: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 4,
     },
     productPrice: {
          fontSize: 14,
          marginBottom: 2,
     },
     sellerName: {
          fontSize: 12,
     },
     productActions: {
          flexDirection: 'row',
          gap: Spacing.sm,
     },
     actionBtn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingVertical: Spacing.xs,
          borderRadius: 8,
     },
     actionBtnText: {
          fontSize: 13,
          fontWeight: '600',
     },
     reportOrderBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.sm,
          marginTop: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
     },
     reportOrderBtnText: {
          fontSize: 14,
          fontWeight: '600',
     },
     errorText: {
          fontSize: 16,
          marginBottom: Spacing.md,
     },
     retryBtn: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: 12,
     },
     retryBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
});
