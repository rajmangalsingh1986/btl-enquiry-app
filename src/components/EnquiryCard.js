import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STAGE_LABELS } from '../constants/options';

const STAGE_COLORS = {
  CREATED: '#F59E0B',
  CRE_TAGGED: '#3B82F6',
  SM_TAGGED: '#8B5CF6',
  ASM_TAGGED: '#10B981',
};

export default function EnquiryCard({ enquiry, onPress, footer }) {
  const stageColor = STAGE_COLORS[enquiry.stage] || '#6B7280';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.headerRow}>
        <Text style={styles.customerName}>{enquiry.customerName}</Text>
        <View style={[styles.badge, { backgroundColor: stageColor }]}>
          <Text style={styles.badgeText}>{STAGE_LABELS[enquiry.stage] || enquiry.stage}</Text>
        </View>
      </View>
      <Text style={styles.subtext}>{enquiry.vehicleModelInterested} {enquiry.variant ? `· ${enquiry.variant}` : ''}</Text>
      <Text style={styles.subtext}>{enquiry.contactNo}</Text>
      <Text style={styles.meta}>{enquiry.activityName} · {enquiry.dealershipName}</Text>
      {enquiry.synced === false ? (
        <Text style={styles.pendingSync}>Pending sync (offline)</Text>
      ) : null}
      {footer}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#111827', flexShrink: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  subtext: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  pendingSync: { fontSize: 12, color: '#DC2626', marginTop: 6, fontWeight: '600' },
});
