import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const navigation = useNavigation();

  const categories = [
    { id: 1, name: 'Taxi', icon: '🚕' },
    { id: 2, name: 'Shuttle', icon: '🚐' },
    { id: 3, name: 'Beauty & Wellness', icon: '💆‍♀️' },
    { id: 4, name: 'Salon', icon: '💇‍♀️' },
    { id: 5, name: 'Spa', icon: '🧖‍♀️' },
    { id: 6, name: 'Barbershop', icon: '💈' },
  ];

  const navigateToBooking = (category) => {
    navigation.navigate('Booking', { category });
  };

  const navigateToWebView = () => {
    navigation.navigate('WebView', { 
      url: 'https://boinvit.com', 
      title: 'Full Website' 
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Book Services with Ease</Text>
          <Text style={styles.heroSubtitle}>
            Find and book the best services in your area
          </Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.heroButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigateToBooking(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visit Website */}
        <TouchableOpacity 
          style={styles.websiteButton}
          onPress={navigateToWebView}
        >
          <Text style={styles.websiteButtonText}>Visit Full Website</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  hero: {
    backgroundColor: '#1a237e', // Royal Blue
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#c62828', // Royal Red
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  websiteButton: {
    backgroundColor: '#534bae', // Royal Blue Light
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  websiteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
