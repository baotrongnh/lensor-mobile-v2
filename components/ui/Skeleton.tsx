/**
 * Skeleton Loading Components - Threads/Instagram Style
 * Hiển thị khi đang loading data
 */

import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PostSkeleton: React.FC = () => {
     const { colors } = useTheme();
     const opacity = React.useRef(new Animated.Value(0.3)).current;

     React.useEffect(() => {
          Animated.loop(
               Animated.sequence([
                    Animated.timing(opacity, {
                         toValue: 1,
                         duration: 800,
                         useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                         toValue: 0.3,
                         duration: 800,
                         useNativeDriver: true,
                    }),
               ])
          ).start();
     }, [opacity]);

     return (
          <View style={[styles.container, { borderBottomColor: colors.border }]}>
               {/* Header */}
               <View style={styles.header}>
                    <View style={styles.userInfo}>
                         <Animated.View
                              style={[
                                   styles.avatar,
                                   { backgroundColor: colors.muted, opacity }
                              ]}
                         />
                         <View style={styles.userDetails}>
                              <Animated.View
                                   style={[
                                        styles.userName,
                                        { backgroundColor: colors.muted, opacity }
                                   ]}
                              />
                              <Animated.View
                                   style={[
                                        styles.postTime,
                                        { backgroundColor: colors.muted, opacity }
                                   ]}
                              />
                         </View>
                    </View>
               </View>

               {/* Content */}
               <View style={styles.contentContainer}>
                    <Animated.View
                         style={[
                              styles.titleLine,
                              { backgroundColor: colors.muted, opacity }
                         ]}
                    />
                    <Animated.View
                         style={[
                              styles.contentLine,
                              { backgroundColor: colors.muted, opacity }
                         ]}
                    />
                    <Animated.View
                         style={[
                              styles.contentLineShort,
                              { backgroundColor: colors.muted, opacity }
                         ]}
                    />
               </View>

               {/* Image */}
               <Animated.View
                    style={[
                         styles.image,
                         { backgroundColor: colors.muted, opacity }
                    ]}
               />

               {/* Actions */}
               <View style={styles.actions}>
                    {[1, 2, 3].map((i) => (
                         <Animated.View
                              key={i}
                              style={[
                                   styles.actionButton,
                                   { backgroundColor: colors.muted, opacity }
                              ]}
                         />
                    ))}
               </View>
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          paddingVertical: Spacing.md,
          borderBottomWidth: 0.5,
     },
     header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
     },
     userInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
     },
     avatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
     },
     userDetails: {
          gap: 6,
     },
     userName: {
          width: 100,
          height: 14,
          borderRadius: 4,
     },
     postTime: {
          width: 60,
          height: 10,
          borderRadius: 4,
     },
     contentContainer: {
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
          gap: 6,
     },
     titleLine: {
          width: '80%',
          height: 16,
          borderRadius: 4,
     },
     contentLine: {
          width: '95%',
          height: 14,
          borderRadius: 4,
     },
     contentLineShort: {
          width: '60%',
          height: 14,
          borderRadius: 4,
     },
     image: {
          width: SCREEN_WIDTH,
          minHeight: 300,
          marginVertical: Spacing.xs,
     },
     actions: {
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.sm,
          gap: 16,
     },
     actionButton: {
          width: 40,
          height: 20,
          borderRadius: 10,
     },
});
