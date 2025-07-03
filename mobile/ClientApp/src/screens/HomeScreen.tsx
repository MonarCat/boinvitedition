import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';

// Components
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useUpcomingBookings } from '../hooks/useBookings';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    data: upcomingBookings, 
    isLoading 
  } = useUpcomingBookings(user?.email);

  // Format booking date display
  const formatBookingTime = (dateString, timeString) => {
    const bookingDate = new Date(`${dateString}T${timeString}`);
    return formatDistanceToNow(bookingDate, { addSuffix: true });
  };
  
  // Navigate to QR scanner
  const handleScanQR = () => {
    navigation.navigate('Scan');
  };
  
  // Navigate to all bookings
  const handleViewAllBookings = () => {
    navigation.navigate('Bookings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName || 'there'}!</Text>
          <Text style={styles.subGreeting}>Manage your bookings</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {user?.displayName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleScanQR}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="qrcode-scan" size={24} color="#3f51b5" />
            </View>
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Search')}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="magnify" size={24} color="#3f51b5" />
            </View>
            <Text style={styles.actionText}>Find Business</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewAllBookings}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="calendar-clock" size={24} color="#3f51b5" />
            </View>
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Upcoming Booking Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            <TouchableOpacity onPress={handleViewAllBookings}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2].map((item) => (
                <View key={item} style={styles.skeletonCard}>
                  <View style={styles.skeletonRow}>
                    <View style={styles.skeletonCircle} />
                    <View style={styles.skeletonLines}>
                      <View style={styles.skeletonTitle} />
                      <View style={styles.skeletonSubtitle} />
                    </View>
                  </View>
                  <View style={styles.skeletonInfo} />
                  <View style={styles.skeletonAction} />
                </View>
              ))}
            </View>
          ) : upcomingBookings?.length > 0 ? (
            upcomingBookings.slice(0, 2).map((booking) => (
              <Card key={booking.id} style={styles.bookingCard}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Booking Details', { bookingId: booking.id })}
                >
                  <View style={styles.bookingHeader}>
                    {booking.businesses?.logo_url ? (
                      <Image 
                        source={{ uri: booking.businesses.logo_url }} 
                        style={styles.businessLogo} 
                      />
                    ) : (
                      <View style={styles.businessLogoPlaceholder}>
                        <Text style={styles.businessLogoText}>
                          {booking.businesses?.name?.charAt(0) || 'B'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.bookingInfo}>
                      <Text style={styles.businessName}>{booking.businesses?.name}</Text>
                      <Text style={styles.serviceText}>{booking.services?.name}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      {booking.status === 'confirmed' ? (
                        <View style={[styles.statusBadge, styles.confirmedBadge]}>
                          <Text style={styles.statusText}>Confirmed</Text>
                        </View>
                      ) : booking.status === 'pending' ? (
                        <View style={[styles.statusBadge, styles.pendingBadge]}>
                          <Text style={styles.statusText}>Pending</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, styles.completedBadge]}>
                          <Text style={styles.statusText}>Completed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.bookingTimeContainer}>
                    <Icon name="clock-outline" size={16} color="#607d8b" style={styles.timeIcon} />
                    <Text style={styles.bookingTime}>
                      {formatBookingTime(booking.booking_date, booking.booking_time)}
                    </Text>
                  </View>
                  
                  <View style={styles.bookingActions}>
                    {booking.payment_status !== 'completed' && booking.payment_required && (
                      <Button 
                        style={styles.payButton} 
                        label="Pay Now"
                        onPress={() => navigation.navigate('Payment', { booking: booking })}
                      />
                    )}
                    
                    {booking.status === 'confirmed' && 
                     !booking.has_rescheduled && 
                     new Date(booking.booking_date + 'T' + booking.booking_time) > 
                     new Date(Date.now() + 2 * 60 * 60 * 1000) && (
                      <Button 
                        style={styles.rescheduleButton}
                        label="Reschedule"
                        variant="outline"
                        onPress={() => navigation.navigate('Reschedule', { booking: booking })}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="calendar-blank"
              title="No upcoming bookings"
              message="You don't have any upcoming bookings. Scan a QR code or search for a business to make a booking."
              action={{
                label: "Find a Business",
                onPress: () => navigation.navigate('Search')
              }}
            />
          )}
        </View>
        
        {/* Recent Businesses Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Booked</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.businessesContainer}
          >
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <View key={item} style={styles.skeletonBusiness}>
                  <View style={styles.skeletonBusinessLogo} />
                  <View style={styles.skeletonBusinessName} />
                </View>
              ))
            ) : upcomingBookings?.length > 0 ? (
              // Get unique businesses from bookings
              [...new Map(upcomingBookings.map(item => 
                [item.businesses?.id, item.businesses])).values()]
              .slice(0, 5)
              .map((business) => (
                <TouchableOpacity 
                  key={business.id}
                  style={styles.businessCard}
                  onPress={() => navigation.navigate('BusinessDetails', { businessId: business.id })}
                >
                  {business?.logo_url ? (
                    <Image 
                      source={{ uri: business.logo_url }}
                      style={styles.recentBusinessLogo}
                    />
                  ) : (
                    <View style={styles.recentBusinessLogoPlaceholder}>
                      <Text style={styles.recentBusinessLogoText}>
                        {business?.name?.charAt(0) || 'B'}
                      </Text>
                    </View>
                  )}
                  <Text 
                    style={styles.recentBusinessName}
                    numberOfLines={1}
                  >
                    {business.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noBusinessContainer}>
                <Text style={styles.noBusinessText}>No recently booked businesses</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#f5f7fa',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#607d8b',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#607d8b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#263238',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3f51b5',
  },
  bookingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  businessLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessLogoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#607d8b',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    color: '#607d8b',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  completedBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeIcon: {
    marginRight: 6,
  },
  bookingTime: {
    fontSize: 14,
    color: '#607d8b',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  payButton: {
    marginRight: 8,
  },
  rescheduleButton: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    marginHorizontal: 16,
  },
  skeletonCard: {
    height: 150,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  skeletonLines: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '70%',
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '50%',
  },
  skeletonInfo: {
    height: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '60%',
    marginTop: 16,
  },
  skeletonAction: {
    height: 36,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '40%',
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  businessesContainer: {
    paddingHorizontal: 16,
  },
  businessCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  recentBusinessLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  recentBusinessLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentBusinessLogoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#607d8b',
  },
  recentBusinessName: {
    fontSize: 12,
    color: '#263238',
    textAlign: 'center',
    width: 80,
  },
  skeletonBusiness: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  skeletonBusinessLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  skeletonBusinessName: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: 60,
  },
  noBusinessContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noBusinessText: {
    fontSize: 14,
    color: '#607d8b',
  },
});

export default HomeScreen;
