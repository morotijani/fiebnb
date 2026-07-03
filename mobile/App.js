import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OtpVerificationScreen from './src/screens/auth/OtpVerificationScreen';

const Stack = createNativeStackNavigator();

// Temporary Placeholder for the Main App Flow
const MainAppScreen = () => {
  const { logout, user } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome, {user?.name}</Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>Role: {user?.role}</Text>
      <Text onPress={logout} style={{ color: 'blue', fontSize: 18 }}>Sign Out</Text>
    </View>
  );
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // App Stack (Authenticated)
        <Stack.Screen name="MainApp" component={MainAppScreen} />
      ) : (
        // Auth Stack (Unauthenticated)
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
