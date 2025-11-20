/**
 * Input Component
 * Mobile-optimized input với style giống web
 */

import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Colors';

interface InputProps extends TextInputProps {
     label?: string;
     error?: string;
}

export const Input: React.FC<InputProps> = ({
     label,
     error,
     style,
     ...props
}) => {
     const { colors } = useTheme();

     return (
          <View style={styles.container}>
               {label && (
                    <Text style={[styles.label, { color: colors.foreground }]}>
                         {label}
                    </Text>
               )}
               <TextInput
                    style={[
                         styles.input,
                         {
                              backgroundColor: colors.background,
                              borderColor: error ? colors.destructive : colors.border,
                              color: colors.foreground,
                         },
                         style,
                    ]}
                    placeholderTextColor={colors.mutedForeground}
                    {...props}
               />
               {error && (
                    <Text style={[styles.error, { color: colors.destructive }]}>
                         {error}
                    </Text>
               )}
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          width: '100%',
     },
     label: {
          fontSize: FontSizes.sm,
          fontWeight: '600',
          marginBottom: Spacing.xs,
     },
     input: {
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: FontSizes.md,
          minHeight: 44,
     },
     error: {
          fontSize: FontSizes.xs,
          marginTop: Spacing.xs,
     },
});
