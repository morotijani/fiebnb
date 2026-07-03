import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import CreateListingScreen from './CreateListingScreen';

export default function MyListingsScreen({ route }) {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <CreateListingScreen onCancel={() => setIsCreating(false)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Properties</Text>
      <Text style={styles.subtitle}>You have no listings yet.</Text>
      
      <Button 
        title="Create New Listing" 
        onPress={() => setIsCreating(true)} 
        color="#2b5cff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 }
});
