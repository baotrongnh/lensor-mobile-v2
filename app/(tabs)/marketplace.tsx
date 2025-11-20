import React, { useState, useMemo, useEffect } from 'react';
import {
     View,
     Text,
     StyleSheet,
     FlatList,
     TextInput,
     RefreshControl,
     ActivityIndicator,
     TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';
import { useMarketplace } from '@/lib/hooks/useMarketplaceHooks';
import { MarketplaceItem } from '@/types/marketplace';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import { EmptyState } from '@/components/empty/EmptyState';
import { router } from 'expo-router';

export default function MarketplaceScreen() {
     const { t } = useTranslation();
     const { colors } = useTheme();
     const [searchQuery, setSearchQuery] = useState('');
     const { data: marketplaceItems, isLoading, mutate } = useMarketplace();

     // Filter items
     const filteredItems = useMemo(() => {
          if (!marketplaceItems?.data) return [];

          const validItems = marketplaceItems.data.filter((item: MarketplaceItem) => {
               const hasValidThumbnail = item?.thumbnail &&
                    typeof item.thumbnail === 'string' &&
                    item.thumbnail.trim() !== '';

               return hasValidThumbnail;
          });

          if (!searchQuery.trim()) return validItems;

          const query = searchQuery.toLowerCase();
          return validItems.filter((item: MarketplaceItem) =>
               item.title.toLowerCase().includes(query) ||
               item.description.toLowerCase().includes(query)
          );
     }, [marketplaceItems?.data, searchQuery]);

     const handleRefresh = () => {
          mutate();
     };

     const renderHeader = () => (
          <View style={styles.headerContent}>
               <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                    Your <Text style={{ color: colors.primary }}>Marketplace</Text> for Creativity
               </Text>
               <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                    Buy, sell, and showcase stunning photos & professional presets
               </Text>

               {/* Search Bar */}
               <View style={[styles.searchContainer, {
                    backgroundColor: colors.background,
                    borderColor: colors.border
               }]}>
                    <Search size={20} color={colors.mutedForeground} />
                    <TextInput
                         style={[styles.searchInput, { color: colors.foreground }]}
                         placeholder="Search presets..."
                         placeholderTextColor={colors.mutedForeground}
                         value={searchQuery}
                         onChangeText={setSearchQuery}
                    />
               </View>

               {searchQuery && (
                    <Text style={[styles.searchResult, { color: colors.foreground }]}>
                         Found <Text style={{ color: colors.primary }}>{filteredItems.length}</Text> result{filteredItems.length !== 1 ? 's' : ''} for "<Text style={{ color: colors.primary }}>{searchQuery}</Text>"
                    </Text>
               )}
          </View>
     );

     const renderItem = ({ item }: { item: MarketplaceItem }) => (
          <View style={styles.cardWrapper}>
               <MarketplaceCard {...item} />
          </View>
     );

     const renderEmpty = () => {
          if (isLoading) return null;

          return (
               <EmptyState
                    title={searchQuery ? 'No presets found' : 'No presets available'}
                    description={searchQuery ? 'Try adjusting your search query' : 'Check back later for new presets'}
               />
          );
     };

     const renderFooter = () => {
          if (!isLoading) return null;
          return (
               <View style={styles.footer}>
                    <ActivityIndicator size="large" color={colors.primary} />
               </View>
          );
     };

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={[styles.header, {
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border
               }]}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         {t('Tabs.marketplace')}
                    </Text>
                    <TouchableOpacity
                         style={[styles.cartBtn, { backgroundColor: colors.primary }]}
                         onPress={() => router.push('/cart')}
                    >
                         <ShoppingCart size={20} color={colors.primaryForeground} />
                    </TouchableOpacity>
               </View>

               <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                         <RefreshControl
                              refreshing={isLoading}
                              onRefresh={handleRefresh}
                              colors={[colors.primary]}
                              tintColor={colors.primary}
                         />
                    }
                    showsVerticalScrollIndicator={false}
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
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          paddingTop: Spacing.xxl + Spacing.md,
     },
     title: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
     },
     cartBtn: {
          padding: Spacing.sm,
          borderRadius: 8,
     },
     listContent: {
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.xl,
     },
     headerContent: {
          paddingTop: Spacing.md,
          marginBottom: Spacing.md,
     },
     headerTitle: {
          fontSize: FontSizes.xl,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.xs,
     },
     headerSubtitle: {
          fontSize: FontSizes.sm,
          marginBottom: Spacing.lg,
     },
     searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          gap: Spacing.sm,
          marginBottom: Spacing.sm,
     },
     searchInput: {
          flex: 1,
          fontSize: FontSizes.md,
          padding: 0,
     },
     searchResult: {
          fontSize: FontSizes.sm,
          fontWeight: FontWeights.semibold,
          marginTop: Spacing.sm,
     },
     cardWrapper: {
          marginBottom: Spacing.sm,
     },
     footer: {
          paddingVertical: Spacing.lg,
          alignItems: 'center',
     },
});
