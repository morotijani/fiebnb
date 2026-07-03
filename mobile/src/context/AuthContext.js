import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        const token = await SecureStore.getItemAsync('access_token');
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (identifier, password) => {
    const { data } = await axiosClient.post('/auth/login', { identifier, password });
    
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await axiosClient.post('/auth/register', userData);
    return data;
  };

  const verifyOtp = async (phone_number, otp_code) => {
    const { data } = await axiosClient.post('/auth/verify-otp', { phone_number, otp_code });
    
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    
    setUser(data.user);
    return data.user;
  };

  const resendOtp = async (phone_number) => {
    const { data } = await axiosClient.post('/auth/resend-otp', { phone_number });
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
