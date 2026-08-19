import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import LabeledInput from '../../components/LabeledInput';
import ChipSelect from '../../components/ChipSelect';
import SegmentedControl from '../../components/SegmentedControl';
import { SEGMENT_OPTIONS, PROFILE_OPTIONS_BY_SEGMENT } from '../../constants/options';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { saveLocalEnquiry } from '../../db/localDb';
import { syncPendingEnquiries } from '../../utils/sync';
import { notify } from '../../utils/confirm';

const emptyForm = (user) => ({
  activityName: '',
  location: '',
  activityDate: new Date(),
  dealershipName: user?.dealershipName || '',
  customerName: '',
  contactNo: '',
  segment: '',
  profile: '',
  application: '',
  currentVehicle: '',
  vehicleModelInterested: '',
  variant: '',
  exchangeInterested: null,
});

export default function NewEnquiryScreen() {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const [form, setForm] = useState(emptyForm(user));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateSegment = (value) => {
    setForm((f) => {
      const profileOptions = PROFILE_OPTIONS_BY_SEGMENT[value] || [];
      return {
        ...f,
        segment: value,
        profile: profileOptions.includes(f.profile) ? f.profile : '',
        application: value === 'Commercial' ? f.application : '',
      };
    });
  };

  const profileOptions = PROFILE_OPTIONS_BY_SEGMENT[form.segment] || [];

  const validate = () => {
    const required = ['activityName', 'location', 'dealershipName', 'customerName', 'contactNo', 'segment', 'profile', 'vehicleModelInterested'];
    const missing = required.filter((k) => !form[k]);
    if (missing.length) return `Please fill in: ${missing.join(', ')}`;
    if (form.segment === 'Commercial' && !form.application) return 'Please fill in: application';
    if (!/^\d{10}$/.test(form.contactNo.trim())) return 'Contact number must be a 10-digit number';
    if (form.exchangeInterested === null) return 'Please specify if the customer is looking for an exchange';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      notify('Missing information', validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientUuid: uuidv4(),
        ...form,
        activityDate: form.activityDate.toISOString().slice(0, 10),
        contactNo: form.contactNo.trim(),
      };

      await saveLocalEnquiry(payload);
      const result = isOnline ? await syncPendingEnquiries() : { synced: 0 };

      setForm(emptyForm(user));
      notify(
        'Enquiry captured',
        result.synced > 0
          ? 'Saved and sent to the Customer Relationship Executive.'
          : "Saved on this device. It will sync automatically once you're back online."
      );
    } catch (err) {
      notify('Error', 'Could not save the enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {!isOnline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>You're offline — this enquiry will be saved on your device and synced automatically.</Text>
        </View>
      ) : null}

      <LabeledInput label="Activity Name" required value={form.activityName} onChangeText={(v) => update('activityName', v)} placeholder="e.g. Mall Activation - Phoenix Mall" />
      <LabeledInput label="Location" required value={form.location} onChangeText={(v) => update('location', v)} placeholder="e.g. Phoenix Mall, Andheri" />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date of Activity <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{form.activityDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker ? (
          <DateTimePicker
            value={form.activityDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) update('activityDate', selectedDate);
            }}
          />
        ) : null}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Dealership Name</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyFieldText}>{form.dealershipName}</Text>
        </View>
      </View>

      <LabeledInput label="Customer Name" required value={form.customerName} onChangeText={(v) => update('customerName', v)} placeholder="Customer's full name" />
      <LabeledInput label="Contact No." required value={form.contactNo} onChangeText={(v) => update('contactNo', v.replace(/[^0-9]/g, ''))} placeholder="10-digit mobile number" keyboardType="number-pad" maxLength={10} />

      <SegmentedControl label="Segment" required options={SEGMENT_OPTIONS} value={form.segment} onChange={updateSegment} />
      <ChipSelect
        label="Profile *"
        options={profileOptions}
        value={form.profile}
        onChange={(v) => update('profile', v)}
        disabled={!form.segment}
      />
      {!form.segment ? <Text style={styles.helperText}>Select a segment above to see profile options.</Text> : null}

      {form.segment === 'Commercial' ? (
        <LabeledInput
          label="Application"
          required
          value={form.application}
          onChangeText={(v) => update('application', v)}
          placeholder="e.g. Cargo, Passenger, Construction"
        />
      ) : null}

      <LabeledInput label="Current Vehicle Being Used" value={form.currentVehicle} onChangeText={(v) => update('currentVehicle', v)} placeholder="e.g. Maruti Swift 2018 (leave blank if none)" />
      <LabeledInput label="Vehicle Model Interested In" required value={form.vehicleModelInterested} onChangeText={(v) => update('vehicleModelInterested', v)} placeholder="e.g. XUV700" />
      <LabeledInput label="Variant" value={form.variant} onChangeText={(v) => update('variant', v)} placeholder="e.g. AX7" />

      <ChipSelect label="Looking for Exchange? *" options={['Yes', 'No']} value={form.exchangeInterested === null ? '' : form.exchangeInterested ? 'Yes' : 'No'} onChange={(v) => update('exchangeInterested', v === 'Yes')} />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Submit Enquiry'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  required: { color: '#DC2626' },
  dateButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: { fontSize: 15, color: '#111827' },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  readOnlyFieldText: { fontSize: 15, color: '#374151' },
  submitButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  offlineBannerText: { color: '#92400E', fontSize: 13 },
  helperText: { color: '#9CA3AF', fontSize: 12, marginTop: -10, marginBottom: 16 },
});
