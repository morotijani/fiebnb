import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { phone_number } = route.params || {};
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { verifyOtp, resendOtp } = useAuth();

  useEffect(() => {
    if (!phone_number) {
      navigation.replace('Register');
    }
  }, [phone_number]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'OTP must be exactly 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(phone_number, otpCode);
      // Navigation handled by App.js context switch
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || err.response?.data?.error || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(phone_number);
      Alert.alert('Success', 'A new code has been sent.');
      setTimeLeft(60);
    } catch (err) {
      Alert.alert('Resend Failed', err.response?.data?.message || err.response?.data?.error || 'Failed to resend code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone_number}</Text>

      <TextInput
        style={styles.otpInput}
        placeholder="------"
        value={otpCode}
        onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      <TouchableOpacity 
        style={[styles.button, otpCode.length !== 6 && styles.buttonDisabled]} 
        onPress={handleVerify}
        disabled={isLoading || otpCode.length !== 6}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resendButton}
        onPress={handleResend}
        disabled={timeLeft > 0}
      >
        <Text style={[styles.resendText, timeLeft > 0 && styles.resendTextDisabled]}>
          {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    fontSize: 32,
    letterSpacing: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
});

export default OtpVerificationScreen;
