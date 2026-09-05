import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BreakdownList({ title, entries }) {
  if (!entries.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {entries.map(([label, count]) => (
        <View key={label} style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{label}</Text>
          <View style={styles.badge}>
            <Text style={styles.breakdownValue}>{count}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownLabel: { fontSize: 13, color: '#374151' },
  badge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  breakdownValue: { fontSize: 13, color: '#1D4ED8', fontWeight: '700' },
});
