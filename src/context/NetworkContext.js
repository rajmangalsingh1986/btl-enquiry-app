import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({ isOnline: true });

export function NetworkProvider({ children, onReconnect }) {
  const [isOnline, setIsOnline] = useState(true);
  const wasOnline = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online && !wasOnline.current && onReconnect) {
        onReconnect();
      }
      wasOnline.current = online;
    });
    return unsubscribe;
  }, [onReconnect]);

  return <NetworkContext.Provider value={{ isOnline }}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}
