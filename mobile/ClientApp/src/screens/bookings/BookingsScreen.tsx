import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatTime } from '../../utils/dateFormatter';
import { BookingStatus } from '../../types/booking';
import StatusBadge from '../../components/StatusBadge';
import EmptyStateView from '../../components/EmptyStateView';

const Tab = createMaterialTopTabNavigator();

// Main component for the Bookings Screen with tabs
const BookingsScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3f51b5',
        tabBarInactiveTintColor: '#757575',
        tabBarIndicatorStyle: { backgroundColor: '#3f51b5' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Tab.Screen name="Upcoming" component={UpcomingBookingsTab} />
      <Tab.Screen name="Past" component={PastBookingsTab} />
      <Tab.Screen name="All" component={AllBookingsTab} />
    </Tab.Navigator>
  );
};

// Common booking list component used by all tabs
const BookingsList = ({ 
  bookings, 
  isLoading, 
  refreshing, 
  onRefresh 
}) => {
  const navigation = useNavigation();

  const renderBookingItem = ({ item }) => {
    const canReschedule = item.status === 'confirmed' && 
      new Date(item.booking_date + ' ' + item.booking_time) > 
      new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => navigation.navigate('Booking Details', { bookingId: item.id })}
      >
        <View style={styles.businessInfo}>
          {item.businesses?.logo_url ? (
            <Image 
              source={{ uri: item.businesses.logo_url }} 
              style={styles.businessLogo}
            />
          ) : (
            <View style={[styles.businessLogo, styles.placeholderLogo]}>
              <Text style={styles.placeholderText}>
                {item.businesses?.name?.charAt(0) || 'B'}
              </Text>
            </View>
          )}
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{item.businesses?.name || 'Business Name'}</Text>
            <Text style={styles.serviceText}>{item.services?.name || 'Service'}</Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(item.booking_date)}</Text>
            <Text style={styles.timeText}>{formatTime(item.booking_time)}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        {/* Action buttons based on booking status */}
        <View style={styles.actionRow}>
          {item.payment_status !== 'completed' && item.payment_required && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.payButton]}
              onPress={() => navigation.navigate('Payment', { booking: item })}
            >
              <Text style={styles.actionButtonText}>Pay Now</Text>
            </TouchableOpacity>
          )}
          
          {canReschedule && !item.has_rescheduled && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => navigation.navigate('Reschedule', { booking: item })}
            >
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <EmptyStateView 
        iconName="event-busy"
        title="No bookings found"
        message="You don't have any bookings in this category yet."
      />
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={renderBookingItem}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

// Tab component for upcoming bookings
const UpcomingBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchUpcomingBookings = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price, currency),
          businesses:business_id(name, address, city, currency, logo_url)
        `)
        .eq('customer_email', user.email)
        .gte('booking_date', today)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });
        
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUpcomingBookings();
  };

  return (
    <BookingsList
      bookings={bookings}
      isLoading={isLoading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

// Tab component for past bookings
const PastBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchPastBookings = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price, currency),
          businesses:business_id(name, address, city, currency, logo_url)
        `)
        .eq('customer_email', user.email)
        .lt('booking_date', today)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });
        
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching past bookings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPastBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPastBookings();
  };

  return (
    <BookingsList
      bookings={bookings}
      isLoading={isLoading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

// Tab component for all bookings
const AllBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchAllBookings = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id(name, price, currency),
          businesses:business_id(name, address, city, currency, logo_url)
        `)
        .eq('customer_email', user.email)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });
        
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllBookings();
  };

  return (
    <BookingsList
      bookings={bookings}
      isLoading={isLoading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderLogo: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#757575',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    color: '#666666',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateTimeContainer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#4caf50',
  },
  rescheduleButton: {
    backgroundColor: '#ff9800',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});

export default BookingsScreen;
