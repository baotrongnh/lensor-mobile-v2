import React from 'react';
import {
     View,
     Text,
     Modal,
     ScrollView,
     TouchableOpacity,
     StyleSheet,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from './CartItem';
import { useRouter } from 'expo-router';

interface CartModalProps {
     visible: boolean;
     onClose: () => void;
}

export function CartModal({ visible, onClose }: CartModalProps) {
     const { colors } = useTheme();
     const router = useRouter();
     const {
          items,
          total,
          count,
          loading,
          fetchCart,
          updateQuantity,
          removeItem,
          clearCart,
     } = useCartStore();

     React.useEffect(() => {
          if (visible) {
               fetchCart();
          }
     }, [visible, fetchCart]);

     const handleCheckout = () => {
          if (items.length === 0) {
               Alert.alert('Empty Cart', 'Please add items to cart before checkout');
               return;
          }
          onClose();
          router.push('/checkout');
     };

     const handleClearCart = () => {
          Alert.alert(
               'Clear Cart',
               'Are you sure you want to remove all items from cart?',
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Clear',
                         style: 'destructive',
                         onPress: async () => {
                              try {
                                   await clearCart();
                              } catch (error) {
                                   Alert.alert('Error', 'Failed to clear cart');
                              }
                         },
                    },
               ]
          );
     };

     return (
          <Modal
               visible={visible}
               animationType="slide"
               presentationStyle="pageSheet"
               onRequestClose={onClose}
          >
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                         <Text style={[styles.title, { color: colors.foreground }]}>
                              Shopping Cart ({count})
                         </Text>
                         <View style={styles.headerButtons}>
                              {items.length > 0 && (
                                   <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
                                        <Text style={[styles.clearText, { color: colors.destructive }]}>Clear</Text>
                                   </TouchableOpacity>
                              )}
                              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                   <Text style={[styles.closeText, { color: colors.foreground }]}>✕</Text>
                              </TouchableOpacity>
                         </View>
                    </View>

                    {/* Content */}
                    {loading && items.length === 0 ? (
                         <View style={styles.centerContent}>
                              <ActivityIndicator size="large" color={colors.primary} />
                         </View>
                    ) : items.length === 0 ? (
                         <View style={styles.centerContent}>
                              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                   Your cart is empty
                              </Text>
                              <TouchableOpacity
                                   style={[styles.shopBtn, { backgroundColor: colors.primary }]}
                                   onPress={onClose}
                              >
                                   <Text style={[styles.shopBtnText, { color: colors.primaryForeground }]}>
                                        Continue Shopping
                                   </Text>
                              </TouchableOpacity>
                         </View>
                    ) : (
                         <>
                              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                                   {items.map((item) => (
                                        <CartItem
                                             key={item.id}
                                             item={item}
                                             onQuantityChange={updateQuantity}
                                             onRemove={removeItem}
                                             disabled={loading}
                                        />
                                   ))}
                              </ScrollView>

                              {/* Footer */}
                              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                   <View style={styles.totalRow}>
                                        <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                                             Subtotal:
                                        </Text>
                                        <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                                             ${total.toFixed(2)}
                                        </Text>
                                   </View>

                                   <TouchableOpacity
                                        style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleCheckout}
                                        disabled={loading}
                                   >
                                        {loading ? (
                                             <ActivityIndicator color={colors.primaryForeground} />
                                        ) : (
                                             <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>
                                                  Proceed to Checkout
                                             </Text>
                                        )}
                                   </TouchableOpacity>
                              </View>
                         </>
                    )}
               </View>
          </Modal>
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
          borderBottomWidth: 1,
     },
     title: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     headerButtons: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
     },
     clearBtn: {
          padding: 4,
     },
     clearText: {
          fontSize: 14,
          fontWeight: '500',
     },
     closeBtn: {
          padding: 4,
     },
     closeText: {
          fontSize: 24,
     },
     scrollView: {
          flex: 1,
     },
     scrollContent: {
          padding: Spacing.lg,
     },
     centerContent: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: Spacing.lg,
     },
     emptyText: {
          fontSize: 16,
     },
     shopBtn: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderRadius: 8,
     },
     shopBtnText: {
          fontSize: 14,
          fontWeight: '600',
     },
     footer: {
          padding: Spacing.lg,
          borderTopWidth: 1,
     },
     totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.md,
     },
     totalLabel: {
          fontSize: 16,
     },
     totalAmount: {
          fontSize: 20,
          fontWeight: 'bold',
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
