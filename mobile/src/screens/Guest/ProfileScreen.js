import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../../../App';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { isHomeownerMode, setIsHomeownerMode } = useContext(AppContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.subtitle}>Show profile</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Homeowner Mode</Text>
              <Text style={styles.toggleSubtitle}>Switch to manage your listings</Text>
            </View>
            <Switch 
              value={isHomeownerMode} 
              onValueChange={setIsHomeownerMode} 
              trackColor={{ false: '#ddd', true: '#2b5cff' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Personal Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Payments & Payouts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40, marginTop: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  name: { fontSize: 24, fontWeight: '600', color: '#222' },
  subtitle: { fontSize: 15, color: '#777', textDecorationLine: 'underline', marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#222', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f7f7f7', padding: 20, borderRadius: 12 },
  toggleTextContainer: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  toggleSubtitle: { fontSize: 14, color: '#777', marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee', gap: 16 },
  menuText: { fontSize: 16, color: '#222' },
});
