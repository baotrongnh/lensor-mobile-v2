/**
 * Withdrawal History Screen
 * Display all withdrawal requests and their status
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
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { useWithdrawals } from '@/lib/hooks/useOrderHooks';
import { formatDate } from '@/lib/utils/dateFormatter';
import { router } from 'expo-router';

const STATUS_CONFIG = {
     pending: {
          label: 'Pending',
          color: '#eab308',
          icon: Clock,
          bgColor: '#fef3c7'
     },
     processing: {
          label: 'Processing',
          color: '#3b82f6',
          icon: AlertCircle,
          bgColor: '#dbeafe'
     },
     completed: {
          label: 'Completed',
          color: '#10b981',
          icon: CheckCircle2,
          bgColor: '#d1fae5'
     },
     rejected: {
          label: 'Rejected',
          color: '#ef4444',
          icon: XCircle,
          bgColor: '#fee2e2'
     },
};

export default function WithdrawalHistoryScreen() {
     const { colors } = useTheme();
     const { data: withdrawals, error, isLoading, mutate, isValidating } = useWithdrawals();
     const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

     const filteredWithdrawals = activeTab === 'all'
          ? (withdrawals || [])
          : (withdrawals || []).filter(w => w.status === activeTab);

     if (error) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.errorText, { color: colors.destructive }]}>
                         Failed to load withdrawal history
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
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Withdrawal History</Text>
                    <View style={styles.headerRight} />
               </View>

               {/* Stats */}
               <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statItem}>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
                         <Text style={[styles.statValue, { color: colors.foreground }]}>
                              {withdrawals?.length || 0}
                         </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
                         <Text style={[styles.statValue, { color: '#eab308' }]}>
                              {withdrawals?.filter(w => w.status === 'pending').length || 0}
                         </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                         <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
                         <Text style={[styles.statValue, { color: '#10b981' }]}>
                              {withdrawals?.filter(w => w.status === 'completed').length || 0}
                         </Text>
                    </View>
               </View>

               {/* Tabs */}
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                    {(['all', 'pending', 'completed', 'rejected'] as const).map(tab => (
                         <TouchableOpacity
                              key={tab}
                              style={[
                                   styles.tab,
                                   activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
                              ]}
                              onPress={() => setActiveTab(tab)}
                         >
                              <Text
                                   style={[
                                        styles.tabText,
                                        { color: activeTab === tab ? colors.primary : colors.mutedForeground }
                                   ]}
                              >
                                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </Text>
                         </TouchableOpacity>
                    ))}
               </ScrollView>

               {/* Withdrawals List */}
               <ScrollView
                    style={styles.list}
                    refreshControl={
                         <RefreshControl refreshing={isValidating} onRefresh={() => mutate()} colors={[colors.primary]} />
                    }
               >
                    {isLoading ? (
                         <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                    ) : filteredWithdrawals.length === 0 ? (
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              No withdrawals found
                         </Text>
                    ) : (
                         filteredWithdrawals.map((withdrawal) => {
                              const statusConfig = STATUS_CONFIG[withdrawal.status as keyof typeof STATUS_CONFIG];
                              const StatusIcon = statusConfig?.icon || Clock;

                              return (
                                   <View
                                        key={withdrawal.id}
                                        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                   >
                                        <View style={styles.cardHeader}>
                                             <View style={[styles.statusBadge, { backgroundColor: statusConfig?.bgColor }]}>
                                                  <StatusIcon size={14} color={statusConfig?.color} />
                                                  <Text style={[styles.statusText, { color: statusConfig?.color }]}>
                                                       {statusConfig?.label}
                                                  </Text>
                                             </View>
                                             <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
                                                  {formatDate(withdrawal.createdAt)}
                                             </Text>
                                        </View>

                                        <View style={styles.cardBody}>
                                             <View style={styles.amountRow}>
                                                  <DollarSign size={20} color={colors.primary} />
                                                  <Text style={[styles.amount, { color: colors.foreground }]}>
                                                       {withdrawal.amount.toLocaleString('vi-VN', { style: 'decimal' })} ₫
                                                  </Text>
                                             </View>

                                             <View style={styles.detailsRow}>
                                                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                                                       Fee:
                                                  </Text>
                                                  <Text style={[styles.detailValue, { color: colors.foreground }]}>
                                                       {withdrawal.fee.toLocaleString('vi-VN', { style: 'decimal' })} ₫
                                                  </Text>
                                             </View>

                                             <View style={styles.detailsRow}>
                                                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                                                       Net Amount:
                                                  </Text>
                                                  <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>
                                                       {(withdrawal.netAmount || withdrawal.actualAmount).toLocaleString('vi-VN', { style: 'decimal' })} ₫
                                                  </Text>
                                             </View>

                                             {withdrawal.bankCard && (
                                                  <View style={[styles.bankInfo, { backgroundColor: colors.muted }]}>
                                                       <Text style={[styles.bankName, { color: colors.foreground }]}>
                                                            {withdrawal.bankCard.bankName}
                                                       </Text>
                                                       <Text style={[styles.bankAccount, { color: colors.mutedForeground }]}>
                                                            **** {withdrawal.bankCard.accountNumber.slice(-4)}
                                                       </Text>
                                                       <Text style={[styles.bankHolder, { color: colors.mutedForeground }]}>
                                                            {withdrawal.bankCard.accountHolder}
                                                       </Text>
                                                  </View>
                                             )}

                                             {withdrawal.note && (
                                                  <Text style={[styles.note, { color: colors.mutedForeground }]}>
                                                       Note: {withdrawal.note}
                                                  </Text>
                                             )}

                                             {withdrawal.adminNote && (
                                                  <View style={[styles.adminNote, { backgroundColor: colors.muted }]}>
                                                       <Text style={[styles.adminNoteLabel, { color: colors.mutedForeground }]}>
                                                            Admin Note:
                                                       </Text>
                                                       <Text style={[styles.adminNoteText, { color: colors.foreground }]}>
                                                            {withdrawal.adminNote}
                                                       </Text>
                                                  </View>
                                             )}

                                             <View style={styles.ordersInfo}>
                                                  <Text style={[styles.ordersLabel, { color: colors.mutedForeground }]}>
                                                       {withdrawal.orders?.length || 0} order(s)
                                                  </Text>
                                             </View>
                                        </View>
                                   </View>
                              );
                         })
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
          margin: Spacing.md,
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
     },
     statItem: {
          flex: 1,
          alignItems: 'center',
     },
     statDivider: {
          width: 1,
          backgroundColor: '#e5e7eb',
          marginHorizontal: Spacing.xs,
     },
     statLabel: {
          fontSize: 12,
          marginBottom: 4,
     },
     statValue: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     tabs: {
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
     },
     tab: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          marginRight: Spacing.xs,
     },
     tabText: {
          fontSize: 14,
          fontWeight: '600',
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
     card: {
          borderRadius: 12,
          borderWidth: 1,
          padding: Spacing.md,
          marginBottom: Spacing.sm,
     },
     cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.sm,
     },
     statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          borderRadius: 6,
     },
     statusText: {
          fontSize: 12,
          fontWeight: '600',
     },
     cardDate: {
          fontSize: 12,
     },
     cardBody: {
          gap: Spacing.xs,
     },
     amountRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.xs,
     },
     amount: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     detailsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     detailLabel: {
          fontSize: 13,
     },
     detailValue: {
          fontSize: 14,
     },
     bankInfo: {
          padding: Spacing.sm,
          borderRadius: 8,
          marginTop: Spacing.xs,
     },
     bankName: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 2,
     },
     bankAccount: {
          fontSize: 13,
          marginBottom: 2,
     },
     bankHolder: {
          fontSize: 12,
     },
     note: {
          fontSize: 13,
          fontStyle: 'italic',
          marginTop: Spacing.xs,
     },
     adminNote: {
          padding: Spacing.sm,
          borderRadius: 8,
          marginTop: Spacing.xs,
     },
     adminNoteLabel: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
     },
     adminNoteText: {
          fontSize: 13,
     },
     ordersInfo: {
          marginTop: Spacing.xs,
     },
     ordersLabel: {
          fontSize: 12,
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
