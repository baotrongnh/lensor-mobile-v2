/**
 * Marketplace Detail Screen
 * Trang chi tiết của marketplace item
 */

import React, { useState, useMemo } from 'react';
import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     Image,
     TouchableOpacity,
     ActivityIndicator,
     Dimensions,
     Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Star, ShoppingCart, ArrowLeft, User, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { useMarketplaceDetail } from '@/lib/hooks/useMarketplaceHooks';
import { useCartStore } from '@/stores/cartStore';
import { useChatStore } from '@/stores/chatStore';
import { orderApi } from '@/lib/api/orderApi';
import { BASE_URL, DEFAULT_IMAGE } from '@/constants';
import { EmptyState } from '@/components/empty/EmptyState';
import { ImageComparison } from '@/components/marketplace/ImageComparison';
import { MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MarketplaceDetailScreen() {
     const { id } = useLocalSearchParams();
     const { colors } = useTheme();
     const router = useRouter();
     const { data: item, isLoading, error } = useMarketplaceDetail(id as string);
     const [selectedImageIndex, setSelectedImageIndex] = useState(0);
     const [imageError, setImageError] = useState(false);
     const { items: cartItems, addToCart, fetchCart } = useCartStore();
     const { createDirectChat } = useChatStore();
     const [isAdding, setIsAdding] = useState(false);
     const [isCreatingChat, setIsCreatingChat] = useState(false);
     const [purchasedOrders, setPurchasedOrders] = useState<any[]>([]);
     const [loadingPurchased, setLoadingPurchased] = useState(true);

     // Check if product is in cart
     const isInCart = useMemo(() => {
          if (!cartItems || !id) return false;
          return cartItems.some(item => item.product?.id === id);
     }, [cartItems, id]);

     // Check if user already bought this product
     const isUserBought = useMemo(() => {
          if (!purchasedOrders || !id) return false;
          return purchasedOrders.some(order =>
               order.items?.some((item: any) => item.productId === id)
          );
     }, [purchasedOrders, id]);

     // Fetch cart and purchased orders on mount
     React.useEffect(() => {
          fetchCart();

          const fetchPurchasedOrders = async () => {
               try {
                    const response = await orderApi.getAllOrders();
                    setPurchasedOrders(response.data || []);
               } catch (error) {
                    console.error('Failed to fetch purchased orders:', error);
               } finally {
                    setLoadingPurchased(false);
               }
          };

          fetchPurchasedOrders();
     }, [fetchCart]);

     const getImageSrc = (imagePath: string | undefined) => {
          if (imageError || !imagePath) return DEFAULT_IMAGE;
          if (imagePath.startsWith('http')) return imagePath;
          return `${BASE_URL}${imagePath}`;
     };

     const handleAddToCart = async () => {
          if (!id) return;

          // Check if already in cart
          if (isInCart) {
               Alert.alert(
                    'Already in Cart',
                    'This product is already in your cart',
                    [
                         { text: 'Continue Shopping', style: 'cancel' },
                         { text: 'View Cart', onPress: () => router.push('/cart') }
                    ]
               );
               return;
          }

          // Check if already purchased
          if (isUserBought) {
               Alert.alert(
                    'Already Purchased',
                    'You have already purchased this product',
                    [
                         { text: 'OK', style: 'cancel' },
                         { text: 'View Purchases', onPress: () => router.push('/purchased-orders') }
                    ]
               );
               return;
          }

          setIsAdding(true);
          try {
               await addToCart(id as string, 1);
               await fetchCart(); // Refresh cart

               Alert.alert(
                    'Success',
                    'Added to cart successfully',
                    [
                         { text: 'Continue Shopping', style: 'cancel' },
                         { text: 'View Cart', onPress: () => router.push('/cart') }
                    ]
               );
          } catch (error: any) {
               console.error('Add to cart error:', error);

               // Handle 403 - Product already in cart (from backend)
               if (error.response?.status === 403) {
                    const errorMsg = error.response?.data?.message || '';

                    if (errorMsg.includes('already in cart') || errorMsg.includes('already exists')) {
                         Alert.alert(
                              'Already in Cart',
                              'This product is already in your cart',
                              [
                                   { text: 'Continue Shopping', style: 'cancel' },
                                   { text: 'View Cart', onPress: () => router.push('/cart') }
                              ]
                         );
                         // Refresh cart to update UI
                         await fetchCart();
                         return;
                    }

                    if (errorMsg.includes('already purchased') || errorMsg.includes('already bought')) {
                         Alert.alert(
                              'Already Purchased',
                              'You have already purchased this product',
                              [
                                   { text: 'OK', style: 'cancel' },
                                   { text: 'View Purchases', onPress: () => router.push('/purchased-orders') }
                              ]
                         );
                         return;
                    }
               }

               // Generic error
               Alert.alert(
                    'Error',
                    error.response?.data?.message || 'Failed to add to cart. Please try again.'
               );
          } finally {
               setIsAdding(false);
          }
     };

     const handleContactSeller = async () => {
          // Try to get userId from item.author or item.userId
          const sellerId = (item as any)?.userId || (item as any)?.author?.id || (item as any)?.authorId;

          if (!sellerId) {
               Alert.alert('Error', 'Seller information not available');
               return;
          }

          setIsCreatingChat(true);
          try {
               // Create or get direct chat with seller
               await createDirectChat(sellerId);

               // Wait a moment for store to update
               await new Promise(resolve => setTimeout(resolve, 300));

               // Navigate to chat detail with the seller's userId
               router.push(`/chat-detail/${sellerId}`);
          } catch (error) {
               Alert.alert('Error', 'Failed to create chat. Please try again.');
          } finally {
               setIsCreatingChat(false);
          }
     };

     if (isLoading) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <Stack.Screen
                         options={{
                              headerShown: true,
                              title: 'Loading...',
                              headerStyle: { backgroundColor: colors.card },
                              headerTintColor: colors.foreground,
                         }}
                    />
                    <View style={styles.loadingContainer}>
                         <ActivityIndicator size="large" color={colors.primary} />
                    </View>
               </View>
          );
     }

     if (error || !item) {
          return (
               <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <Stack.Screen
                         options={{
                              headerShown: true,
                              title: 'Error',
                              headerStyle: { backgroundColor: colors.card },
                              headerTintColor: colors.foreground,
                         }}
                    />
                    <EmptyState
                         title="Failed to load product"
                         description="Please try again later"
                    />
               </View>
          );
     }

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <Stack.Screen
                    options={{
                         headerShown: true,
                         title: item.name || 'Product Detail',
                         headerStyle: { backgroundColor: colors.card },
                         headerTintColor: colors.foreground,
                         headerLeft: () => (
                              <TouchableOpacity
                                   onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/marketplace')}
                                   style={styles.backButton}
                              >
                                   <ArrowLeft size={24} color={colors.foreground} />
                              </TouchableOpacity>
                         ),
                    }}
               />

               <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
               >
                    {/* Image Gallery with Comparison */}
                    <View style={styles.imageSection}>
                         {item.imagePairs && item.imagePairs[selectedImageIndex] ? (
                              <ImageComparison
                                   imagePair={item.imagePairs[selectedImageIndex]}
                                   label={
                                        item.imagePairs.length > 1
                                             ? `${item.name} - Preset ${selectedImageIndex + 1}`
                                             : item.name
                                   }
                              />
                         ) : (
                              <Image
                                   source={{
                                        uri: getImageSrc(
                                             item.imagePairs?.[0]?.after
                                        ),
                                   }}
                                   style={styles.mainImage}
                                   resizeMode="cover"
                                   onError={() => setImageError(true)}
                              />
                         )}

                         {/* Thumbnails */}
                         {item.imagePairs && item.imagePairs.length > 1 && (
                              <ScrollView
                                   horizontal
                                   showsHorizontalScrollIndicator={false}
                                   style={styles.thumbnailScroll}
                                   contentContainerStyle={styles.thumbnailContent}
                              >
                                   {item.imagePairs.map((pair, index) => (
                                        <TouchableOpacity
                                             key={index}
                                             onPress={() => setSelectedImageIndex(index)}
                                             style={[
                                                  styles.thumbnailContainer,
                                                  selectedImageIndex === index && {
                                                       borderColor: colors.primary,
                                                       borderWidth: 2,
                                                  },
                                             ]}
                                        >
                                             <Image
                                                  source={{ uri: getImageSrc(pair.after) }}
                                                  style={styles.thumbnail}
                                                  resizeMode="cover"
                                             />
                                        </TouchableOpacity>
                                   ))}
                              </ScrollView>
                         )}
                    </View>

                    {/* Product Info */}
                    <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
                         <Text style={[styles.productName, { color: colors.foreground }]}>
                              {item.name}
                         </Text>

                         {/* Author */}
                         {item.author && (
                              <View style={styles.authorContainer}>
                                   <View style={[styles.authorAvatar, { backgroundColor: colors.muted }]}>
                                        <User size={20} color={colors.mutedForeground} />
                                   </View>
                                   <Text style={[styles.authorName, { color: colors.foreground }]}>
                                        {item.author.name}
                                   </Text>
                              </View>
                         )}

                         {/* Rating */}
                         <View style={styles.ratingContainer}>
                              <View style={styles.stars}>
                                   {[...Array(5)].map((_, i) => (
                                        <Star
                                             key={i}
                                             size={20}
                                             color="#FFC107"
                                             fill={i < Math.floor(item.rating || 0) ? '#FFC107' : 'none'}
                                        />
                                   ))}
                              </View>
                              <Text style={[styles.ratingText, { color: colors.foreground }]}>
                                   {item.rating?.toFixed(1) || '0.0'}
                              </Text>
                              <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
                                   ({item.reviewCount || 0} reviews)
                              </Text>
                         </View>

                         {/* Price */}
                         <View style={styles.priceContainer}>
                              <Text style={[styles.price, { color: colors.foreground }]}>
                                   {item.price?.toLocaleString('vi-VN') || '0'} ₫
                              </Text>
                              {item.originalPrice && item.originalPrice > item.price && (
                                   <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                                        {item.originalPrice.toLocaleString('vi-VN')} ₫
                                   </Text>
                              )}
                         </View>

                         {/* Description */}
                         <View style={styles.descriptionContainer}>
                              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                   Description
                              </Text>
                              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                                   {item.description}
                              </Text>
                         </View>

                         {/* Features */}
                         {item.features && item.features.length > 0 && (
                              <View style={styles.featuresContainer}>
                                   <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                        Features
                                   </Text>
                                   <View style={styles.featuresList}>
                                        {item.features.map((feature, index) => (
                                             <View
                                                  key={index}
                                                  style={[
                                                       styles.featureChip,
                                                       {
                                                            backgroundColor: colors.muted,
                                                            borderColor: colors.border,
                                                       },
                                                  ]}
                                             >
                                                  <Text style={[styles.featureText, { color: colors.foreground }]}>
                                                       {feature}
                                                  </Text>
                                             </View>
                                        ))}
                                   </View>
                              </View>
                         )}

                         {/* In Cart Badge - giống web */}
                         {isInCart && (
                              <View style={[styles.statusBadge, {
                                   backgroundColor: '#f0fdf4',
                                   borderColor: '#86efac'
                              }]}>
                                   <CheckCircle size={20} color="#16a34a" />
                                   <View style={{ flex: 1 }}>
                                        <Text style={[styles.statusBadgeTitle, { color: '#166534' }]}>
                                             Already in your cart
                                        </Text>
                                        <Text style={[styles.statusBadgeDesc, { color: '#15803d' }]}>
                                             This preset is ready for checkout
                                        </Text>
                                   </View>
                                   <TouchableOpacity
                                        style={[styles.statusBadgeButton, { borderColor: '#86efac' }]}
                                        onPress={() => router.push('/cart')}
                                   >
                                        <Text style={[styles.statusBadgeButtonText, { color: '#16a34a' }]}>
                                             View Cart
                                        </Text>
                                   </TouchableOpacity>
                              </View>
                         )}

                         {/* Already Purchased Badge */}
                         {isUserBought && (
                              <View style={[styles.statusBadge, {
                                   backgroundColor: '#eff6ff',
                                   borderColor: '#93c5fd'
                              }]}>
                                   <CheckCircle size={20} color="#2563eb" />
                                   <View style={{ flex: 1 }}>
                                        <Text style={[styles.statusBadgeTitle, { color: '#1e40af' }]}>
                                             Already purchased
                                        </Text>
                                        <Text style={[styles.statusBadgeDesc, { color: '#1d4ed8' }]}>
                                             You own this product
                                        </Text>
                                   </View>
                                   <TouchableOpacity
                                        style={[styles.statusBadgeButton, { borderColor: '#93c5fd' }]}
                                        onPress={() => router.push('/purchased-orders')}
                                   >
                                        <Text style={[styles.statusBadgeButtonText, { color: '#2563eb' }]}>
                                             View Purchases
                                        </Text>
                                   </TouchableOpacity>
                              </View>
                         )}
                    </View>
               </ScrollView>

               {/* Bottom Action Bar */}
               {!isUserBought && (
                    <View style={[styles.bottomBar, {
                         backgroundColor: colors.card,
                         borderTopColor: colors.border,
                    }]}>
                         <TouchableOpacity
                              style={[styles.contactButton, {
                                   backgroundColor: colors.card,
                                   borderColor: colors.primary,
                              }]}
                              onPress={handleContactSeller}
                              activeOpacity={0.8}
                              disabled={isCreatingChat}
                         >
                              {isCreatingChat ? (
                                   <ActivityIndicator size="small" color={colors.primary} />
                              ) : (
                                   <>
                                        <MessageCircle size={20} color={colors.primary} />
                                        <Text style={[styles.contactText, { color: colors.primary }]}>Contact</Text>
                                   </>
                              )}
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={[
                                   styles.addToCartButton,
                                   { backgroundColor: isInCart ? colors.muted : colors.primary }
                              ]}
                              onPress={isInCart ? () => router.push('/cart') : handleAddToCart}
                              activeOpacity={0.8}
                              disabled={isAdding || loadingPurchased}
                         >
                              {isAdding ? (
                                   <ActivityIndicator size="small" color="#fff" />
                              ) : isInCart ? (
                                   <>
                                        <CheckCircle size={20} color={colors.foreground} />
                                        <Text style={[styles.addToCartText, { color: colors.foreground }]}>
                                             In Cart
                                        </Text>
                                   </>
                              ) : (
                                   <>
                                        <ShoppingCart size={20} color="#fff" />
                                        <Text style={styles.addToCartText}>Add to Cart</Text>
                                   </>
                              )}
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
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     scrollContent: {
          paddingBottom: 80,
     },
     backButton: {
          padding: Spacing.sm,
          marginLeft: Spacing.xs,
     },
     imageSection: {
          backgroundColor: '#000',
          padding: Spacing.md,
     },
     mainImage: {
          width: width - 2 * Spacing.md,
          aspectRatio: 1,
          borderRadius: 12,
     },
     thumbnailScroll: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
     },
     thumbnailContent: {
          padding: Spacing.sm,
          gap: Spacing.sm,
     },
     thumbnailContainer: {
          borderRadius: 8,
          overflow: 'hidden',
     },
     thumbnail: {
          width: 60,
          height: 60,
     },
     infoSection: {
          padding: Spacing.lg,
     },
     productName: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.md,
     },
     authorContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.md,
          gap: Spacing.sm,
     },
     authorAvatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
     },
     authorName: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
     },
     ratingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.md,
          gap: Spacing.xs,
     },
     stars: {
          flexDirection: 'row',
          gap: 2,
     },
     ratingText: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
          marginLeft: Spacing.xs,
     },
     reviewCount: {
          fontSize: FontSizes.sm,
     },
     priceContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.lg,
     },
     price: {
          fontSize: FontSizes.xxxl,
          fontWeight: FontWeights.bold,
     },
     originalPrice: {
          fontSize: FontSizes.lg,
          textDecorationLine: 'line-through',
     },
     descriptionContainer: {
          marginBottom: Spacing.lg,
     },
     sectionTitle: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.sm,
     },
     description: {
          fontSize: FontSizes.md,
          lineHeight: 22,
     },
     featuresContainer: {
          marginBottom: Spacing.lg,
     },
     featuresList: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.sm,
     },
     featureChip: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
     },
     featureText: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.medium,
     },
     statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          marginTop: Spacing.md,
     },
     statusBadgeTitle: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.semibold,
          marginBottom: 2,
     },
     statusBadgeDesc: {
          fontSize: FontSizes.xs,
     },
     statusBadgeButton: {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: 6,
          borderWidth: 1,
     },
     statusBadgeButtonText: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.semibold,
     },
     bottomBar: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: Spacing.md,
          flexDirection: 'row',
          gap: Spacing.sm,
          borderTopWidth: 1,
     },
     contactButton: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.md,
          borderRadius: 12,
          gap: Spacing.xs,
          borderWidth: 2,
     },
     contactText: {
          fontSize: FontSizes.md,
          fontWeight: FontWeights.semibold,
     },
     addToCartButton: {
          flex: 2,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: Spacing.md,
          borderRadius: 12,
          gap: Spacing.xs,
     },
     addToCartText: {
          color: '#fff',
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.semibold,
     },
});
