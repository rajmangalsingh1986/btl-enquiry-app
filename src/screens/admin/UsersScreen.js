import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LabeledInput from '../../components/LabeledInput';
import ChipSelect from '../../components/ChipSelect';
import Dropdown from '../../components/Dropdown';
import MultiChipSelect from '../../components/MultiChipSelect';
import client from '../../api/client';
import { ROLE_LABELS, USER_ROLE_OPTIONS, STAFF_SEGMENT_OPTIONS } from '../../constants/options';
import { confirmAction, notify } from '../../utils/confirm';

const ROLE_LABEL_OPTIONS = USER_ROLE_OPTIONS.map((code) => ROLE_LABELS[code]);

const emptyFormState = {
  name: '',
  username: '',
  password: '',
  roleLabel: '',
  dealershipName: '',
  dealershipNames: [],
  segmentLabel: 'Both',
};

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(emptyFormState);
  const [submitting, setSubmitting] = useState(false);

  const roleCode = USER_ROLE_OPTIONS.find((code) => ROLE_LABELS[code] === form.roleLabel) || '';
  const needsSingleDealership = roleCode && roleCode !== 'ADMIN' && roleCode !== 'ASM';
  const needsMultiDealership = roleCode === 'ASM';
  const needsSegment = roleCode === 'CRE' || roleCode === 'SM';
  const isEditing = editingUserId !== null;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

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
    if (!needsSingleDealership) update('dealershipName', '');
    if (!needsMultiDealership) update('dealershipNames', []);
    if (!needsSegment) update('segmentLabel', 'Both');
  }, [needsSingleDealership, needsMultiDealership, needsSegment]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const startEdit = (u) => {
    setEditingUserId(u.id);
    setForm({
      name: u.name,
      username: u.username,
      password: '',
      roleLabel: ROLE_LABELS[u.role] || '',
      dealershipName: u.dealership?.name || '',
      dealershipNames: (u.asmDealerships || []).map((d) => d.name),
      segmentLabel: u.segment || 'Both',
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setForm(emptyFormState);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.username.trim() || (!isEditing && !form.password) || !roleCode) {
      notify('Missing information', 'Name, username, password, and role are all required.');
      return;
    }
    if (needsSingleDealership && !form.dealershipName) {
      notify('Missing information', 'Please select a dealership for this role.');
      return;
    }
    if (needsMultiDealership && form.dealershipNames.length === 0) {
      notify('Missing information', 'Please select at least one dealership for this ASM.');
      return;
    }

    const dealership = dealerships.find((d) => d.name === form.dealershipName);
    const dealershipIds = dealerships.filter((d) => form.dealershipNames.includes(d.name)).map((d) => d.id);
    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      role: roleCode,
      dealershipId: dealership?.id,
      dealershipIds,
      segment: needsSegment && form.segmentLabel !== 'Both' ? form.segmentLabel : null,
    };
    if (form.password) payload.password = form.password;

    setSubmitting(true);
    try {
      if (isEditing) {
        await client.patch(`/users/${editingUserId}`, payload);
      } else {
        payload.password = form.password;
        await client.post('/users', payload);
      }
      cancelEdit();
      await load();
      notify('Success', isEditing ? 'User updated.' : 'User added.');
    } catch (err) {
      notify('Error', err.response?.data?.error || 'Could not save user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (u) => {
    confirmAction('Delete user', `Delete ${u.name} (@${u.username})? This can't be undone.`, async () => {
      try {
        await client.delete(`/users/${u.id}`);
        if (editingUserId === u.id) cancelEdit();
        await load();
      } catch (err) {
        notify('Error', err.response?.data?.error || 'Could not delete user.');
      }
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{isEditing ? 'Edit User' : 'Add User'}</Text>
        <LabeledInput label="Name" required value={form.name} onChangeText={(v) => update('name', v)} placeholder="Full name" />
        <LabeledInput label="Username" required value={form.username} onChangeText={(v) => update('username', v)} placeholder="Login username" autoCapitalize="none" />
        <LabeledInput
          label={isEditing ? 'New Password' : 'Password'}
          required={!isEditing}
          value={form.password}
          onChangeText={(v) => update('password', v)}
          placeholder={isEditing ? 'Leave blank to keep current' : 'Initial password'}
          secureTextEntry
        />
        <ChipSelect label="Role *" options={ROLE_LABEL_OPTIONS} value={form.roleLabel} onChange={(v) => update('roleLabel', v)} />
        {needsSingleDealership ? (
          <Dropdown
            label="Dealership"
            required
            value={form.dealershipName}
            onChange={(v) => update('dealershipName', v)}
            options={dealerships.map((d) => d.name)}
            placeholder="Select dealership"
          />
        ) : null}
        {needsMultiDealership ? (
          <MultiChipSelect
            label="Dealerships in this ASM's area *"
            values={form.dealershipNames}
            onChange={(v) => update('dealershipNames', v)}
            options={dealerships.map((d) => d.name)}
          />
        ) : null}
        {needsSegment ? (
          <ChipSelect
            label="Segment"
            options={STAFF_SEGMENT_OPTIONS}
            value={form.segmentLabel}
            onChange={(v) => update('segmentLabel', v)}
          />
        ) : null}
        <View style={styles.formButtonRow}>
          {isEditing ? (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit} disabled={submitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isEditing ? 'Save Changes' : 'Add User'}</Text>}
          </TouchableOpacity>
        </View>
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
          {u.asmDealerships && u.asmDealerships.length ? (
            <Text style={styles.cardSubtitle}>{u.asmDealerships.map((d) => d.name).join(', ')}</Text>
          ) : null}
          {u.segment ? <Text style={styles.cardSubtitle}>{u.segment} segment</Text> : null}
          <View style={styles.cardActionRow}>
            <TouchableOpacity style={styles.cardActionButton} onPress={() => startEdit(u)}>
              <Text style={styles.cardActionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardActionButton} onPress={() => handleDelete(u)}>
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
  formButtonRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  submitButton: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: '700' },
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
  cardActionRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  cardActionButton: { paddingVertical: 4 },
  cardActionText: { color: '#1D4ED8', fontSize: 13, fontWeight: '600' },
  cardActionTextDestructive: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 10, marginBottom: 10 },
});
