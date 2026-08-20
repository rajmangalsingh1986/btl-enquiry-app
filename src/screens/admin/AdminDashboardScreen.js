import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { downloadCsv } from '../../utils/downloadCsv';
import { notify } from '../../utils/confirm';
import { countBy } from '../../utils/stats';
import StatCard from '../../components/StatCard';
import BreakdownList from '../../components/BreakdownList';
import { STAGE_LABELS } from '../../constants/options';

const ENQUIRY_CSV_HEADERS = {
  id: 'ID',
  activityName: 'Activity Name',
  location: 'Location',
  activityDate: 'Date of Activity',
  dealershipName: 'Dealership',
  customerName: 'Customer Name',
  contactNo: 'Contact No.',
  profile: 'Profile',
  segment: 'Segment',
  application: 'Application',
  currentVehicle: 'Current Vehicle',
  vehicleModelInterested: 'Model Interested',
  variant: 'Variant',
  exchangeInterested: 'Looking for Exchange',
  stage: 'Stage',
  creValidation: 'CRE Validation',
  creTag: 'CRE Tag',
  creRemarks: 'CRE Remarks',
  creTaggedAt: 'CRE Tagged At',
  smStatus: 'SM Status',
  smRemarks: 'SM Remarks',
  smTaggedAt: 'SM Tagged At',
  asmStatus: 'ASM Status',
  asmRemarks: 'ASM Remarks',
  asmTaggedAt: 'ASM Tagged At',
  createdAt: 'Created At',
};

function toCsvRow(e) {
  return {
    [ENQUIRY_CSV_HEADERS.id]: e.id,
    [ENQUIRY_CSV_HEADERS.activityName]: e.activityName,
    [ENQUIRY_CSV_HEADERS.location]: e.location,
    [ENQUIRY_CSV_HEADERS.activityDate]: e.activityDate,
    [ENQUIRY_CSV_HEADERS.dealershipName]: e.dealershipName,
    [ENQUIRY_CSV_HEADERS.customerName]: e.customerName,
    [ENQUIRY_CSV_HEADERS.contactNo]: e.contactNo,
    [ENQUIRY_CSV_HEADERS.profile]: e.profile,
    [ENQUIRY_CSV_HEADERS.segment]: e.segment,
    [ENQUIRY_CSV_HEADERS.application]: e.application || '',
    [ENQUIRY_CSV_HEADERS.currentVehicle]: e.currentVehicle || '',
    [ENQUIRY_CSV_HEADERS.vehicleModelInterested]: e.vehicleModelInterested,
    [ENQUIRY_CSV_HEADERS.variant]: e.variant || '',
    [ENQUIRY_CSV_HEADERS.exchangeInterested]: e.exchangeInterested ? 'Yes' : 'No',
    [ENQUIRY_CSV_HEADERS.stage]: STAGE_LABELS[e.stage] || e.stage,
    [ENQUIRY_CSV_HEADERS.creValidation]: e.cre?.validation || '',
    [ENQUIRY_CSV_HEADERS.creTag]: e.cre?.tag || '',
    [ENQUIRY_CSV_HEADERS.creRemarks]: e.cre?.remarks || '',
    [ENQUIRY_CSV_HEADERS.creTaggedAt]: e.cre?.taggedAt || '',
    [ENQUIRY_CSV_HEADERS.smStatus]: e.sm?.status || '',
    [ENQUIRY_CSV_HEADERS.smRemarks]: e.sm?.remarks || '',
    [ENQUIRY_CSV_HEADERS.smTaggedAt]: e.sm?.taggedAt || '',
    [ENQUIRY_CSV_HEADERS.asmStatus]: e.asm?.status || '',
    [ENQUIRY_CSV_HEADERS.asmRemarks]: e.asm?.remarks || '',
    [ENQUIRY_CSV_HEADERS.asmTaggedAt]: e.asm?.taggedAt || '',
    [ENQUIRY_CSV_HEADERS.createdAt]: e.createdAt,
  };
}

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
      await downloadCsv(filename, enquiries.map(toCsvRow));
    } catch (err) {
      notify('Error', 'Could not export data.');
    } finally {
      setExporting(false);
    }
  };

  const byStage = countBy(enquiries, (e) => STAGE_LABELS[e.stage] || e.stage);
  const byDealership = countBy(enquiries, (e) => e.dealershipName);
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

      <BreakdownList title="Enquiries by Stage" entries={byStage} />
      <BreakdownList title="Enquiries by Dealership" entries={byDealership} />
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
