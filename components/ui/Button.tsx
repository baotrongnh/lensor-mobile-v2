import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/Colors';

interface ButtonProps {
     children: React.ReactNode;
     onPress?: () => void;
     variant?: 'default' | 'outline' | 'ghost' | 'destructive';
     size?: 'sm' | 'md' | 'lg';
     disabled?: boolean;
     loading?: boolean;
     style?: ViewStyle;
     textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
     children,
     onPress,
     variant = 'default',
     size = 'md',
     disabled = false,
     loading = false,
     style,
     textStyle,
}) => {
     const { colors } = useTheme();

     const getButtonStyle = (): ViewStyle => {
          const baseStyle: ViewStyle = {
               borderRadius: BorderRadius.md,
               alignItems: 'center',
               justifyContent: 'center',
               flexDirection: 'row',
          };

          // Size
          const sizeStyles: Record<string, ViewStyle> = {
               sm: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, minHeight: 32 },
               md: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minHeight: 40 },
               lg: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 48 },
          };

          // Variant
          const variantStyles: Record<string, ViewStyle> = {
               default: {
                    backgroundColor: colors.primary,
               },
               outline: {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
               },
               ghost: {
                    backgroundColor: 'transparent',
               },
               destructive: {
                    backgroundColor: colors.destructive,
               },
          };

          return {
               ...baseStyle,
               ...sizeStyles[size],
               ...variantStyles[variant],
               ...(disabled && { opacity: 0.5 }),
          };
     };

     const getTextStyle = (): TextStyle => {
          const sizeStyles: Record<string, TextStyle> = {
               sm: { fontSize: FontSizes.sm },
               md: { fontSize: FontSizes.md },
               lg: { fontSize: FontSizes.lg },
          };

          const variantStyles: Record<string, TextStyle> = {
               default: { color: colors.primaryForeground },
               outline: { color: colors.foreground },
               ghost: { color: colors.foreground },
               destructive: { color: colors.destructiveForeground },
          };

          return {
               fontWeight: FontWeights.semibold,
               ...sizeStyles[size],
               ...variantStyles[variant],
          };
     };

     return (
          <TouchableOpacity
               style={[getButtonStyle(), style]}
               onPress={onPress}
               disabled={disabled || loading}
               activeOpacity={0.7}
          >
               {loading ? (
                    <ActivityIndicator
                         color={variant === 'default' ? colors.primaryForeground : colors.foreground}
                         size="small"
                    />
               ) : (
                    <Text style={[getTextStyle(), textStyle]}>{children}</Text>
               )}
          </TouchableOpacity>
     );
};
