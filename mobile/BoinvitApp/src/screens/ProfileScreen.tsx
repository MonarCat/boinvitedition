import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254712345678'
  };

  const bookings = [
    { 
      id: 'book-001', 
      business: 'Prime Taxi Services', 
      service: 'Airport Transfer', 
      date: '2025-06-30',
      status: 'Upcoming'
    },
    { 
      id: 'book-002', 
      business: 'Glow Beauty Spa', 
      service: 'Full Body Massage', 
      date: '2025-06-25',
      status: 'Completed'
    },
    { 
      id: 'book-003', 
      business: 'City Shuttle Express', 
      service: 'Nairobi - Mombasa', 
      date: '2025-06-20',
      status: 'Completed'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bookings Section */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          
          {bookings.map((booking) => (
            <TouchableOpacity 
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => navigation.navigate('WebView', {
                url: `https://boinvit.com/bookings/${booking.id}`,
                title: 'Booking Details'
              })}
            >
              <View style={styles.bookingHeader}>
                <Text style={styles.businessName}>{booking.business}</Text>
                <Text style={[
                  styles.bookingStatus,
                  booking.status === 'Upcoming' ? styles.statusUpcoming : styles.statusCompleted
                ]}>
                  {booking.status}
                </Text>
              </View>
              
              <Text style={styles.serviceName}>{booking.service}</Text>
              <Text style={styles.bookingDate}>
                {new Date(booking.date).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Payment Methods</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Saved Locations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1a237e',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#1a237e',
    fontWeight: '500',
  },
  bookingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bookingStatus: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusUpcoming: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    color: '#388e3c',
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: '#888',
  },
  actionsSection: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#c62828',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c62828',
  },
});

export default ProfileScreen;
