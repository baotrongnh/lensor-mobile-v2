/**
 * Empty State Component
 * Network error state giống web
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Spacing, FontSizes, FontWeights } from '@/constants/Colors';

interface NetworkErrorProps {
     onRetry: () => void;
     title?: string;
     description?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
     onRetry,
     title = 'Connection Lost',
     description = 'Please check your internet connection and try again.'
}) => {
     const { colors } = useTheme();

     return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
               <View style={styles.content}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.muted }]}>
                         <WifiOff size={48} color={colors.mutedForeground} strokeWidth={1.5} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.foreground }]}>
                         {title}
                    </Text>

                    {/* Description */}
                    <Text style={[styles.description, { color: colors.mutedForeground }]}>
                         {description}
                    </Text>

                    {/* Retry Button */}
                    <Button
                         onPress={onRetry}
                         style={styles.button}
                    >
                         Try Again
                    </Button>
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
          marginBottom: Spacing.xl,
          lineHeight: 22,
     },
     button: {
          minWidth: 140,
     },
});
