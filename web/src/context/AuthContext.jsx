import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const { data } = await axiosClient.post('/auth/login', { identifier, password });
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    // Expected to return 201 with message, NO tokens yet because OTP is required
    const { data } = await axiosClient.post('/auth/register', userData);
    return data;
  };

  const verifyOtp = async (phone_number, otp_code) => {
    const { data } = await axiosClient.post('/auth/verify-otp', { phone_number, otp_code });
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setUser(data.user);
    return data.user;
  };

  const resendOtp = async (phone_number) => {
    const { data } = await axiosClient.post('/auth/resend-otp', { phone_number });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
