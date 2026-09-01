import React, { useCallback, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EnquiryCard from '../../components/EnquiryCard';
import client from '../../api/client';

// ASM is view/download-only across every dealership in their assigned area -
// GET /enquiries already scopes this server-side, no stage filter, and
// tapping an enquiry always opens it in read-only mode.
export default function AsmEnquiriesScreen({ navigation }) {
  const [enquiries, setEnquiries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/enquiries');
      setEnquiries(data);
    } catch (err) {
      // keep last known list on failure
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

  return (
    <View style={styles.container}>
      <FlatList
        data={enquiries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No enquiries yet.'}</Text>}
        renderItem={({ item }) => (
          <EnquiryCard enquiry={item} onPress={() => navigation.navigate('EnquiryDetail', { enquiry: item, mode: 'view' })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
