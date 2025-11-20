/**
 * Image Comparison Component
 * Component để so sánh before/after images với slider
 * Giống web version nhưng dùng React Native gesture
 */

import React, { useState } from 'react';
import {
     View,
     Image,
     StyleSheet,
     Dimensions,
     PanResponder,
     Text,
} from 'react-native';
import { MoveHorizontal } from 'lucide-react-native';
import { ImagePair } from '@/types/marketplace';
import { BASE_URL, DEFAULT_IMAGE } from '@/constants';
import { Spacing } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface ImageComparisonProps {
     imagePair: ImagePair;
     label?: string;
}

export function ImageComparison({ imagePair, label }: ImageComparisonProps) {
     const [sliderPosition, setSliderPosition] = useState(50);

     const getImageSrc = (imagePath: string | undefined) => {
          if (!imagePath) return DEFAULT_IMAGE;
          if (imagePath.startsWith('http')) return imagePath;
          return `${BASE_URL}${imagePath}`;
     };

     const panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderMove: (_, gestureState) => {
               const containerWidth = width - 2 * Spacing.md;
               const newPosition = (gestureState.moveX / containerWidth) * 100;
               const clampedPosition = Math.max(0, Math.min(100, newPosition));
               setSliderPosition(clampedPosition);
          },
     });

     return (
          <View style={styles.container}>
               <View style={styles.imageContainer}>
                    {/* Before Image (Right side) */}
                    <Image
                         source={{ uri: getImageSrc(imagePair.before) }}
                         style={styles.image}
                         resizeMode="cover"
                    />

                    {/* After Image (Left side) - Clipped */}
                    <View
                         style={[
                              styles.afterImageContainer,
                              { width: `${sliderPosition}%` }
                         ]}
                    >
                         <Image
                              source={{ uri: getImageSrc(imagePair.after) }}
                              style={styles.image}
                              resizeMode="cover"
                         />
                    </View>

                    {/* Slider */}
                    <View
                         style={[styles.slider, { left: `${sliderPosition}%` }]}
                         {...panResponder.panHandlers}
                    >
                         <View style={styles.sliderLine} />
                         <View style={styles.sliderHandle}>
                              <MoveHorizontal size={18} color="#000" />
                         </View>
                    </View>

                    {/* Labels */}
                    <View style={styles.labelContainer}>
                         <View style={styles.labelLeft}>
                              <Text style={styles.labelText}>
                                   {label || 'After'}
                              </Text>
                         </View>
                         <View style={styles.labelRight}>
                              <Text style={styles.labelText}>Before</Text>
                         </View>
                    </View>
               </View>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          width: '100%',
          aspectRatio: 16 / 10,
          borderRadius: 12,
          overflow: 'hidden',
     },
     imageContainer: {
          width: '100%',
          height: '100%',
          position: 'relative',
     },
     image: {
          width: '100%',
          height: '100%',
          position: 'absolute',
     },
     afterImageContainer: {
          position: 'absolute',
          height: '100%',
          overflow: 'hidden',
          zIndex: 1,
     },
     slider: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 40,
          marginLeft: -20,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
     },
     sliderLine: {
          position: 'absolute',
          width: 2,
          height: '100%',
          backgroundColor: '#fff',
     },
     sliderHandle: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
     },
     labelContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: Spacing.md,
          zIndex: 3,
          pointerEvents: 'none',
     },
     labelLeft: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: 4,
     },
     labelRight: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: 4,
     },
     labelText: {
          color: '#fff',
          fontSize: 12,
          fontWeight: '600',
     },
});
