/**
 * Loading Component
 * Hiển thị loading state
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingProps {
     size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ size = 'large' }) => {
     const { colors } = useTheme();

     return (
          <View style={styles.container}>
               <ActivityIndicator size={size} color={colors.primary} />
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
});
