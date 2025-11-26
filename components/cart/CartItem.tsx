import React from 'react';
import {
     View,
     Text,
     Image,
     TouchableOpacity,
     StyleSheet,
     Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';
import { CartItemData } from '@/lib/api/cartApi';
import { Trash2, Package, Ban, AlertCircle, CheckSquare, Square } from 'lucide-react-native';
import { BASE_URL, DEFAULT_IMAGE } from '@/constants';
import { router } from 'expo-router';

interface CartItemProps {
     item: CartItemData;
     isSelected?: boolean;
     onSelect?: (itemId: string, selected: boolean) => void;
     onRemove: (itemId: string) => void;
     disabled?: boolean;
}

export function CartItem({
     item,
     isSelected = false,
     onSelect,
     onRemove,
     disabled = false,
}: CartItemProps) {
     const { colors } = useTheme();
     const isUnavailable = item.product?.status !== 'active';

     const imageSrc = item.product?.thumbnail?.startsWith('http')
          ? item.product.thumbnail
          : item.product?.thumbnail
               ? `${BASE_URL}${item.product.thumbnail}`
               : DEFAULT_IMAGE;

     const price = parseFloat(item.product?.price || item.price);

     const handlePress = () => {
          if (isUnavailable) {
               Alert.alert('Unavailable', 'This product is currently unavailable for purchase');
               return;
          }
          if (item.product?.id) {
               router.push(`/product-details/${item.product.id}`);
          }
     };

     const handleCheckboxChange = () => {
          if (!onSelect) return;
          if (isUnavailable) {
               Alert.alert('Cannot Select', 'Cannot select unavailable product');
               return;
          }
          onSelect(item.id, !isSelected);
     };

     return (
          <View
               style={[
                    styles.container,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isUnavailable && styles.unavailable
               ]}
          >
               {/* Checkbox - Only show if onSelect is provided */}
               {onSelect && (
                    <TouchableOpacity
                         style={styles.checkboxContainer}
                         onPress={handleCheckboxChange}
                         disabled={isUnavailable}
                    >
                         {isSelected && !isUnavailable ? (
                              <CheckSquare size={24} color={colors.primary} />
                         ) : (
                              <Square size={24} color={isUnavailable ? colors.muted : colors.foreground} />
                         )}
                    </TouchableOpacity>
               )}

               {/* Image */}
               <TouchableOpacity onPress={handlePress} style={styles.imageContainer}>
                    <Image
                         source={{ uri: imageSrc }}
                         style={styles.image}
                         resizeMode="cover"
                    />
                    {isUnavailable && (
                         <View style={styles.unavailableOverlay}>
                              <Ban size={24} color="#ef4444" />
                         </View>
                    )}
               </TouchableOpacity>

               {/* Content */}
               <View style={styles.content}>
                    {isUnavailable && (
                         <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                              <AlertCircle size={12} color="#ef4444" />
                              <Text style={[styles.statusText, { color: '#ef4444' }]}>
                                   Unavailable
                              </Text>
                         </View>
                    )}

                    <TouchableOpacity onPress={handlePress}>
                         <Text
                              style={[styles.title, { color: colors.foreground }]}
                              numberOfLines={2}
                         >
                              {item.product?.title || 'Untitled'}
                         </Text>
                    </TouchableOpacity>

                    <Text style={[styles.author, { color: colors.mutedForeground }]}>
                         by {item.product?.owner?.name || 'Unknown'}
                    </Text>

                    {item.product?.category && (
                         <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
                              <Package size={12} color={colors.mutedForeground} />
                              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
                                   {item.product.category}
                              </Text>
                         </View>
                    )}

                    <View style={styles.bottomRow}>
                         <Text style={[styles.price, { color: colors.foreground }]}>
                              {(price * item.quantity).toLocaleString('vi-VN')} ₫
                         </Text>

                         <TouchableOpacity
                              style={[styles.removeBtn, { borderColor: colors.border }]}
                              onPress={() => onRemove(item.id)}
                              disabled={disabled}
                         >
                              <Trash2 size={16} color={colors.destructive} />
                         </TouchableOpacity>
                    </View>
               </View>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flexDirection: 'row',
          padding: Spacing.sm,
          borderRadius: 12,
          borderWidth: 1,
          marginBottom: Spacing.sm,
     },
     unavailable: {
          opacity: 0.6,
     },
     checkboxContainer: {
          justifyContent: 'center',
          paddingRight: Spacing.sm,
     },
     imageContainer: {
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
     },
     image: {
          width: '100%',
          height: '100%',
     },
     unavailableOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
     },
     content: {
          flex: 1,
          marginLeft: Spacing.sm,
          justifyContent: 'space-between',
     },
     statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 2,
          borderRadius: 4,
          alignSelf: 'flex-start',
          marginBottom: 4,
     },
     statusText: {
          fontSize: 11,
          fontWeight: '600',
     },
     title: {
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 4,
     },
     author: {
          fontSize: 13,
          marginBottom: 4,
     },
     categoryBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 2,
          borderRadius: 4,
          alignSelf: 'flex-start',
          marginBottom: Spacing.xs,
     },
     categoryText: {
          fontSize: 11,
     },
     bottomRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     price: {
          fontSize: 17,
          fontWeight: 'bold',
     },
     removeBtn: {
          padding: Spacing.xs,
          borderRadius: 6,
          borderWidth: 1,
     },
});
