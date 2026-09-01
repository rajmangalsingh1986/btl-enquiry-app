import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Stage({ title, active, children }) {
  return (
    <View style={[styles.stage, active ? styles.stageActive : styles.stagePending]}>
      <Text style={styles.stageTitle}>{title}</Text>
      {children || <Text style={styles.pendingText}>Pending</Text>}
    </View>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <Text style={styles.detail}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

export default function StageTimeline({ enquiry }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Workflow Trail</Text>

      <Stage title="Customer Relationship Executive" active={!!enquiry.cre?.validation}>
        {enquiry.cre?.validation ? (
          <>
            <Detail label="Validation" value={enquiry.cre.validation} />
            <Detail label="Tag" value={enquiry.cre.tag} />
            <Detail label="Remarks" value={enquiry.cre.remarks} />
          </>
        ) : null}
      </Stage>

      <Stage title="Sales Manager" active={!!enquiry.sm?.status}>
        {enquiry.sm?.status ? (
          <>
            <Detail label="Status" value={enquiry.sm.status} />
            <Detail label="Remarks" value={enquiry.sm.remarks} />
          </>
        ) : null}
      </Stage>

      <Stage title="Final Tagging" active={!!enquiry.asm?.status}>
        {enquiry.asm?.status ? (
          <>
            <Detail label="Final Status" value={enquiry.asm.status} />
            <Detail label="Remarks" value={enquiry.asm.remarks} />
          </>
        ) : null}
      </Stage>
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
  stage: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 12 },
  stageActive: { borderLeftColor: '#10B981' },
  stagePending: { borderLeftColor: '#E5E7EB' },
  stageTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 2 },
  pendingText: { fontSize: 12, color: '#9CA3AF' },
  detail: { fontSize: 12, color: '#4B5563' },
  detailLabel: { fontWeight: '600', color: '#374151' },
});
