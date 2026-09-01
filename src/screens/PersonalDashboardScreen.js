import React, { useCallback, useState } from 'react';
import { ScrollView, View, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { countBy } from '../utils/stats';
import StatCard from '../components/StatCard';
import BreakdownList from '../components/BreakdownList';
import { STAGE_LABELS } from '../constants/options';

// SC sees their own submitted enquiries (GET /enquiries, which the server
// already scopes to createdById for role SC). CRE/SM see what they've
// personally actioned (GET /enquiries/history, scoped server-side to their
// own creUserId/smUserId) - not the dealership-wide queue. ASM has its own
// dedicated screens (view/download-only, no personal-action history to show).
const ROLE_CONFIG = {
  SC: {
    endpoint: '/enquiries',
    totalLabel: 'Enquiries Submitted',
    breakdowns: [
      { title: 'By Stage', keyFn: (e) => STAGE_LABELS[e.stage] || e.stage },
      { title: 'By Segment', keyFn: (e) => e.segment },
    ],
  },
  CRE: {
    endpoint: '/enquiries/history',
    totalLabel: 'Enquiries Validated',
    breakdowns: [
      { title: 'By Validation', keyFn: (e) => e.cre?.validation },
      { title: 'By Lead Tag', keyFn: (e) => e.cre?.tag },
    ],
  },
  SM: {
    // SM now owns both the status tag and the final/closing tag.
    endpoint: '/enquiries/history',
    totalLabel: 'Enquiries Tagged',
    breakdowns: [
      { title: 'By Status', keyFn: (e) => e.sm?.status },
      { title: 'By Final Status', keyFn: (e) => e.asm?.status },
    ],
  },
};

export default function PersonalDashboardScreen() {
  const { user } = useAuth();
  const config = ROLE_CONFIG[user.role];
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get(config.endpoint);
      setEnquiries(data);
    } catch (err) {
      // keep last known data
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {loading && enquiries.length === 0 ? <ActivityIndicator color="#1D4ED8" style={{ marginTop: 20 }} /> : null}

      <View style={styles.statsRow}>
        <StatCard label={config.totalLabel} value={enquiries.length} />
      </View>

      {config.breakdowns.map(({ title, keyFn }) => (
        <BreakdownList key={title} title={title} entries={countBy(enquiries, keyFn)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
});
