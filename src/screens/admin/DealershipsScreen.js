import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LabeledInput from '../../components/LabeledInput';
import client from '../../api/client';

export default function DealershipsScreen() {
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/dealerships');
      setDealerships(data);
    } catch (err) {
      // keep last known list
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

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Missing information', 'Dealership name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post('/dealerships', { name: name.trim(), location: location.trim(), state: state.trim() });
      setName('');
      setLocation('');
      setState('');
      await load();
      Alert.alert('Success', 'Dealership added.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not add dealership.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (d) => {
    Alert.alert('Delete dealership', `Delete ${d.name}? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/dealerships/${d.id}`);
            await load();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not delete dealership.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add Dealership</Text>
        <LabeledInput label="Name" required value={name} onChangeText={setName} placeholder="e.g. Prime Motors - Andheri" />
        <LabeledInput label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Andheri, Mumbai" />
        <LabeledInput label="State" value={state} onChangeText={setState} placeholder="e.g. Maharashtra" />
        <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Dealership</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Existing Dealerships</Text>
      {loading && dealerships.length === 0 ? <ActivityIndicator color="#1D4ED8" /> : null}
      {!loading && dealerships.length === 0 ? <Text style={styles.empty}>No dealerships yet.</Text> : null}
      {dealerships.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.cardTitle}>{d.name}</Text>
          {d.location || d.state ? (
            <Text style={styles.cardSubtitle}>{[d.location, d.state].filter(Boolean).join(', ')}</Text>
          ) : null}
          <View style={styles.cardActionRow}>
            <TouchableOpacity style={styles.cardActionButton} onPress={() => handleDelete(d)}>
              <Text style={styles.cardActionTextDestructive}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
    marginBottom: 20,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardActionRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  cardActionButton: { paddingVertical: 4 },
  cardActionTextDestructive: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 10, marginBottom: 10 },
});
