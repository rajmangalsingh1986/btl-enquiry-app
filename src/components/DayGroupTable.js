import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// Groups enquiries by activity date (the day of the BTL activity, not when
// it was captured in the app) and an arbitrary key (dealership, segment, ...)
// into a day x group grid.
function buildMatrix(enquiries, groupFn) {
  const dates = [...new Set(enquiries.map((e) => e.activityDate))].sort().reverse();
  const groups = [...new Set(enquiries.map(groupFn))].sort();

  const counts = {};
  for (const e of enquiries) {
    const g = groupFn(e);
    counts[e.activityDate] = counts[e.activityDate] || {};
    counts[e.activityDate][g] = (counts[e.activityDate][g] || 0) + 1;
  }

  const groupTotals = {};
  for (const g of groups) {
    groupTotals[g] = dates.reduce((sum, date) => sum + (counts[date]?.[g] || 0), 0);
  }

  return { dates, groups, counts, groupTotals };
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

export default function DayGroupTable({ enquiries, groupFn, title, groupColWidth = 110 }) {
  if (!enquiries.length) return null;
  const { dates, groups, counts, groupTotals } = buildMatrix(enquiries, groupFn);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.row}>
            <Cell width={DATE_COL_WIDTH} header>Date</Cell>
            {groups.map((g) => (
              <Cell key={g} width={groupColWidth} header>{g}</Cell>
            ))}
            <Cell width={70} header>Total</Cell>
          </View>

          {dates.map((date) => {
            const rowTotal = groups.reduce((sum, g) => sum + (counts[date]?.[g] || 0), 0);
            return (
              <View key={date} style={styles.row}>
                <Cell width={DATE_COL_WIDTH}>{date}</Cell>
                {groups.map((g) => (
                  <Cell key={g} width={groupColWidth}>{counts[date]?.[g] || 0}</Cell>
                ))}
                <Cell width={70} bold>{rowTotal}</Cell>
              </View>
            );
          })}

          <View style={[styles.row, styles.totalRow]}>
            <Cell width={DATE_COL_WIDTH} bold>Total</Cell>
            {groups.map((g) => (
              <Cell key={g} width={groupColWidth} bold>{groupTotals[g]}</Cell>
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
