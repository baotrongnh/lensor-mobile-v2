import React from 'react';
import {
     View,
     Text,
     ScrollView,
     TouchableOpacity,
     StyleSheet,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { useCartStore } from '@/stores/cartStore';
import { useWalletStore } from '@/stores/walletStore';
import { orderApi } from '@/lib/api/orderApi';
import { CartItem } from '@/components/cart/CartItem';

export default function CheckoutScreen() {
     const { colors } = useTheme();
     const router = useRouter();
     const [processing, setProcessing] = React.useState(false);

     const { items, fetchCart, updateQuantity, removeItem } = useCartStore();
     const { balance, fetchBalance } = useWalletStore();

     // Only show active products in checkout
     const activeItems = React.useMemo(
          () => items.filter(item => item.product?.status === 'active'),
          [items]
     );

     // Calculate total for active items only
     const activeTotal = React.useMemo(() => {
          return activeItems.reduce((sum, item) => {
               const price = parseFloat(item.product?.price || item.price);
               return sum + (price * item.quantity);
          }, 0);
     }, [activeItems]);

     React.useEffect(() => {
          fetchCart();
          fetchBalance();
     }, [fetchCart, fetchBalance]);

     const handleCheckout = async () => {
          if (activeItems.length === 0) {
               Alert.alert('Empty Cart', 'No active products in your cart');
               return;
          }

          if (balance < activeTotal) {
               Alert.alert('Insufficient Balance', 'Please top up your wallet before checkout');
               return;
          }

          const totalVND = Math.round(activeTotal * 25000); // Convert to VND (example rate)

          Alert.alert(
               'Confirm Purchase',
               `Pay ${totalVND.toLocaleString('vi-VN')} ₫ with Wallet?`,
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Confirm',
                         onPress: async () => {
                              setProcessing(true);
                              try {
                                   // Checkout with wallet
                                   await orderApi.checkout();
                                   await fetchCart();
                                   await fetchBalance();

                                   Alert.alert(
                                        'Success',
                                        'Order placed successfully!',
                                        [
                                             {
                                                  text: 'OK',
                                                  onPress: () => {
                                                       router.replace('/purchased-orders');
                                                  },
                                             },
                                        ]
                                   );
                              } catch (error: any) {
                                   console.error('Checkout error:', error);
                                   Alert.alert(
                                        'Error',
                                        error.response?.data?.message || error.message || 'Failed to process order'
                                   );
                              } finally {
                                   setProcessing(false);
                              }
                         },
                    },
               ]
          );
     };

     const insufficientFunds = balance < activeTotal;

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Header */}
               <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/cart')} style={styles.backBtn}>
                         <Text style={[styles.backText, { color: colors.foreground }]}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.foreground }]}>Checkout</Text>
                    <View style={{ width: 60 }} />
               </View>

               <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    {/* Cart Items */}
                    <View style={styles.section}>
                         <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                              Order Summary ({activeItems.length} items)
                         </Text>
                         {activeItems.length === 0 ? (
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   No active products available for checkout
                              </Text>
                         ) : (
                              activeItems.map((item) => (
                                   <CartItem
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={updateQuantity}
                                        onRemove={removeItem}
                                        disabled={processing}
                                   />
                              ))
                         )}
                    </View>

                    {/* Payment Method - Wallet Only */}
                    <View style={styles.section}>
                         <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                              Payment Method
                         </Text>

                         <View
                              style={[
                                   styles.paymentOption,
                                   {
                                        backgroundColor: colors.card,
                                        borderColor: colors.primary,
                                   },
                              ]}
                         >
                              <View style={styles.paymentInfo}>
                                   <Text style={[styles.paymentLabel, { color: colors.foreground }]}>
                                        💰 Wallet
                                   </Text>
                                   <Text style={[styles.paymentBalance, { color: colors.mutedForeground }]}>
                                        Balance: ${balance.toFixed(2)}
                                   </Text>
                              </View>
                              <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                         </View>
                    </View>

                    {/* Total */}
                    <View style={[styles.totalSection, { backgroundColor: colors.card }]}>
                         <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                                   Subtotal:
                              </Text>
                              <Text style={[styles.totalValue, { color: colors.foreground }]}>
                                   {Math.round(activeTotal * 25000).toLocaleString('vi-VN')} ₫
                              </Text>
                         </View>
                         <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, { color: colors.foreground, fontWeight: 'bold' }]}>
                                   Total:
                              </Text>
                              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                                   {Math.round(activeTotal * 25000).toLocaleString('vi-VN')} ₫
                              </Text>
                         </View>
                    </View>

                    {insufficientFunds && (
                         <View style={[styles.warning, { backgroundColor: colors.destructive + '20' }]}>
                              <Text style={[styles.warningText, { color: colors.destructive }]}>
                                   ⚠️ Insufficient wallet balance. Please top up your wallet to continue.
                              </Text>
                         </View>
                    )}

                    {activeItems.length === 0 && (
                         <View style={[styles.warning, { backgroundColor: '#fef3c7' }]}>
                              <Text style={[styles.warningText, { color: '#92400e' }]}>
                                   ⚠️ No active products available for checkout. Please go back to cart.
                              </Text>
                         </View>
                    )}
               </ScrollView>

               {/* Checkout Button */}
               <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                         style={[
                              styles.checkoutBtn,
                              {
                                   backgroundColor: (insufficientFunds || processing || activeItems.length === 0) ? colors.muted : colors.primary
                              },
                         ]}
                         onPress={handleCheckout}
                         disabled={processing || insufficientFunds || activeItems.length === 0}
                    >
                         {processing ? (
                              <ActivityIndicator color={colors.primaryForeground} />
                         ) : (
                              <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>
                                   Place Order - {Math.round(activeTotal * 25000).toLocaleString('vi-VN')} ₫
                              </Text>
                         )}
                    </TouchableOpacity>
               </View>
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
          padding: Spacing.lg,
          paddingTop: 60,
          borderBottomWidth: 1,
     },
     backBtn: {
          width: 60,
     },
     backText: {
          fontSize: 16,
     },
     title: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     content: {
          flex: 1,
     },
     contentContainer: {
          padding: Spacing.lg,
          paddingBottom: Spacing.xxl,
     },
     section: {
          marginBottom: Spacing.xl,
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: Spacing.md,
     },
     emptyText: {
          fontSize: 14,
          textAlign: 'center',
          padding: Spacing.xl,
     },
     paymentOption: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 2,
     },
     paymentInfo: {
          flex: 1,
     },
     paymentLabel: {
          fontSize: 16,
          fontWeight: '500',
          marginBottom: 4,
     },
     paymentBalance: {
          fontSize: 14,
     },
     checkmark: {
          fontSize: 24,
          fontWeight: 'bold',
     },
     totalSection: {
          padding: Spacing.lg,
          borderRadius: 12,
          marginBottom: Spacing.md,
     },
     totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.sm,
     },
     totalLabel: {
          fontSize: 16,
     },
     totalValue: {
          fontSize: 16,
     },
     totalAmount: {
          fontSize: 22,
          fontWeight: 'bold',
     },
     warning: {
          padding: Spacing.md,
          borderRadius: 8,
          marginTop: Spacing.md,
     },
     warningText: {
          fontSize: 14,
          lineHeight: 20,
     },
     footer: {
          padding: Spacing.lg,
          borderTopWidth: 1,
     },
     checkoutBtn: {
          padding: Spacing.md,
          borderRadius: 8,
          alignItems: 'center',
     },
     checkoutText: {
          fontSize: 16,
          fontWeight: '600',
     },
});
