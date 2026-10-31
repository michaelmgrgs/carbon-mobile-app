import React, { useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

const logo = require('../../assets/logo-badge.png');

/**
 * Photo that fades in once loaded. Until then — or when there's no photo or it
 * fails — a dark placeholder with a faint Carbon logo shows, so layouts never jump
 * and nothing looks broken.
 */
export default function SmartImage({ uri, style, logoSize = 56 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      <Image source={logo} style={{ width: logoSize, height: logoSize, opacity: 0.12 }} resizeMode="contain" />
      {uri && !failed ? (
        <Animated.Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { opacity }]}
          resizeMode="cover"
          onLoad={() => Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start()}
          onError={() => setFailed(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surfaceElevated, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
