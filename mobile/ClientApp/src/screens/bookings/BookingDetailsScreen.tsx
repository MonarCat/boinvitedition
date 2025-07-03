import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { addEventToCalendar } from '../../utils/calendarHelper';

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params;
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            services:service_id(name, description, price, duration, currency),
            businesses:business_id(name, address, city, state, country, phone, email, website, logo_url, currency),
            staff:staff_id(name, email, phone, avatar_url)
          `)
          .eq('id', bookingId)
          .single();
          
        if (error) throw error;
        
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        Alert.alert('Error', 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId]);

  // Format price with currency
  const formatPrice = (price, currency) => {
    if (!price) return 'Free';
    
    switch (currency) {
      case 'USD':
        return `$${price.toFixed(2)}`;
      case 'EUR':
        return `€${price.toFixed(2)}`;
      case 'GBP':
        return `£${price.toFixed(2)}`;
      case 'KES':
        return `KES ${price.toFixed(2)}`;
      default:
        return `${price.toFixed(2)} ${currency || ''}`;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  };
  
  // Handle adding booking to device calendar
  const handleAddToCalendar = async () => {
    if (!booking) return;
    
    const startDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + (booking.services?.duration || 60));
    
    const eventDetails = {
      title: `${booking.services?.name} at ${booking.businesses?.name}`,
      startDate: startDateTime,
      endDate: endDateTime,
      location: booking.businesses?.address,
      notes: `Booking reference: ${booking.id}\n${booking.services?.description || ''}`,
    };
    
    try {
      await addEventToCalendar(eventDetails);
      Alert.alert('Success', 'Booking added to calendar');
    } catch (error) {
      Alert.alert('Error', 'Failed to add booking to calendar');
    }
  };
  
  // Handle calling the business
  const handleCallBusiness = () => {
    if (!booking?.businesses?.phone) {
      Alert.alert('Error', 'No phone number available');
      return;
    }
    
    Linking.openURL(`tel:${booking.businesses.phone}`);
  };
  
  // Handle opening the business website
  const handleOpenWebsite = () => {
    if (!booking?.businesses?.website) {
      Alert.alert('Error', 'No website available');
      return;
    }
    
    Linking.openURL(booking.businesses.website);
  };
  
  // Handle rescheduling
  const handleReschedule = () => {
    if (!booking) return;
    
    // Check if already rescheduled
    if (booking.has_rescheduled) {
      Alert.alert('Unable to Reschedule', 'This booking has already been rescheduled once.');
      return;
    }
    
    // Check time constraint (2 hours before)
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const twoHoursBeforeBooking = new Date(bookingDateTime.getTime() - (2 * 60 * 60 * 1000));
    const now = new Date();
    
    if (now > twoHoursBeforeBooking) {
      Alert.alert(
        'Unable to Reschedule',
        'Bookings can only be rescheduled more than 2 hours before the appointment time.'
      );
      return;
    }
    
    navigation.navigate('Reschedule', { booking });
  };
  
  // Handle payment
  const handlePayment = () => {
    if (!booking) return;
    
    navigation.navigate('Payment', { booking });
  };
  
  // Check if the booking can be rescheduled
  const canReschedule = () => {
    if (!booking) return false;
    
    if (booking.status !== 'confirmed' || booking.has_rescheduled) return false;
    
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const twoHoursBeforeBooking = new Date(bookingDateTime.getTime() - (2 * 60 * 60 * 1000));
    const now = new Date();
    
    return now <= twoHoursBeforeBooking;
  };
  
  // Check if the booking needs payment
  const needsPayment = () => {
    if (!booking) return false;
    
    return booking.payment_required && booking.payment_status !== 'completed';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color="#f44336" />
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorMessage}>
          We couldn't find the booking you're looking for. It may have been deleted or you may not have permission to view it.
        </Text>
        <Button
          label="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Status Card */}
      <Card style={styles.statusCard} variant="elevated">
        <CardContent>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <StatusBadge status={booking.status} size="large" />
          </View>
          
          <View style={styles.statusInfo}>
            <View style={styles.statusInfoItem}>
              <Text style={styles.statusInfoLabel}>Date</Text>
              <Text style={styles.statusInfoValue}>{formatDate(booking.booking_date)}</Text>
            </View>
            
            <View style={styles.statusInfoItem}>
              <Text style={styles.statusInfoLabel}>Time</Text>
              <Text style={styles.statusInfoValue}>{formatTime(booking.booking_time)}</Text>
            </View>
            
            {booking.services?.duration && (
              <View style={styles.statusInfoItem}>
                <Text style={styles.statusInfoLabel}>Duration</Text>
                <Text style={styles.statusInfoValue}>{booking.services.duration} mins</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
      
      {/* Business Information */}
      <Card style={styles.card} variant="outlined">
        <CardHeader>
          <Text style={styles.cardTitle}>Business Information</Text>
        </CardHeader>
        
        <CardContent>
          <View style={styles.businessHeader}>
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
            
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{booking.businesses?.name || 'Unknown Business'}</Text>
              <Text style={styles.businessAddress}>
                {booking.businesses?.address || 'No address provided'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallBusiness}>
              <View style={styles.actionButtonIcon}>
                <Icon name="phone" size={20} color="#3f51b5" />
              </View>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenWebsite}>
              <View style={styles.actionButtonIcon}>
                <Icon name="web" size={20} color="#3f51b5" />
              </View>
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BusinessDetails', { businessId: booking.business_id })}
            >
              <View style={styles.actionButtonIcon}>
                <Icon name="storefront" size={20} color="#3f51b5" />
              </View>
              <Text style={styles.actionButtonText}>Book Again</Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>
      
      {/* Service Details */}
      <Card style={styles.card} variant="outlined">
        <CardHeader>
          <Text style={styles.cardTitle}>Service Details</Text>
        </CardHeader>
        
        <CardContent>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceName}>{booking.services?.name || 'Unknown Service'}</Text>
            <Text style={styles.servicePrice}>
              {formatPrice(booking.services?.price, booking.businesses?.currency)}
            </Text>
          </View>
          
          {booking.services?.description && (
            <Text style={styles.serviceDescription}>{booking.services.description}</Text>
          )}
          
          {booking.staff && (
            <View style={styles.staffContainer}>
              <Text style={styles.staffLabel}>Staff Member</Text>
              <View style={styles.staffInfo}>
                {booking.staff?.avatar_url ? (
                  <Image 
                    source={{ uri: booking.staff.avatar_url }} 
                    style={styles.staffAvatar}
                  />
                ) : (
                  <View style={styles.staffAvatarPlaceholder}>
                    <Text style={styles.staffAvatarText}>
                      {booking.staff?.name?.charAt(0) || 'S'}
                    </Text>
                  </View>
                )}
                <Text style={styles.staffName}>{booking.staff?.name || 'Unassigned'}</Text>
              </View>
            </View>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Information */}
      {booking.payment_required && (
        <Card style={styles.card} variant="outlined">
          <CardHeader>
            <Text style={styles.cardTitle}>Payment Information</Text>
          </CardHeader>
          
          <CardContent>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Status</Text>
              <View style={[
                styles.paymentStatus, 
                booking.payment_status === 'completed' ? styles.paymentCompleted : styles.paymentPending
              ]}>
                <Text style={styles.paymentStatusText}>
                  {booking.payment_status === 'completed' ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>
            
            {booking.payment_status === 'completed' && booking.payment_reference && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Reference</Text>
                <Text style={styles.paymentValue}>{booking.payment_reference}</Text>
              </View>
            )}
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <Text style={styles.paymentValue}>
                {formatPrice(booking.services?.price, booking.businesses?.currency)}
              </Text>
            </View>
          </CardContent>
          
          {booking.payment_status !== 'completed' && (
            <CardFooter>
              <Button
                label="Pay Now"
                onPress={handlePayment}
                variant="primary"
              />
            </CardFooter>
          )}
        </Card>
      )}
      
      {/* Additional Information */}
      <Card style={styles.card} variant="outlined">
        <CardHeader>
          <Text style={styles.cardTitle}>Additional Information</Text>
        </CardHeader>
        
        <CardContent>
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>Booking ID</Text>
            <Text style={styles.additionalValue}>{booking.id}</Text>
          </View>
          
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>Booked On</Text>
            <Text style={styles.additionalValue}>
              {format(new Date(booking.created_at), 'MMM d, yyyy')}
            </Text>
          </View>
          
          {booking.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </CardContent>
      </Card>
      
      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          label="Add to Calendar"
          onPress={handleAddToCalendar}
          variant="outline"
          icon={<Icon name="calendar-plus" size={16} color="#3f51b5" />}
          style={styles.calendarButton}
        />
        
        {canReschedule() && (
          <Button
            label="Reschedule"
            onPress={handleReschedule}
            variant="primary"
            icon={<Icon name="calendar-clock" size={16} color="#ffffff" />}
            style={styles.rescheduleButton}
          />
        )}
        
        {needsPayment() && (
          <Button
            label="Pay Now"
            onPress={handlePayment}
            variant="primary"
            icon={<Icon name="credit-card-outline" size={16} color="#ffffff" />}
            style={styles.payButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#607d8b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#263238',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#607d8b',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
  statusCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '500',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  statusInfoItem: {
    alignItems: 'center',
  },
  statusInfoLabel: {
    fontSize: 12,
    color: '#607d8b',
    marginBottom: 4,
  },
  statusInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  businessInfo: {
    marginLeft: 12,
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#607d8b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#607d8b',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#607d8b',
    marginBottom: 16,
    lineHeight: 20,
  },
  staffContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  staffLabel: {
    fontSize: 14,
    color: '#607d8b',
    marginBottom: 8,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  staffAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  staffAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#607d8b',
  },
  staffName: {
    fontSize: 14,
    color: '#263238',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#607d8b',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#263238',
  },
  paymentStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paymentCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  paymentPending: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  additionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#607d8b',
  },
  additionalValue: {
    fontSize: 14,
    color: '#263238',
  },
  notesContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    color: '#607d8b',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#263238',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  calendarButton: {
    flex: 1,
    marginRight: 8,
  },
  rescheduleButton: {
    flex: 1,
    marginLeft: 8,
  },
  payButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4caf50',
  },
});

export default BookingDetailsScreen;
