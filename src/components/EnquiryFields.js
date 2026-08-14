import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function EnquiryFields({ enquiry }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Enquiry Details</Text>
      <Row label="Activity Name" value={enquiry.activityName} />
      <Row label="Location" value={enquiry.location} />
      <Row label="Date of Activity" value={enquiry.activityDate} />
      <Row label="Dealership" value={enquiry.dealershipName} />
      <Row label="Customer Name" value={enquiry.customerName} />
      <Row label="Contact No." value={enquiry.contactNo} />
      <Row label="Segment" value={enquiry.segment} />
      <Row label="Profile" value={enquiry.profile} />
      <Row label="Application" value={enquiry.application} />
      <Row label="Current Vehicle" value={enquiry.currentVehicle || 'None'} />
      <Row label="Model Interested" value={enquiry.vehicleModelInterested} />
      <Row label="Variant" value={enquiry.variant} />
      <Row label="Looking for Exchange" value={enquiry.exchangeInterested ? 'Yes' : 'No'} />
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 13, color: '#6B7280', flex: 1 },
  value: { fontSize: 13, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right' },
});
