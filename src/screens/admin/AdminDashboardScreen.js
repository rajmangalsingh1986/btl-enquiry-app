import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { downloadCsv } from '../../utils/downloadCsv';
import { notify } from '../../utils/confirm';
import { countBy } from '../../utils/stats';
import { enquiryToCsvRow } from '../../utils/enquiryCsv';
import StatCard from '../../components/StatCard';
import BreakdownList from '../../components/BreakdownList';
import DayGroupTable from '../../components/DayGroupTable';
import DealershipVehicleTypeTable from '../../components/DealershipVehicleTypeTable';

export default function AdminDashboardScreen() {
  const [enquiries, setEnquiries] = useState([]);
  const [dealershipCount, setDealershipCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [enquiriesRes, dealershipsRes, usersRes] = await Promise.all([
        client.get('/enquiries'),
        client.get('/dealerships'),
        client.get('/users'),
      ]);
      setEnquiries(enquiriesRes.data);
      setDealershipCount(dealershipsRes.data.length);
      setUserCount(usersRes.data.length);
    } catch (err) {
      // keep last known data
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleExport = async () => {
    if (!enquiries.length) {
      notify('No data', 'There are no enquiries to export yet.');
      return;
    }
    setExporting(true);
    try {
      const filename = `btl-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      await downloadCsv(filename, enquiries.map(enquiryToCsvRow));
    } catch (err) {
      notify('Error', 'Could not export data.');
    } finally {
      setExporting(false);
    }
  };

  const byAsmStatus = countBy(enquiries.filter((e) => e.stage === 'ASM_TAGGED'), (e) => e.asm?.status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {loading && enquiries.length === 0 ? <ActivityIndicator color="#1D4ED8" style={{ marginTop: 20 }} /> : null}

      <View style={styles.statsRow}>
        <StatCard label="Total Enquiries" value={enquiries.length} />
        <StatCard label="Dealerships" value={dealershipCount} />
        <StatCard label="Users" value={userCount} />
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={exporting}>
        {exporting ? <ActivityIndicator color="#fff" /> : <Text style={styles.exportButtonText}>Download All Enquiry Data (CSV)</Text>}
      </TouchableOpacity>

      <DayGroupTable
        enquiries={enquiries}
        groupFn={(e) => e.dealershipName}
        title="Enquiry Flow by Day & Dealership"
        groupColWidth={110}
      />
      <DayGroupTable
        enquiries={enquiries}
        groupFn={(e) => e.segment}
        title="Enquiry Flow by Day & Segment"
        groupColWidth={100}
      />
      <DealershipVehicleTypeTable enquiries={enquiries} />
      <BreakdownList title="Closed Enquiries by Final Status" entries={byAsmStatus} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  exportButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
