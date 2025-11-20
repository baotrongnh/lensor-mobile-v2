import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Colors';

interface CardProps extends ViewProps {
     children: React.ReactNode;
     variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
     children,
     variant = 'default',
     style,
     ...props
}) => {
     const { colors } = useTheme();

     return (
          <View
               style={[
                    styles.card,
                    {
                         backgroundColor: colors.card,
                         borderColor: colors.border,
                    },
                    variant === 'elevated' && styles.elevated,
                    style,
               ]}
               {...props}
          >
               {children}
          </View>
     );
};

const styles = StyleSheet.create({
     card: {
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          borderWidth: 1,
     },
     elevated: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
     },
});
