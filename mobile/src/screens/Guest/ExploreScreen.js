import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ["Entire Homes", "Guest Houses", "Long Term", "Villas", "Cabins"];
const MOCK_PROPERTIES = [
  { id: '1', title: 'Luxury Villa in East Legon', location: 'Accra, Ghana', price: '1,500', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80' },
  { id: '2', title: 'Cozy Guest House Room', location: 'Kumasi, Ghana', price: '450', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80' },
  { id: '3', title: 'Ocean View Apartment', location: 'Takoradi, Ghana', price: '800', image: 'https://images.unsplash.com/photo-1502672260266-1c1cd2cb94d1?w=500&q=80' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#333" style={styles.searchIcon} />
          <View>
            <Text style={styles.searchTitle}>Where to?</Text>
            <TextInput 
              placeholder="Anywhere • Any week • Add guests" 
              placeholderTextColor="#777"
              style={styles.searchInput}
            />
          </View>
        </View>
      </View>

      {/* Categories */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>{cat}</Text>
              {index === 0 && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Property Feed */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContainer}>
        {MOCK_PROPERTIES.map(prop => (
          <View key={prop.id} style={styles.card}>
            <Image source={{ uri: prop.image }} style={styles.cardImage} />
            <TouchableOpacity style={styles.heartIcon}>
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.cardDetails}>
              <View style={styles.cardHeader}>
                <Text style={styles.locationText}>{prop.location}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#333" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <Text style={styles.titleText}>{prop.title}</Text>
              <Text style={styles.priceText}><Text style={styles.boldPrice}>GHS {prop.price}</Text> / night</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  searchContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: { paddingHorizontal: 10 },
  searchTitle: { fontSize: 13, fontWeight: '700', color: '#222' },
  searchInput: { fontSize: 13, color: '#777', padding: 0, margin: 0, height: 18 },
  categoriesContainer: { paddingHorizontal: 24, paddingBottom: 10, gap: 24 },
  categoryItem: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  categoryText: { fontSize: 14, color: '#777', fontWeight: '500' },
  activeCategoryText: { color: '#222', fontWeight: '600' },
  activeIndicator: { height: 2, width: '100%', backgroundColor: '#222', borderRadius: 2 },
  feedContainer: { paddingHorizontal: 24, paddingBottom: 30, paddingTop: 10 },
  card: { marginBottom: 30 },
  cardImage: { width: '100%', height: 320, borderRadius: 16 },
  heartIcon: { position: 'absolute', top: 16, right: 16 },
  cardDetails: { marginTop: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { fontSize: 15, fontWeight: '600', color: '#222' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, color: '#222' },
  titleText: { fontSize: 15, color: '#777', marginTop: 2 },
  priceText: { fontSize: 15, color: '#222', marginTop: 4 },
  boldPrice: { fontWeight: '600' },
});
