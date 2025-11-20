/**
 * Withdrawal Screen
 * Manage bank cards and create withdrawal requests
 */

import React, { useState } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     TextInput,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CreditCard, Plus, Trash2, CheckCircle2, Circle, ChevronLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { useBankCards, useCreateBankCard, useDeleteBankCard, useCreateWithdrawal } from '@/lib/hooks/useOrderHooks';
import { router, useLocalSearchParams } from 'expo-router';

const VIETNAMESE_BANKS = [
     'Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank',
     'MB Bank', 'ACB', 'VPBank', 'Sacombank', 'HDBank',
     'VIB', 'SHB', 'TPBank', 'OCB', 'SeABank',
     'LienVietPostBank', 'Nam A Bank', 'PGBank', 'BacA Bank', 'VietBank',
     'BaoViet Bank', 'ABBank'
];

export default function WithdrawalScreen() {
     const { colors } = useTheme();
     const params = useLocalSearchParams();
     const orderIds = (params.orderIds as string)?.split(',') || [];

     const { data: bankCards, isLoading, mutate } = useBankCards();
     const { createBankCard, isSubmitting: isCreatingCard } = useCreateBankCard();
     const { deleteBankCard, isDeleting } = useDeleteBankCard();
     const { createWithdrawal, isSubmitting: isCreatingWithdrawal } = useCreateWithdrawal();

     const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
     const [note, setNote] = useState('');
     const [showAddCard, setShowAddCard] = useState(false);

     // Add card form
     const [bankName, setBankName] = useState('');
     const [accountNumber, setAccountNumber] = useState('');
     const [accountHolder, setAccountHolder] = useState('');
     const [showBankPicker, setShowBankPicker] = useState(false);

     const handleAddCard = async () => {
          if (!bankName || !accountNumber || !accountHolder) {
               Alert.alert('Error', 'Please fill all fields');
               return;
          }

          try {
               await createBankCard({
                    bankName,
                    accountNumber,
                    accountHolder,
                    isDefault: (bankCards?.length || 0) === 0,
               });
               mutate();
               setShowAddCard(false);
               setBankName('');
               setAccountNumber('');
               setAccountHolder('');
               Alert.alert('Success', 'Bank card added successfully');
          } catch (error) {
               Alert.alert('Error', 'Failed to add bank card');
          }
     };

     const handleDeleteCard = async (id: string) => {
          Alert.alert(
               'Delete Bank Card',
               'Are you sure you want to delete this bank card?',
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Delete',
                         style: 'destructive',
                         onPress: async () => {
                              try {
                                   await deleteBankCard(id);
                                   mutate();
                                   if (selectedCardId === id) {
                                        setSelectedCardId(null);
                                   }
                                   Alert.alert('Success', 'Bank card deleted');
                              } catch (error) {
                                   Alert.alert('Error', 'Failed to delete bank card');
                              }
                         },
                    },
               ]
          );
     };

     const handleWithdraw = async () => {
          if (!selectedCardId) {
               Alert.alert('Error', 'Please select a bank card');
               return;
          }

          if (orderIds.length === 0) {
               Alert.alert('Error', 'No orders selected');
               return;
          }

          try {
               await createWithdrawal({
                    bankCardId: selectedCardId,
                    orderIds,
                    note: note || undefined,
               });
               Alert.alert('Success', 'Withdrawal request created successfully', [
                    { text: 'OK', onPress: () => router.back() }
               ]);
          } catch (error) {
               Alert.alert('Error', 'Failed to create withdrawal request');
          }
     };

     if (isLoading) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
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
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Withdrawal</Text>
                    <View style={styles.headerRight} />
               </View>

               <ScrollView style={styles.scrollContent}>
                    <View style={styles.content}>
                         <Text style={[styles.title, { color: colors.foreground }]}>
                              Withdrawal Request
                         </Text>

                         {/* Bank Cards Section */}
                         <View style={styles.section}>
                              <View style={styles.sectionHeader}>
                                   <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                        Select Bank Card
                                   </Text>
                                   <TouchableOpacity
                                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                                        onPress={() => setShowAddCard(!showAddCard)}
                                   >
                                        <Plus size={16} color={colors.primaryForeground} />
                                        <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>
                                             Add Card
                                        </Text>
                                   </TouchableOpacity>
                              </View>

                              {/* Add Card Form */}
                              {showAddCard && (
                                   <View style={[styles.addCardForm, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                                        <Text style={[styles.formLabel, { color: colors.foreground }]}>Bank Name</Text>
                                        <TouchableOpacity
                                             style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
                                             onPress={() => setShowBankPicker(!showBankPicker)}
                                        >
                                             <Text style={[styles.inputText, { color: bankName ? colors.foreground : colors.mutedForeground }]}>
                                                  {bankName || 'Select bank'}
                                             </Text>
                                        </TouchableOpacity>

                                        {showBankPicker && (
                                             <ScrollView style={[styles.bankPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                  {VIETNAMESE_BANKS.map(bank => (
                                                       <TouchableOpacity
                                                            key={bank}
                                                            style={[styles.bankOption, { borderBottomColor: colors.border }]}
                                                            onPress={() => {
                                                                 setBankName(bank);
                                                                 setShowBankPicker(false);
                                                            }}
                                                       >
                                                            <Text style={[styles.bankOptionText, { color: colors.foreground }]}>
                                                                 {bank}
                                                            </Text>
                                                       </TouchableOpacity>
                                                  ))}
                                             </ScrollView>
                                        )}

                                        <Text style={[styles.formLabel, { color: colors.foreground }]}>Account Number</Text>
                                        <TextInput
                                             style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                             value={accountNumber}
                                             onChangeText={setAccountNumber}
                                             placeholder="Enter account number"
                                             placeholderTextColor={colors.mutedForeground}
                                             keyboardType="numeric"
                                        />

                                        <Text style={[styles.formLabel, { color: colors.foreground }]}>Account Holder Name</Text>
                                        <TextInput
                                             style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                             value={accountHolder}
                                             onChangeText={setAccountHolder}
                                             placeholder="Enter account holder name"
                                             placeholderTextColor={colors.mutedForeground}
                                        />

                                        <TouchableOpacity
                                             style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                                             onPress={handleAddCard}
                                             disabled={isCreatingCard}
                                        >
                                             {isCreatingCard ? (
                                                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                                             ) : (
                                                  <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                                                       Add Bank Card
                                                  </Text>
                                             )}
                                        </TouchableOpacity>
                                   </View>
                              )}

                              {/* Bank Cards List */}
                              {(bankCards?.length || 0) === 0 ? (
                                   <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                        No bank cards added yet
                                   </Text>
                              ) : (
                                   bankCards?.map((card) => (
                                        <TouchableOpacity
                                             key={card.id}
                                             style={[
                                                  styles.bankCard,
                                                  {
                                                       backgroundColor: colors.card,
                                                       borderColor: selectedCardId === card.id ? colors.primary : colors.border,
                                                       borderWidth: selectedCardId === card.id ? 2 : 1,
                                                  }
                                             ]}
                                             onPress={() => setSelectedCardId(card.id)}
                                        >
                                             <View style={styles.bankCardLeft}>
                                                  {selectedCardId === card.id ? (
                                                       <CheckCircle2 size={24} color={colors.primary} />
                                                  ) : (
                                                       <Circle size={24} color={colors.mutedForeground} />
                                                  )}
                                                  <CreditCard size={32} color={colors.primary} />
                                                  <View style={styles.bankCardInfo}>
                                                       <Text style={[styles.bankCardName, { color: colors.foreground }]}>
                                                            {card.bankName}
                                                       </Text>
                                                       <Text style={[styles.bankCardNumber, { color: colors.mutedForeground }]}>
                                                            **** **** **** {card.accountNumber.slice(-4)}
                                                       </Text>
                                                       <Text style={[styles.bankCardHolder, { color: colors.mutedForeground }]}>
                                                            {card.accountHolder}
                                                       </Text>
                                                  </View>
                                             </View>
                                             <TouchableOpacity
                                                  onPress={() => handleDeleteCard(card.id)}
                                                  disabled={isDeleting}
                                             >
                                                  <Trash2 size={20} color={colors.destructive} />
                                             </TouchableOpacity>
                                        </TouchableOpacity>
                                   ))
                              )}
                         </View>

                         {/* Note Section */}
                         <View style={styles.section}>
                              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                   Note (Optional)
                              </Text>
                              <TextInput
                                   style={[styles.noteInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                                   value={note}
                                   onChangeText={setNote}
                                   placeholder="Add a note..."
                                   placeholderTextColor={colors.mutedForeground}
                                   multiline
                                   numberOfLines={4}
                              />
                         </View>

                         {/* Submit Button */}
                         <TouchableOpacity
                              style={[
                                   styles.withdrawBtn,
                                   { backgroundColor: colors.primary },
                                   (!selectedCardId || orderIds.length === 0) && styles.withdrawBtnDisabled
                              ]}
                              onPress={handleWithdraw}
                              disabled={!selectedCardId || orderIds.length === 0 || isCreatingWithdrawal}
                         >
                              {isCreatingWithdrawal ? (
                                   <ActivityIndicator size="small" color={colors.primaryForeground} />
                              ) : (
                                   <Text style={[styles.withdrawBtnText, { color: colors.primaryForeground }]}>
                                        Create Withdrawal Request
                                   </Text>
                              )}
                         </TouchableOpacity>
                    </View>
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
     },
     scrollContent: {
          flex: 1,
     },
     content: {
          padding: Spacing.md,
     },
     title: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: Spacing.lg,
     },
     section: {
          marginBottom: Spacing.lg,
     },
     sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.md,
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
     },
     addBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: 8,
     },
     addBtnText: {
          fontSize: 14,
          fontWeight: '600',
     },
     addCardForm: {
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          marginBottom: Spacing.md,
     },
     formLabel: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: Spacing.xs,
          marginTop: Spacing.sm,
     },
     input: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
     },
     inputText: {
          fontSize: 14,
     },
     bankPicker: {
          maxHeight: 200,
          borderRadius: 8,
          borderWidth: 1,
          marginTop: Spacing.xs,
     },
     bankOption: {
          padding: Spacing.md,
          borderBottomWidth: 1,
     },
     bankOptionText: {
          fontSize: 14,
     },
     submitBtn: {
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: Spacing.md,
     },
     submitBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          marginVertical: Spacing.lg,
     },
     bankCard: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderRadius: 12,
          marginBottom: Spacing.sm,
     },
     bankCardLeft: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
     },
     bankCardInfo: {
          flex: 1,
     },
     bankCardName: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 2,
     },
     bankCardNumber: {
          fontSize: 14,
          marginBottom: 2,
     },
     bankCardHolder: {
          fontSize: 12,
     },
     noteInput: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          fontSize: 14,
          textAlignVertical: 'top',
          minHeight: 100,
     },
     withdrawBtn: {
          paddingVertical: Spacing.md,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: Spacing.lg,
     },
     withdrawBtnDisabled: {
          opacity: 0.5,
     },
     withdrawBtnText: {
          fontSize: 16,
          fontWeight: 'bold',
     },
});
