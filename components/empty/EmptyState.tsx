/**
 * Empty State Component
 * No data state giống web
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';

interface EmptyStateProps {
     title?: string;
     description?: string;
     icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
     title = 'No Data',
     description = 'There is nothing here yet.',
     icon
}) => {
     const { colors } = useTheme();

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={styles.content}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                         {icon || <Inbox size={48} color={colors.mutedForeground} strokeWidth={1.5} />}
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         {title}
                    </Text>

                    {/* Description */}
                    <Text style={[styles.description, { color: colors.mutedForeground }]}>
                         {description}
                    </Text>
               </View>
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
     },
     content: {
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
     },
     iconContainer: {
          width: 120,
          height: 120,
          borderRadius: 60,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: Spacing.xl,
     },
     title: {
          fontSize: FontSizes.xxl,
          fontWeight: FontWeights.bold,
          marginBottom: Spacing.sm,
          textAlign: 'center',
     },
     description: {
          fontSize: FontSizes.md,
          textAlign: 'center',
          lineHeight: 22,
     },
});
