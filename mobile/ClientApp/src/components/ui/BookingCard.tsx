import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { format } from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

// Components
import { Card } from './Card';
import StatusIndicator, { BookingStatus } from './StatusIndicator';

export interface BookingCardProps {
  id: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  status: BookingStatus;
  businessImage?: string;
  price: number;
  isPaid: boolean;
  onPress?: () => void;
}

/**
 * A card component that displays a booking with key information and actions
 */
export const BookingCard: React.FC<BookingCardProps> = ({
  id,
  businessName,
  serviceName,
  date,
  time,
  status,
  businessImage,
  price,
  isPaid,
  onPress,
}) => {
  const navigation = useNavigation();
  
  // Format date for display
  const formattedDate = format(new Date(date), 'EEE, MMM d');
  
  // Handle card press to navigate to booking details
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('BookingDetails', { bookingId: id });
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        {businessImage ? (
          <Image source={{ uri: businessImage }} style={styles.businessImage} />
        ) : (
          <View style={styles.businessImagePlaceholder}>
            <Text style={styles.businessImagePlaceholderText}>
              {businessName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.businessName} numberOfLines={1}>
            {businessName}
          </Text>
          <Text style={styles.serviceName} numberOfLines={1}>
            {serviceName}
          </Text>
        </View>
        <StatusIndicator status={status} size="small" />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={16} color="#607d8b" style={styles.icon} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="access-time" size={16} color="#607d8b" style={styles.icon} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons 
            name={isPaid ? "check-circle" : "pending"} 
            size={16} 
            color={isPaid ? "#4caf50" : "#ff9800"} 
            style={styles.icon} 
          />
          <Text 
            style={[
              styles.detailText, 
              { color: isPaid ? "#4caf50" : "#ff9800" }
            ]}
          >
            {isPaid ? "Paid" : "Pending Payment"}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.price}>
          ${price.toFixed(2)}
        </Text>
        
        <View style={styles.actions}>
          {!isPaid && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.payButton]}
              onPress={() => navigation.navigate('Payment', { bookingId: id })}
            >
              <MaterialIcons name="payment" size={14} color="#ffffff" />
              <Text style={styles.actionButtonText}>Pay</Text>
            </TouchableOpacity>
          )}
          
          {status === 'confirmed' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => navigation.navigate('Reschedule', { bookingId: id })}
            >
              <MaterialIcons name="event" size={14} color="#ffffff" />
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.detailsButton]}
            onPress={handlePress}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  businessImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  businessImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3f51b5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessImagePlaceholderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    color: '#607d8b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  details: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#607d8b',
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 4,
  },
  payButton: {
    backgroundColor: '#4caf50',
  },
  rescheduleButton: {
    backgroundColor: '#00bcd4',
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3f51b5',
  },
  detailsButtonText: {
    color: '#3f51b5',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BookingCard;
