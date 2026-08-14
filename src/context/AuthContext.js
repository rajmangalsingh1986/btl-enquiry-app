import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { setAuthToken } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'btl-auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { token, user: storedUser } = JSON.parse(raw);
          setAuthToken(token);
          setUser(storedUser);
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    const { data } = await client.post('/auth/login', { username, password });
    setAuthToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.user;
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, initializing, login, logout }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
