import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { ROLE_LABELS } from '../constants/options';
import LoginScreen from '../screens/LoginScreen';
import SCHomeScreen from '../screens/sc/SCHomeScreen';
import QueueScreen from '../screens/QueueScreen';
import EnquiryDetailScreen from '../screens/EnquiryDetailScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AsmHomeScreen from '../screens/asm/AsmHomeScreen';

const Stack = createNativeStackNavigator();

function LogoutButton() {
  const { logout, user } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Sign out ({user.name.split(' ')[0]})</Text>
    </TouchableOpacity>
  );
}

function OfflineDot() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;
  return (
    <View style={styles.offlineDotWrap}>
      <View style={styles.offlineDot} />
      <Text style={styles.offlineDotText}>Offline</Text>
    </View>
  );
}

function HomeScreenForRole({ role, navigation }) {
  if (role === 'SC') return <SCHomeScreen navigation={navigation} />;
  if (role === 'ADMIN') return <AdminHomeScreen navigation={navigation} />;
  if (role === 'ASM') return <AsmHomeScreen navigation={navigation} />;
  return <QueueScreen navigation={navigation} />;
}

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerRight: () => (user ? <LogoutButton /> : null) }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sarpanch Ka Samman', headerRight: undefined }} />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{ title: ROLE_LABELS[user.role] || 'Home', headerLeft: () => <OfflineDot /> }}
            >
              {(props) => <HomeScreenForRole role={user.role} {...props} />}
            </Stack.Screen>
            <Stack.Screen name="EnquiryDetail" component={EnquiryDetailScreen} options={{ title: 'Enquiry' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoutButton: { paddingHorizontal: 8 },
  logoutText: { color: '#1D4ED8', fontWeight: '600', fontSize: 13 },
  offlineDotWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  offlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', marginRight: 4 },
  offlineDotText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
});
