import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EnquiryCard from '../../components/EnquiryCard';
import { getLocalEnquiries, upsertFromServer } from '../../db/localDb';
import { syncPendingEnquiries } from '../../utils/sync';
import { useNetwork } from '../../context/NetworkContext';
import client from '../../api/client';

export default function MyEnquiriesScreen({ navigation }) {
  const { isOnline } = useNetwork();
  const [enquiries, setEnquiries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (isOnline) {
      try {
        await syncPendingEnquiries();
        const { data } = await client.get('/enquiries');
        for (const e of data) {
          await upsertFromServer(e);
        }
      } catch (err) {
        // fall through to local cache below
      }
    }
    const local = await getLocalEnquiries();
    setEnquiries(local);
  }, [isOnline]);

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

  return (
    <View style={styles.container}>
      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.clientUuid}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No enquiries captured yet.</Text>}
        renderItem={({ item }) => (
          <EnquiryCard enquiry={item} onPress={() => navigation.navigate('EnquiryDetail', { enquiry: item, mode: 'view' })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
