/**
 * Marketplace Card Component
 * Component hiển thị item trong marketplace list
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Star, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MarketplaceItem } from '@/types/marketplace';
import { BASE_URL, DEFAULT_IMAGE } from '@/constants';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';

type MarketplaceCardProps = MarketplaceItem;

export default function MarketplaceCard({
     id,
     title,
     description,
     price,
     thumbnail,
     author,
     rating,
}: MarketplaceCardProps) {
     const { colors } = useTheme();
     const router = useRouter();
     const [imageError, setImageError] = useState(false);
     const { addToCart } = useCartStore();
     const [isAdding, setIsAdding] = useState(false);

     const getImageSrc = () => {
          if (imageError || !thumbnail) return DEFAULT_IMAGE;
          if (thumbnail.startsWith('http')) {
               return thumbnail;
          }
          return `${BASE_URL}${thumbnail}`;
     };

     const handlePress = () => {
          // @ts-ignore - dynamic route
          router.push(`/product-details/${id}` as any);
     };

     const handleAddToCart = async (e: any) => {
          e.stopPropagation();
          setIsAdding(true);
          try {
               await addToCart(id, 1);
               Alert.alert('Success', 'Added to cart successfully');
          } catch (error) {
               Alert.alert('Error', 'Failed to add to cart');
          } finally {
               setIsAdding(false);
          }
     };

     return (
          <TouchableOpacity
               style={[styles.container, { backgroundColor: colors.card }]}
               onPress={handlePress}
               activeOpacity={0.7}
          >
               <View style={styles.imageContainer}>
                    <Image
                         source={{ uri: getImageSrc() }}
                         style={styles.image}
                         resizeMode="cover"
                         onError={() => setImageError(true)}
                    />

                    {/* Overlay gradient */}
                    <View style={styles.gradientOverlay}>
                         <Text
                              style={styles.title}
                              numberOfLines={1}
                         >
                              {title}
                         </Text>
                         <Text style={styles.price}>
                              {price ? price.toLocaleString('vi-VN') : '0'} ₫
                         </Text>
                    </View>
               </View>

               {/* Description và author info */}
               <View style={styles.infoContainer}>
                    <Text
                         style={[styles.description, { color: colors.mutedForeground }]}
                         numberOfLines={2}
                    >
                         {description}
                    </Text>

                    <View style={styles.footer}>
                         {author && (
                              <View style={styles.authorContainer}>
                                   <Text
                                        style={[styles.authorName, { color: colors.foreground }]}
                                        numberOfLines={1}
                                   >
                                        {author.name}
                                   </Text>
                              </View>
                         )}

                         {rating !== null && rating !== undefined && (
                              <View style={styles.ratingContainer}>
                                   <Star
                                        size={14}
                                        color="#FFC107"
                                        fill="#FFC107"
                                   />
                                   <Text style={styles.ratingText}>
                                        {rating.toFixed(1)}
                                   </Text>
                              </View>
                         )}
                    </View>

                    <TouchableOpacity
                         style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
                         onPress={handleAddToCart}
                         disabled={isAdding}
                    >
                         <ShoppingCart size={16} color={colors.primaryForeground} />
                         <Text style={[styles.addToCartText, { color: colors.primaryForeground }]}>
                              {isAdding ? 'Adding...' : 'Add to Cart'}
                         </Text>
                    </TouchableOpacity>
               </View>
          </TouchableOpacity>
     );
}

const styles = StyleSheet.create({
     container: {
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          marginBottom: Spacing.md,
     },
     imageContainer: {
          width: '100%',
          aspectRatio: 1,
          position: 'relative',
     },
     image: {
          width: '100%',
          height: '100%',
     },
     gradientOverlay: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: Spacing.md,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
     },
     title: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.semibold,
          color: '#fff',
          marginBottom: 4,
     },
     price: {
          fontSize: FontSizes.lg,
          fontWeight: FontWeights.bold,
          color: '#fff',
     },
     infoContainer: {
          padding: Spacing.md,
     },
     description: {
          fontSize: FontSizes.sm,
          marginBottom: Spacing.sm,
          lineHeight: 18,
     },
     footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     authorContainer: {
          flex: 1,
          marginRight: Spacing.sm,
     },
     authorName: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.medium,
     },
     ratingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
     },
     ratingText: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.semibold,
          color: '#FFC107',
     },
     addToCartBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.xs,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          marginTop: Spacing.sm,
     },
     addToCartText: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.semibold,
     },
});
