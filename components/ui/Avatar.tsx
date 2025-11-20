import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AvatarProps {
     source?: string;
     name?: string;
     size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
     source,
     name = 'User',
     size = 40
}) => {
     const { colors } = useTheme();

     const initials = name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

     return (
          <View
               style={[
                    styles.container,
                    {
                         width: size,
                         height: size,
                         borderRadius: size / 2,
                         backgroundColor: colors.muted,
                    },
               ]}
          >
               {source ? (
                    <Image
                         source={{ uri: source }}
                         style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
                    />
               ) : (
                    <Text
                         style={[
                              styles.initials,
                              { color: colors.mutedForeground, fontSize: size / 2.5 },
                         ]}
                    >
                         {initials}
                    </Text>
               )}
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
     },
     image: {
          resizeMode: 'cover',
     },
     initials: {
          fontWeight: '600',
     },
});
