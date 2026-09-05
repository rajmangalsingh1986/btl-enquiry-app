import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Soft tint pairs (background + matching deeper text) - kept in one place so
// every stat row on a dashboard reads as a coordinated set rather than
// random per-screen choices.
const TINTS = {
  blue: { bg: '#EFF6FF', border: '#DBEAFE', text: '#1D4ED8' },
  violet: { bg: '#F5F3FF', border: '#EDE9FE', text: '#6D28D9' },
  aqua: { bg: '#ECFDF5', border: '#D1FAE5', text: '#047857' },
  amber: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
};

export default function StatCard({ label, value, tint = 'blue' }) {
  const colors = TINTS[tint] || TINTS.blue;
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
});
