/**
 * Sold Orders Screen
 * Display sold orders with withdrawal functionality
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
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckSquare, Square, DollarSign, Package, Clock, Headphones, TrendingUp, ChevronLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { useSoldOrders } from '@/lib/hooks/useOrderHooks';
import { SoldOrder } from '@/types/soldOrder';
import { router } from 'expo-router';
import { formatDate } from '@/lib/utils/dateFormatter';
import { getStatusColor } from '@/lib/utils/statusColors';
import { withdrawalApi } from '@/lib/api/withdrawalApi';
import { WithdrawalStatistics } from '@/types/withdrawal';
import { useDiscountRate } from '@/lib/hooks/useDiscountRate';

export default function SoldOrdersScreen() {
     const { colors } = useTheme();
     const { data: orders, error, isLoading, mutate, isValidating } = useSoldOrders();
     const { discountRate, discountRateNum, isLoading: loadingDiscountRate, error: discountRateError } = useDiscountRate();
     const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
     const [activeTab, setActiveTab] = useState<'all' | 'withdrawable' | 'pending'>('all');
     const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(null);
     const [loadingStats, setLoadingStats] = useState(false);

     useEffect(() => {
          fetchStatistics();
     }, []);

     // Debug statistics state
     useEffect(() => {
          console.log('📊 Statistics state:', {
               loadingStats,
               hasStatistics: !!statistics,
               statistics
          });
     }, [statistics, loadingStats]);

     // Show warning if discount rate failed to load
     useEffect(() => {
          if (discountRateError) {
               console.warn('⚠️ Failed to load discount rate:', discountRateError);
          }
          if (!loadingDiscountRate && discountRateNum === 0) {
               console.warn('⚠️ Discount rate is 0 or not loaded');
          }
     }, [discountRateError, loadingDiscountRate, discountRateNum]);

     const fetchStatistics = async () => {
          try {
               setLoadingStats(true);
               console.log('📊 Fetching withdrawal statistics...');
               const stats = await withdrawalApi.getStatistics();
               console.log('📊 Statistics received:', JSON.stringify(stats, null, 2));
               console.log('📊 Type of stats:', typeof stats);
               console.log('📊 Is object?', stats && typeof stats === 'object');
               console.log('📊 Keys:', stats ? Object.keys(stats) : 'null');
               console.log('📊 totalAmount value:', stats?.totalAmount);
               console.log('📊 totalFee value:', stats?.totalFee);
               console.log('📊 totalActualAmount value:', stats?.totalActualAmount);
               setStatistics(stats);
          } catch (error: any) {
               console.error('❌ Failed to fetch statistics:', error);
               console.error('❌ Error response:', error.response?.data);
               console.error('❌ Error status:', error.response?.status);
               // Gracefully handle if endpoint doesn't exist yet
               if (error.response?.status !== 404) {
                    Alert.alert('Error', 'Failed to load statistics');
               }
          } finally {
               setLoadingStats(false);
          }
     };

     const filteredOrders = orders?.filter(order => {
          if (activeTab === 'all') return true;
          if (activeTab === 'withdrawable') return order.canWithdraw;
          if (activeTab === 'pending') return order.status === 'pending';
          return true;
     }) || [];

     const selectedOrders = orders?.filter(order => selectedOrderIds.includes(order.id)) || [];
     const totalSelectedAmount = selectedOrders.reduce((sum, order) => sum + order.sellerEarnings, 0);

     // Ensure discountRateNum is valid, fallback to 0 if invalid
     const validDiscountRate = !isNaN(discountRateNum) && discountRateNum > 0 ? discountRateNum : 0;
     const fee = totalSelectedAmount * (validDiscountRate / 100);
     const netAmount = totalSelectedAmount - fee;

     // Debug log
     console.log('💰 Withdrawal calculation:', {
          discountRate,
          discountRateNum,
          validDiscountRate,
          totalSelectedAmount,
          feeCalculation: `${totalSelectedAmount} * (${validDiscountRate} / 100)`,
          fee,
          netAmount
     });

     const totalEarnings = orders?.reduce((sum, order) => sum + order.sellerEarnings, 0) || 0;
     const formatCurrency = (amount: number) => {
          return amount.toLocaleString('vi-VN');
     };

     const toggleOrderSelection = (orderId: string) => {
          setSelectedOrderIds(prev =>
               prev.includes(orderId)
                    ? prev.filter(id => id !== orderId)
                    : [...prev, orderId]
          );
     };

     const handleWithdraw = () => {
          if (selectedOrderIds.length === 0) {
               Alert.alert('Notice', 'Please select orders to withdraw');
               return;
          }

          // Warn if discount rate is not loaded
          if (loadingDiscountRate || validDiscountRate === 0) {
               Alert.alert(
                    'Warning',
                    'System fee information is loading or unavailable. The actual fee will be calculated during withdrawal processing.',
                    [
                         { text: 'Cancel', style: 'cancel' },
                         {
                              text: 'Continue', onPress: () => {
                                   router.push({
                                        pathname: '/withdrawal',
                                        params: { orderIds: selectedOrderIds.join(',') }
                                   });
                              }
                         }
                    ]
               );
               return;
          }

          router.push({
               pathname: '/withdrawal',
               params: { orderIds: selectedOrderIds.join(',') }
          });
     };

     if (error) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.errorText, { color: colors.destructive }]}>
                         Failed to load orders
                    </Text>
                    {__DEV__ && (
                         <Text style={[styles.errorDetail, { color: colors.mutedForeground }]}>
                              {error.message}
                         </Text>
                    )}
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

     const handleSupport = (orderId: string) => {
          router.push({
               pathname: '/create-ticket',
               params: {
                    orderId,
                    category: 'order_issue',
               }
          });
     };

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
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Sold Orders</Text>
                    <View style={styles.headerRight} />
               </View>

               {/* Support Button */}
               <View style={styles.topBar}>
                    <TouchableOpacity
                         style={[styles.supportBtn, { backgroundColor: colors.primary }]}
                         onPress={() => router.push('/create-ticket')}
                    >
                         <Headphones size={18} color={colors.primaryForeground} />
                         <Text style={[styles.supportBtnText, { color: colors.primaryForeground }]}>
                              Support
                         </Text>
                    </TouchableOpacity>
               </View>

               {/* Stats Cards */}
               <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Package size={24} color={colors.primary} />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>
                              {orders?.length || 0}
                         </Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                              Total Orders
                         </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <DollarSign size={24} color="#10b981" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>
                              {orders?.filter(o => o.canWithdraw).length || 0}
                         </Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                              Withdrawable
                         </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Clock size={24} color="#eab308" />
                         <Text style={[styles.statValue, { color: colors.foreground }]}>
                              {orders?.filter(o => o.status === 'pending').length || 0}
                         </Text>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                              Pending
                         </Text>
                    </View>
               </View>

               {/* Earnings Summary Card */}
               <View style={[styles.earningsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.earningsHeader}>
                         <TrendingUp size={20} color={colors.primary} />
                         <Text style={[styles.earningsTitle, { color: colors.foreground }]}>
                              Earnings Summary
                         </Text>
                    </View>
                    <View style={styles.earningsContent}>
                         <View style={styles.earningsRow}>
                              <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                                   Total Earnings:
                              </Text>
                              <Text style={[styles.earningsValue, { color: colors.foreground }]}>
                                   {formatCurrency(totalEarnings)} ₫
                              </Text>
                         </View>

                         {loadingStats ? (
                              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: Spacing.sm }} />
                         ) : (
                              <>
                                   <View style={styles.earningsRow}>
                                        <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                                             Total Withdrawn: {statistics ? '(loaded)' : '(null)'}
                                        </Text>
                                        <Text style={[styles.earningsValue, { color: colors.foreground }]}>
                                             {statistics?.totalAmount !== undefined
                                                  ? formatCurrency(statistics.totalAmount)
                                                  : formatCurrency(0)} ₫
                                        </Text>
                                   </View>
                                   <View style={styles.earningsRow}>
                                        <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>
                                             Platform Fee ({loadingDiscountRate ? '...' : discountRate || '0'}%):
                                        </Text>
                                        <Text style={[styles.earningsValue, { color: '#ef4444' }]}>
                                             -{statistics?.totalFee !== undefined
                                                  ? formatCurrency(statistics.totalFee)
                                                  : formatCurrency(0)} ₫
                                        </Text>
                                   </View>
                                   <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                   <View style={styles.earningsRow}>
                                        <Text style={[styles.earningsLabelBold, { color: colors.foreground }]}>
                                             Total Received:
                                        </Text>
                                        <Text style={[styles.earningsValueBold, { color: '#10b981' }]}>
                                             {statistics?.totalActualAmount !== undefined
                                                  ? formatCurrency(statistics.totalActualAmount)
                                                  : formatCurrency(0)} ₫
                                        </Text>
                                   </View>
                              </>
                         )}
                    </View>
               </View>

               {/* Tabs */}
               <View style={styles.tabs}>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'all' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                         onPress={() => setActiveTab('all')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.primary : colors.mutedForeground }]}>
                              All
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'withdrawable' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                         onPress={() => setActiveTab('withdrawable')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'withdrawable' ? colors.primary : colors.mutedForeground }]}>
                              Withdrawable
                         </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                         style={[styles.tab, activeTab === 'pending' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                         onPress={() => setActiveTab('pending')}
                    >
                         <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.primary : colors.mutedForeground }]}>
                              Pending
                         </Text>
                    </TouchableOpacity>
               </View>

               {/* Orders List */}
               <ScrollView
                    style={styles.ordersList}
                    refreshControl={
                         <RefreshControl refreshing={isValidating} onRefresh={() => mutate()} colors={[colors.primary]} />
                    }
               >
                    {isLoading ? (
                         <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : filteredOrders.length === 0 ? (
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              No orders found
                         </Text>
                    ) : (
                         filteredOrders.map((order) => (
                              <View
                                   key={order.id}
                                   style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                              >
                                   <View style={styles.orderHeader}>
                                        <TouchableOpacity
                                             onPress={() => order.canWithdraw && toggleOrderSelection(order.id)}
                                             disabled={!order.canWithdraw}
                                        >
                                             {selectedOrderIds.includes(order.id) ? (
                                                  <CheckSquare size={24} color={colors.primary} />
                                             ) : (
                                                  <Square size={24} color={order.canWithdraw ? colors.foreground : colors.muted} />
                                             )}
                                        </TouchableOpacity>

                                        <View style={styles.orderHeaderText}>
                                             <Text style={[styles.orderId, { color: colors.foreground }]}>
                                                  Order #{order.id.slice(0, 8)}
                                             </Text>
                                             <Text
                                                  style={[
                                                       styles.orderStatus,
                                                       { color: getStatusColor(order.status) }
                                                  ]}
                                             >
                                                  {order.status.replace('_', ' ')}
                                             </Text>
                                        </View>

                                        <TouchableOpacity
                                             style={[styles.orderSupportBtn, { borderColor: colors.border }]}
                                             onPress={() => handleSupport(order.id)}
                                        >
                                             <Headphones size={16} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                   </View>

                                   <View style={styles.orderContent}>
                                        <Text style={[styles.orderLabel, { color: colors.mutedForeground }]}>
                                             Items: {order.sellerItems.length}
                                        </Text>
                                        <Text style={[styles.orderAmount, { color: colors.foreground }]}>
                                             Earnings: {order.sellerEarnings.toLocaleString('vi-VN')} ₫
                                        </Text>
                                        {order.canWithdraw && (
                                             <Text style={[styles.orderWithdrawable, { color: '#10b981' }]}>
                                                  ✓ Ready to withdraw
                                             </Text>
                                        )}
                                        {!order.canWithdraw && order.withdrawableAt && (
                                             <Text style={[styles.orderWithdrawable, { color: '#eab308' }]}>
                                                  Withdrawable at: {formatDate(order.withdrawableAt)}
                                             </Text>
                                        )}
                                   </View>

                                   <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                                        Created: {formatDate(order.createdAt)}
                                   </Text>
                              </View>
                         ))
                    )}
               </ScrollView>

               {/* Bottom Action Bar */}
               {selectedOrderIds.length > 0 && (
                    <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                         <View style={styles.actionBarLeft}>
                              <Text style={[styles.selectedCount, { color: colors.foreground }]}>
                                   {selectedOrderIds.length} selected
                              </Text>
                              <Text style={[styles.netAmount, { color: colors.primary }]}>
                                   Net: {netAmount.toLocaleString('vi-VN')} ₫
                              </Text>
                              <Text style={[styles.feeText, { color: colors.mutedForeground }]}>
                                   (Fee: {fee.toLocaleString('vi-VN')} ₫)
                              </Text>
                         </View>
                         <TouchableOpacity
                              style={[styles.withdrawBtn, { backgroundColor: colors.primary }]}
                              onPress={handleWithdraw}
                         >
                              <DollarSign size={20} color={colors.primaryForeground} />
                              <Text style={[styles.withdrawBtnText, { color: colors.primaryForeground }]}>
                                   Withdraw
                              </Text>
                         </TouchableOpacity>
                    </View>
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
     topBar: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: Spacing.md,
          paddingBottom: 0,
     },
     supportBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: 8,
     },
     supportBtnText: {
          fontSize: 13,
          fontWeight: '600',
     },
     statsRow: {
          flexDirection: 'row',
          padding: Spacing.md,
          gap: Spacing.sm,
     },
     statCard: {
          flex: 1,
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          alignItems: 'center',
          gap: Spacing.xs,
     },
     statValue: {
          fontSize: 24,
          fontWeight: 'bold',
     },
     statLabel: {
          fontSize: 12,
          textAlign: 'center',
     },
     earningsCard: {
          marginHorizontal: Spacing.md,
          marginBottom: Spacing.md,
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
     },
     earningsHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.sm,
     },
     earningsTitle: {
          fontSize: 16,
          fontWeight: '600',
     },
     earningsContent: {
          gap: Spacing.xs,
     },
     earningsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 4,
     },
     earningsLabel: {
          fontSize: 14,
     },
     earningsValue: {
          fontSize: 14,
          fontWeight: '500',
     },
     earningsLabelBold: {
          fontSize: 15,
          fontWeight: '700',
     },
     earningsValueBold: {
          fontSize: 16,
          fontWeight: '700',
     },
     divider: {
          height: 1,
          marginVertical: Spacing.xs,
     },
     tabs: {
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
     },
     tab: {
          flex: 1,
          paddingVertical: Spacing.sm,
          alignItems: 'center',
     },
     tabText: {
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'capitalize',
     },
     ordersList: {
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
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          marginBottom: Spacing.sm,
     },
     orderHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.sm,
     },
     orderHeaderText: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginRight: Spacing.sm,
     },
     orderSupportBtn: {
          padding: Spacing.xs,
          borderRadius: 6,
          borderWidth: 1,
     },
     orderId: {
          fontSize: 15,
          fontWeight: '600',
     },
     orderStatus: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'capitalize',
     },
     orderContent: {
          gap: 4,
          marginBottom: Spacing.sm,
     },
     orderLabel: {
          fontSize: 13,
     },
     orderAmount: {
          fontSize: 16,
          fontWeight: 'bold',
     },
     orderWithdrawable: {
          fontSize: 12,
          fontWeight: '600',
     },
     orderDate: {
          fontSize: 12,
     },
     actionBar: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderTopWidth: 1,
     },
     actionBarLeft: {
          flex: 1,
     },
     selectedCount: {
          fontSize: 14,
          fontWeight: '600',
     },
     netAmount: {
          fontSize: 18,
          fontWeight: 'bold',
          marginTop: 2,
     },
     feeText: {
          fontSize: 12,
     },
     withdrawBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: 12,
     },
     withdrawBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
     errorText: {
          fontSize: 16,
          marginBottom: Spacing.md,
          textAlign: 'center',
     },
     errorDetail: {
          fontSize: 12,
          marginBottom: Spacing.md,
          textAlign: 'center',
          paddingHorizontal: Spacing.lg,
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
