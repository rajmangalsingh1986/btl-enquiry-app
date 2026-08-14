import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import RootNavigator from './src/navigation/RootNavigator';
import { syncPendingEnquiries } from './src/utils/sync';

export default function App() {
  const onReconnect = useCallback(() => {
    syncPendingEnquiries();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NetworkProvider onReconnect={onReconnect}>
          <RootNavigator />
          <StatusBar style="auto" />
        </NetworkProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
