import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// Groups enquiries by activity date (the day of the BTL activity, not when
// it was captured in the app) and dealership, into a day x dealership grid.
function buildMatrix(enquiries) {
  const dates = [...new Set(enquiries.map((e) => e.activityDate))].sort().reverse();
  const dealerships = [...new Set(enquiries.map((e) => e.dealershipName))].sort();

  const counts = {};
  for (const e of enquiries) {
    counts[e.activityDate] = counts[e.activityDate] || {};
    counts[e.activityDate][e.dealershipName] = (counts[e.activityDate][e.dealershipName] || 0) + 1;
  }

  const dealershipTotals = {};
  for (const d of dealerships) {
    dealershipTotals[d] = dates.reduce((sum, date) => sum + (counts[date]?.[d] || 0), 0);
  }

  return { dates, dealerships, counts, dealershipTotals };
}

function Cell({ children, width, header, bold }) {
  return (
    <View style={[styles.cell, { width }, header && styles.headerCell]}>
      <Text style={[styles.cellText, header && styles.headerCellText, bold && styles.boldCellText]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const DATE_COL_WIDTH = 96;
const DEALERSHIP_COL_WIDTH = 110;

export default function DayDealershipTable({ enquiries }) {
  if (!enquiries.length) return null;
  const { dates, dealerships, counts, dealershipTotals } = buildMatrix(enquiries);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Enquiry Flow by Day &amp; Dealership</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.row}>
            <Cell width={DATE_COL_WIDTH} header>Date</Cell>
            {dealerships.map((d) => (
              <Cell key={d} width={DEALERSHIP_COL_WIDTH} header>{d}</Cell>
            ))}
            <Cell width={70} header>Total</Cell>
          </View>

          {dates.map((date) => {
            const rowTotal = dealerships.reduce((sum, d) => sum + (counts[date]?.[d] || 0), 0);
            return (
              <View key={date} style={styles.row}>
                <Cell width={DATE_COL_WIDTH}>{date}</Cell>
                {dealerships.map((d) => (
                  <Cell key={d} width={DEALERSHIP_COL_WIDTH}>{counts[date]?.[d] || 0}</Cell>
                ))}
                <Cell width={70} bold>{rowTotal}</Cell>
              </View>
            );
          })}

          <View style={[styles.row, styles.totalRow]}>
            <Cell width={DATE_COL_WIDTH} bold>Total</Cell>
            {dealerships.map((d) => (
              <Cell key={d} width={DEALERSHIP_COL_WIDTH} bold>{dealershipTotals[d]}</Cell>
            ))}
            <Cell width={70} bold>{enquiries.length}</Cell>
          </View>
        </View>
      </ScrollView>
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
