import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LabeledInput from '../../components/LabeledInput';
import ChipSelect from '../../components/ChipSelect';
import Dropdown from '../../components/Dropdown';
import client from '../../api/client';
import { ROLE_LABELS, USER_ROLE_OPTIONS } from '../../constants/options';

const ROLE_LABEL_OPTIONS = USER_ROLE_OPTIONS.map((code) => ROLE_LABELS[code]);

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const [dealershipName, setDealershipName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roleCode = USER_ROLE_OPTIONS.find((code) => ROLE_LABELS[code] === roleLabel) || '';
  const needsDealership = roleCode && roleCode !== 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, dealershipsRes] = await Promise.all([
        client.get('/users'),
        client.get('/dealerships'),
      ]);
      setUsers(usersRes.data);
      setDealerships(dealershipsRes.data);
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

  useEffect(() => {
    if (!needsDealership) setDealershipName('');
  }, [needsDealership]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!name.trim() || !username.trim() || !password || !roleCode) {
      Alert.alert('Missing information', 'Name, username, password, and role are all required.');
      return;
    }
    if (needsDealership && !dealershipName) {
      Alert.alert('Missing information', 'Please select a dealership for this role.');
      return;
    }

    const dealership = dealerships.find((d) => d.name === dealershipName);

    setSubmitting(true);
    try {
      await client.post('/users', {
        name: name.trim(),
        username: username.trim(),
        password,
        role: roleCode,
        dealershipId: dealership?.id,
      });
      setName('');
      setUsername('');
      setPassword('');
      setRoleLabel('');
      setDealershipName('');
      await load();
      Alert.alert('Success', 'User added.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not add user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add User</Text>
        <LabeledInput label="Name" required value={name} onChangeText={setName} placeholder="Full name" />
        <LabeledInput label="Username" required value={username} onChangeText={setUsername} placeholder="Login username" autoCapitalize="none" />
        <LabeledInput label="Password" required value={password} onChangeText={setPassword} placeholder="Initial password" secureTextEntry />
        <ChipSelect label="Role *" options={ROLE_LABEL_OPTIONS} value={roleLabel} onChange={setRoleLabel} />
        {needsDealership ? (
          <Dropdown
            label="Dealership"
            required
            value={dealershipName}
            onChange={setDealershipName}
            options={dealerships.map((d) => d.name)}
            placeholder="Select dealership"
          />
        ) : null}
        <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add User</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Existing Users</Text>
      {loading && users.length === 0 ? <ActivityIndicator color="#1D4ED8" /> : null}
      {!loading && users.length === 0 ? <Text style={styles.empty}>No users yet.</Text> : null}
      {users.map((u) => (
        <View key={u.id} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{u.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{ROLE_LABELS[u.role] || u.role}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>@{u.username}</Text>
          {u.dealership ? <Text style={styles.cardSubtitle}>{u.dealership.name}</Text> : null}
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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', flexShrink: 1 },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  roleBadge: { backgroundColor: '#1D4ED8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 10, marginBottom: 10 },
});
