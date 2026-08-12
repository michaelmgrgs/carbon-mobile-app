import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography } from '../theme/theme';

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btnWrap, (disabled || loading) && { opacity: 0.5 }, style]}
    >
      <LinearGradient colors={[colors.red, colors.redDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, style }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.ghostBtn, style]}>
      <Text style={styles.ghostBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Input({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.gray}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Badge({ text, tone = 'red' }) {
  const bg = tone === 'red' ? colors.red : tone === 'success' ? colors.success : colors.gray;
  return (
    <View style={[styles.badge, { backgroundColor: bg + '22', borderColor: bg }]}>
      <Text style={[styles.badgeText, { color: bg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  btnWrap: { borderRadius: radius.pill, overflow: 'hidden' },
  btn: { paddingVertical: 16, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  ghostBtn: {
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  ghostBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  label: { color: colors.gray, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
    paddingVertical: 14, color: colors.white, fontSize: 15,
  },
  sectionTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
