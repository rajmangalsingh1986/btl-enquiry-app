import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MultiChipSelect({ label, options, values, onChange, disabled }) {
  const toggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <TouchableOpacity
              key={option}
              disabled={disabled}
              onPress={() => toggle(option)}
              style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  chipDisabled: { opacity: 0.5 },
  chipText: { color: '#374151', fontSize: 14 },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
});
