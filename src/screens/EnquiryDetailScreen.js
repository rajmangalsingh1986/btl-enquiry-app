import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import EnquiryFields from '../components/EnquiryFields';
import StageTimeline from '../components/StageTimeline';
import ChipSelect from '../components/ChipSelect';
import LabeledInput from '../components/LabeledInput';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  CRE_VALIDATION_OPTIONS,
  CRE_TAG_OPTIONS,
  SM_STATUS_OPTIONS,
  ASM_STATUS_OPTIONS,
} from '../constants/options';

function CreForm({ enquiry, onDone }) {
  const [validation, setValidation] = useState('');
  const [tag, setTag] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!validation || !tag) {
      Alert.alert('Missing information', 'Please select a validation result and a lead tag.');
      return;
    }
    setSubmitting(true);
    try {
      await client.patch(`/enquiries/${enquiry.id}/cre`, { validation, tag, remarks });
      onDone();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Validate &amp; Tag</Text>
      <ChipSelect label="Validation *" options={CRE_VALIDATION_OPTIONS} value={validation} onChange={setValidation} />
      <ChipSelect label="Lead Tag *" options={CRE_TAG_OPTIONS} value={tag} onChange={setTag} />
      <LabeledInput label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Optional notes" multiline />
      <SubmitButton onPress={submit} submitting={submitting} label="Submit to Sales Manager" />
    </View>
  );
}

function SmForm({ enquiry, onDone }) {
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!status) {
      Alert.alert('Missing information', 'Please select a current status.');
      return;
    }
    setSubmitting(true);
    try {
      await client.patch(`/enquiries/${enquiry.id}/sm`, { status, remarks });
      onDone();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Current Status Tagging</Text>
      <ChipSelect label="Status *" options={SM_STATUS_OPTIONS} value={status} onChange={setStatus} />
      <LabeledInput label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Optional notes" multiline />
      <SubmitButton onPress={submit} submitting={submitting} label="Submit to ASM" />
    </View>
  );
}

function AsmForm({ enquiry, onDone }) {
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!status) {
      Alert.alert('Missing information', 'Please select a final status.');
      return;
    }
    setSubmitting(true);
    try {
      await client.patch(`/enquiries/${enquiry.id}/asm`, { status, remarks });
      onDone();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Final Tagging</Text>
      <ChipSelect label="Final Status *" options={ASM_STATUS_OPTIONS} value={status} onChange={setStatus} />
      <LabeledInput label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Optional notes" multiline />
      <SubmitButton onPress={submit} submitting={submitting} label="Close Enquiry" />
    </View>
  );
}

function SubmitButton({ onPress, submitting, label }) {
  return (
    <TouchableOpacity style={styles.submitButton} onPress={onPress} disabled={submitting}>
      {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{label}</Text>}
    </TouchableOpacity>
  );
}

export default function EnquiryDetailScreen({ route, navigation }) {
  const { enquiry, mode } = route.params;
  const { user } = useAuth();

  const onDone = () => {
    // Navigate immediately rather than waiting on the alert's button press -
    // Alert.alert is a no-op on web, so gating navigation behind its
    // callback would silently strand the user on this screen there.
    Alert.alert('Success', 'Enquiry updated.');
    navigation.goBack();
  };

  const canTag =
    mode === 'tag' &&
    ((user.role === 'CRE' && enquiry.stage === 'CREATED') ||
      (user.role === 'SM' && enquiry.stage === 'CRE_TAGGED') ||
      (user.role === 'ASM' && enquiry.stage === 'SM_TAGGED'));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <EnquiryFields enquiry={enquiry} />
      <StageTimeline enquiry={enquiry} />
      {canTag && user.role === 'CRE' && <CreForm enquiry={enquiry} onDone={onDone} />}
      {canTag && user.role === 'SM' && <SmForm enquiry={enquiry} onDone={onDone} />}
      {canTag && user.role === 'ASM' && <AsmForm enquiry={enquiry} onDone={onDone} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  submitButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
