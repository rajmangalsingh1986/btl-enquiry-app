import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EnquiryCard from '../components/EnquiryCard';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import PersonalDashboardScreen from './PersonalDashboardScreen';

const TAB_LABELS = { pending: 'Pending', history: 'My History', dashboard: 'Dashboard' };

export default function QueueScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [enquiries, setEnquiries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (activeTab) => {
    setLoading(true);
    try {
      const url = activeTab === 'pending' ? '/enquiries' : '/enquiries/history';
      const { data } = await client.get(url);
      setEnquiries(data);
    } catch (err) {
      // keep last known list on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (tab !== 'dashboard') load(tab);
    }, [tab, load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(tab);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabButton, tab === key && styles.tabButtonActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabButtonText, tab === key && styles.tabButtonTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'dashboard' ? (
        <PersonalDashboardScreen />
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? 'Loading...' : tab === 'pending' ? `No enquiries waiting for ${user.role} action.` : 'No history yet.'}
            </Text>
          }
          renderItem={({ item }) => (
            <EnquiryCard
              enquiry={item}
              onPress={() => navigation.navigate('EnquiryDetail', { enquiry: item, mode: tab === 'pending' ? 'tag' : 'view' })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  tabBar: { flexDirection: 'row', padding: 12, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#E5E7EB' },
  tabButtonActive: { backgroundColor: '#1D4ED8' },
  tabButtonText: { color: '#374151', fontWeight: '600' },
  tabButtonTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
