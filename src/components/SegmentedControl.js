import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SegmentedControl({ label, required, options, value, onChange, disabled }) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View style={styles.segmentRow}>
        {options.map((option, index) => {
          const selected = value === option;
          return (
            <TouchableOpacity
              key={option}
              disabled={disabled}
              onPress={() => onChange(option)}
              style={[
                styles.segment,
                index > 0 && styles.segmentBorder,
                selected && styles.segmentSelected,
                disabled && styles.segmentDisabled,
              ]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#DC2626' },
  segmentRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  segmentBorder: { borderLeftWidth: 1, borderLeftColor: '#1D4ED8' },
  segmentSelected: { backgroundColor: '#1D4ED8' },
  segmentDisabled: { opacity: 0.5 },
  segmentText: { color: '#1D4ED8', fontSize: 14, fontWeight: '600' },
  segmentTextSelected: { color: '#fff' },
});
