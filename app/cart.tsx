/**
 * Cart Screen
 * Shopping cart with selection and checkout
 */

import React, { useState, useEffect, useRef } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     TouchableOpacity,
     ActivityIndicator,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Trash2, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { Spacing } from '@/constants/Colors';
import { useCartStore } from '@/stores/cartStore';
import { router } from 'expo-router';
import { CartItem } from '@/components/cart/CartItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
     const { colors } = useTheme();
     const { items, count, loading, fetchCart, clearCart, removeItem, addToCart } = useCartStore();
     const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
     const hasSyncedTempCart = useRef(false);

     useEffect(() => {
          fetchCart();
     }, [fetchCart]);

     // Sync temp cart after login
     useEffect(() => {
          const syncTempCart = async () => {
               if (hasSyncedTempCart.current || loading) return;

               try {
                    const tempCartJson = await AsyncStorage.getItem('temp_cart');
                    if (!tempCartJson) return;

                    const tempCartItem = JSON.parse(tempCartJson);

                    // Check if item already exists in cart
                    const itemExists = items.some(item => item.product?.id === tempCartItem.productId);

                    if (!itemExists) {
                         hasSyncedTempCart.current = true;
                         await addToCart(tempCartItem.productId, tempCartItem.quantity || 1);
                         Alert.alert('Success', 'Cart item synced!');
                    }

                    // Clean up temp cart
                    await AsyncStorage.removeItem('temp_cart');
                    hasSyncedTempCart.current = true;
               } catch (error) {
                    console.error('Error syncing temp cart:', error);
               }
          };

          syncTempCart();
     }, [items, loading, addToCart]);

     const activeItems = items.filter(item => item.product?.status === 'active');
     const selectedCartItems = items.filter(item => selectedItems.has(item.id));
     const subtotal = selectedCartItems.reduce((sum, item) => {
          const price = parseFloat(item.product?.price || item.price);
          return sum + (price * item.quantity);
     }, 0);

     const handleSelectItem = (itemId: string, selected: boolean) => {
          setSelectedItems(prev => {
               const newSet = new Set(prev);
               if (selected) {
                    newSet.add(itemId);
               } else {
                    newSet.delete(itemId);
               }
               return newSet;
          });
     };

     const handleRemoveItem = async (cartItemId: string) => {
          Alert.alert(
               'Remove Item',
               'Are you sure you want to remove this item from cart?',
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Remove',
                         style: 'destructive',
                         onPress: async () => {
                              try {
                                   await removeItem(cartItemId);
                                   setSelectedItems(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(cartItemId);
                                        return newSet;
                                   });
                                   Alert.alert('Success', 'Item removed from cart');
                              } catch {
                                   Alert.alert('Error', 'Failed to remove item');
                              }
                         },
                    },
               ]
          );
     };

     const handleClearCart = () => {
          Alert.alert(
               'Clear Cart',
               'Are you sure you want to remove all items?',
               [
                    { text: 'Cancel', style: 'cancel' },
                    {
                         text: 'Clear All',
                         style: 'destructive',
                         onPress: async () => {
                              try {
                                   await clearCart();
                                   setSelectedItems(new Set());
                                   Alert.alert('Success', 'Cart cleared');
                              } catch {
                                   Alert.alert('Error', 'Failed to clear cart');
                              }
                         },
                    },
               ]
          );
     };

     const handleCheckout = () => {
          if (selectedItems.size === 0) {
               Alert.alert('Error', 'Please select items to checkout');
               return;
          }

          const hasUnavailable = selectedCartItems.some(item => item.product?.status !== 'active');
          if (hasUnavailable) {
               Alert.alert('Error', 'Cannot checkout with unavailable products');
               return;
          }

          router.push({
               pathname: '/checkout',
               params: {
                    selectedItems: Array.from(selectedItems).join(',')
               }
          });
     };

     if (loading && items.length === 0) {
          return (
               <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               {/* Header */}
               <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.headerRow}>
                         <TouchableOpacity
                              style={styles.backBtn}
                              onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/marketplace')}
                         >
                              <ChevronLeft size={24} color={colors.foreground} />
                         </TouchableOpacity>
                         <View style={styles.headerCenter}>
                              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                   Shopping Cart
                              </Text>
                              {count > 0 && (
                                   <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                                        {count} {count === 1 ? 'item' : 'items'}
                                   </Text>
                              )}
                         </View>
                         {items.length > 0 && (
                              <TouchableOpacity
                                   style={styles.clearBtn}
                                   onPress={handleClearCart}
                              >
                                   <Trash2 size={20} color={colors.destructive} />
                              </TouchableOpacity>
                         )}
                    </View>
               </View>

               {items.length === 0 ? (
                    <View style={styles.emptyContainer}>
                         <ShoppingCart size={64} color={colors.mutedForeground} />
                         <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                              Your cart is empty
                         </Text>
                         <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                              Add some presets to get started
                         </Text>
                         <TouchableOpacity
                              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
                              onPress={() => router.push('/(tabs)/marketplace')}
                         >
                              <Text style={[styles.shopBtnText, { color: colors.primaryForeground }]}>
                                   Browse Marketplace
                              </Text>
                         </TouchableOpacity>
                    </View>
               ) : (
                    <>
                         <ScrollView style={styles.content}>
                              {activeItems.length < items.length && (
                                   <View style={[styles.warningBanner, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
                                        <AlertCircle size={16} color="#f59e0b" />
                                        <Text style={[styles.warningText, { color: '#92400e' }]}>
                                             Some products are unavailable and cannot be purchased
                                        </Text>
                                   </View>
                              )}

                              {items.map((item) => (
                                   <CartItem
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedItems.has(item.id)}
                                        onSelect={handleSelectItem}
                                        onRemove={handleRemoveItem}
                                        disabled={loading}
                                   />
                              ))}
                         </ScrollView>

                         {/* Bottom Summary */}
                         <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                              <View style={styles.summarySection}>
                                   <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                                             Selected Items
                                        </Text>
                                        <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                                             {selectedItems.size}
                                        </Text>
                                   </View>
                                   <View style={styles.summaryRow}>
                                        <Text style={[styles.totalLabel, { color: colors.foreground }]}>
                                             Total
                                        </Text>
                                        <Text style={[styles.totalValue, { color: colors.primary }]}>
                                             {subtotal.toLocaleString('vi-VN')} ₫
                                        </Text>
                                   </View>
                              </View>
                              <TouchableOpacity
                                   style={[
                                        styles.checkoutBtn,
                                        { backgroundColor: colors.primary },
                                        (selectedItems.size === 0 || selectedCartItems.some(item => item.product?.status !== 'active')) && styles.checkoutBtnDisabled
                                   ]}
                                   onPress={handleCheckout}
                                   disabled={selectedItems.size === 0 || selectedCartItems.some(item => item.product?.status !== 'active')}
                              >
                                   <Text style={[styles.checkoutBtnText, { color: colors.primaryForeground }]}>
                                        Proceed to Checkout
                                   </Text>
                              </TouchableOpacity>
                         </View>
                    </>
               )}
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
     },
     centerContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     header: {
          paddingTop: Spacing.xxl + Spacing.md,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
     },
     headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
     },
     backBtn: {
          padding: Spacing.xs,
          marginRight: Spacing.sm,
     },
     headerCenter: {
          flex: 1,
     },
     clearBtn: {
          padding: Spacing.xs,
          marginLeft: Spacing.sm,
     },
     headerTitle: {
          fontSize: 18,
          fontWeight: 'bold',
     },
     headerSubtitle: {
          fontSize: 13,
          marginTop: 2,
     },
     emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
     },
     emptyTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: Spacing.lg,
          marginBottom: Spacing.xs,
     },
     emptyText: {
          fontSize: 14,
          marginBottom: Spacing.lg,
     },
     shopBtn: {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderRadius: 12,
     },
     shopBtnText: {
          fontSize: 15,
          fontWeight: '600',
     },
     content: {
          flex: 1,
          padding: Spacing.md,
     },
     warningBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          padding: Spacing.md,
          borderRadius: 8,
          borderWidth: 1,
          marginBottom: Spacing.md,
     },
     warningText: {
          flex: 1,
          fontSize: 13,
     },
     bottomBar: {
          padding: Spacing.md,
          borderTopWidth: 1,
     },
     summarySection: {
          marginBottom: Spacing.md,
     },
     summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.xs,
     },
     summaryLabel: {
          fontSize: 14,
     },
     summaryValue: {
          fontSize: 14,
          fontWeight: '600',
     },
     totalLabel: {
          fontSize: 16,
          fontWeight: 'bold',
     },
     totalValue: {
          fontSize: 20,
          fontWeight: 'bold',
     },
     checkoutBtn: {
          paddingVertical: Spacing.md,
          borderRadius: 12,
          alignItems: 'center',
     },
     checkoutBtnDisabled: {
          opacity: 0.5,
     },
     checkoutBtnText: {
          fontSize: 16,
          fontWeight: 'bold',
     },
});
