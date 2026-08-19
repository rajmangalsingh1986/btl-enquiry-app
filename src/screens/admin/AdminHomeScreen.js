import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DealershipsScreen from './DealershipsScreen';
import UsersScreen from './UsersScreen';

const TAB_LABELS = { dealerships: 'Dealerships', users: 'Users' };

export default function AdminHomeScreen() {
  const [tab, setTab] = useState('dealerships');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, tab === key && styles.tabButtonActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabButtonText, tab === key && styles.tabButtonTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'dealerships' ? <DealershipsScreen /> : <UsersScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  tabBar: { flexDirection: 'row', padding: 12, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#E5E7EB' },
  tabButtonActive: { backgroundColor: '#1D4ED8' },
  tabButtonText: { color: '#374151', fontWeight: '600' },
  tabButtonTextActive: { color: '#fff' },
});
