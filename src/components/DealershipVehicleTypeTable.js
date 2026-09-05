import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// PV = Personal Vehicle, CV = Commercial Vehicle - matches the PV/CV role
// naming already used for CRE/SM accounts (e.g. @icrepv, @smcv). BEV counts
// as PV, same as the CRE/SM segment-routing rule elsewhere in the app.
function vehicleType(segment) {
  return segment === 'Commercial' ? 'CV' : 'PV';
}

function buildRows(enquiries) {
  const dealerships = [...new Set(enquiries.map((e) => e.dealershipName))].sort();
  const rows = dealerships.map((dealershipName) => {
    let pv = 0;
    let cv = 0;
    for (const e of enquiries) {
      if (e.dealershipName !== dealershipName) continue;
      if (vehicleType(e.segment) === 'CV') cv += 1;
      else pv += 1;
    }
    return { dealershipName, pv, cv, total: pv + cv };
  });
  const totals = rows.reduce(
    (acc, r) => ({ pv: acc.pv + r.pv, cv: acc.cv + r.cv, total: acc.total + r.total }),
    { pv: 0, cv: 0, total: 0 }
  );
  return { rows, totals };
}

function Cell({ children, flex, header, bold }) {
  return (
    <View style={[styles.cell, { flex }, header && styles.headerCell]}>
      <Text style={[styles.cellText, header && styles.headerCellText, bold && styles.boldCellText]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export default function DealershipVehicleTypeTable({ enquiries }) {
  if (!enquiries.length) return null;
  const { rows, totals } = buildRows(enquiries);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Enquiries by Dealership</Text>
      <View style={styles.row}>
        <Cell flex={2.4} header>Dealership</Cell>
        <Cell flex={1} header>PV</Cell>
        <Cell flex={1} header>CV</Cell>
        <Cell flex={1.2} header>Total</Cell>
      </View>
      {rows.map((r) => (
        <View key={r.dealershipName} style={styles.row}>
          <Cell flex={2.4}>{r.dealershipName}</Cell>
          <Cell flex={1}>{r.pv}</Cell>
          <Cell flex={1}>{r.cv}</Cell>
          <Cell flex={1.2} bold>{r.total}</Cell>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Cell flex={2.4} bold>Total</Cell>
        <Cell flex={1} bold>{totals.pv}</Cell>
        <Cell flex={1} bold>{totals.cv}</Cell>
        <Cell flex={1.2} bold>{totals.total}</Cell>
      </View>
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
  row: { flexDirection: 'row' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    justifyContent: 'center',
  },
  headerCell: { backgroundColor: '#F9FAFB' },
  cellText: { fontSize: 12, color: '#374151' },
  headerCellText: { fontWeight: '700', color: '#111827' },
  boldCellText: { fontWeight: '700' },
});
