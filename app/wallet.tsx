/**
 * Wallet Screen - Simple & Clean
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
import { Eye, EyeOff, ChevronLeft, Plus } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { walletApi } from '@/lib/api/walletApi';
import { router } from 'expo-router';
import { Transaction } from '@/types/wallet';
import { formatDate } from '@/lib/utils/dateFormatter';
import { getStatusColor } from '@/lib/utils/statusColors';
import DepositModal from '@/components/wallet/DepositModal';
import { logger } from '@/lib/utils/logger';

export default function WalletScreen() {
     const { colors } = useTheme();
     const [hideBalance, setHideBalance] = useState(true);
     const [balance, setBalance] = useState(0);
     const [transactions, setTransactions] = useState<Transaction[]>([]);
     const [loading, setLoading] = useState(true);
     const [refreshing, setRefreshing] = useState(false);
     const [showDepositModal, setShowDepositModal] = useState(false);

     const loadData = async () => {
          try {
               const [walletRes, historyRes] = await Promise.all([
                    walletApi.getWallet(),
                    walletApi.getPaymentHistory(1, 20),
               ]);
               setBalance(walletRes?.data?.balance || 0);
               setTransactions(historyRes?.data || []);
          } catch (error) {
               logger.error('Error loading wallet data:', error);
          } finally {
               setLoading(false);
               setRefreshing(false);
          }
     };

     useEffect(() => {
          loadData();
     }, []);

     const handleRefresh = () => {
          setRefreshing(true);
          loadData();
     };

     const handleDepositSuccess = () => {
          logger.log('💰 Deposit successful, refreshing wallet...');
          // Refresh wallet data after successful deposit
          handleRefresh();
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
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Wallet</Text>
                    <View style={styles.headerRight} />
               </View>

               <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                         <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
                    }
               >
                    {/* Balance Card */}
                    <View style={[styles.balanceCard, { backgroundColor: colors.primary + '20', borderColor: colors.border }]}>
                         <View style={styles.balanceHeader}>
                              <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
                                   Current Wallet Balance
                              </Text>
                              <TouchableOpacity onPress={() => setHideBalance(!hideBalance)}>
                                   {hideBalance ? (
                                        <EyeOff size={24} color={colors.foreground} />
                                   ) : (
                                        <Eye size={24} color={colors.foreground} />
                                   )}
                              </TouchableOpacity>
                         </View>

                         <View style={styles.balanceContent}>
                              {loading ? (
                                   <ActivityIndicator size="large" color={colors.primary} />
                              ) : (
                                   <Text style={[styles.balanceAmount, { color: colors.foreground }]}>
                                        {hideBalance ? '*.***.***' : balance.toLocaleString('vi-VN')} ₫
                                   </Text>
                              )}
                         </View>

                         {/* Deposit Button */}
                         <TouchableOpacity
                              style={[styles.depositBtn, { backgroundColor: colors.primary }]}
                              onPress={() => setShowDepositModal(true)}
                         >
                              <Plus size={20} color="#fff" />
                              <Text style={styles.depositBtnText}>Deposit</Text>
                         </TouchableOpacity>
                    </View>

                    {/* Transaction History */}
                    <View style={[styles.historySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                         <Text style={[styles.historyTitle, { color: colors.foreground }]}>
                              Transaction History
                         </Text>

                         {loading ? (
                              <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
                         ) : transactions.length === 0 ? (
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   No transactions yet
                              </Text>
                         ) : (
                              transactions.map((transaction) => (
                                   <View
                                        key={transaction.id}
                                        style={[styles.transactionItem, { borderBottomColor: colors.border }]}
                                   >
                                        <View style={styles.transactionLeft}>
                                             <View style={styles.transactionHeader}>
                                                  <Text style={[styles.transactionType, { color: colors.foreground }]}>
                                                       {transaction.transactionType}
                                                  </Text>
                                                  <Text
                                                       style={[
                                                            styles.transactionStatus,
                                                            { color: getStatusColor(transaction.status) },
                                                       ]}
                                                  >
                                                       {transaction.status}
                                                  </Text>
                                             </View>
                                             <Text style={[styles.transactionDesc, { color: colors.mutedForeground }]}>
                                                  {transaction.description}
                                             </Text>
                                             <Text style={[styles.transactionDate, { color: colors.mutedForeground }]}>
                                                  {formatDate(transaction.createdAt)}
                                             </Text>
                                        </View>
                                        <Text style={[styles.transactionAmount, { color: colors.foreground }]}>
                                             {parseFloat(transaction.amount).toLocaleString('vi-VN')} ₫
                                        </Text>
                                   </View>
                              ))
                         )}
                    </View>
               </ScrollView>

               {/* Deposit Modal */}
               <DepositModal
                    visible={showDepositModal}
                    onClose={() => setShowDepositModal(false)}
                    onSuccess={handleDepositSuccess}
               />
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
     scrollView: {
          flex: 1,
          padding: Spacing.md,
     },
     balanceCard: {
          padding: Spacing.lg,
          borderRadius: 16,
          borderWidth: 1,
          marginBottom: Spacing.md,
     },
     balanceHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.md,
     },
     balanceLabel: {
          fontSize: 14,
          fontWeight: '500',
     },
     balanceContent: {
          marginBottom: Spacing.md,
          minHeight: 60,
          justifyContent: 'center',
     },
     balanceAmount: {
          fontSize: 42,
          fontWeight: 'bold',
          letterSpacing: 1,
     },
     depositBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.md,
          borderRadius: 12,
          gap: Spacing.xs,
     },
     depositBtnText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600',
     },
     historySection: {
          padding: Spacing.md,
          borderRadius: 16,
          borderWidth: 1,
     },
     historyTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: Spacing.md,
     },
     loader: {
          marginVertical: Spacing.lg,
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          marginVertical: Spacing.lg,
     },
     transactionItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
     },
     transactionLeft: {
          flex: 1,
     },
     transactionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: 4,
     },
     transactionType: {
          fontSize: 15,
          fontWeight: '600',
          textTransform: 'capitalize',
     },
     transactionStatus: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'uppercase',
     },
     transactionDesc: {
          fontSize: 13,
          marginBottom: 4,
     },
     transactionDate: {
          fontSize: 12,
     },
     transactionAmount: {
          fontSize: 16,
          fontWeight: 'bold',
          marginLeft: Spacing.sm,
     },
});
