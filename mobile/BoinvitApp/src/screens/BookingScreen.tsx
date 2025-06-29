import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Mock data - in real app, fetch from API
  const businesses = [
    { id: 1, name: 'Prime Taxi Services', rating: 4.8, category: 'Taxi' },
    { id: 2, name: 'City Shuttle Express', rating: 4.5, category: 'Shuttle' },
    { id: 3, name: 'Glow Beauty Spa', rating: 4.7, category: 'Beauty & Wellness' },
    { id: 4, name: 'Elegant Hair Salon', rating: 4.6, category: 'Salon' },
    { id: 5, name: 'Tranquil Spa Retreat', rating: 4.9, category: 'Spa' },
    { id: 6, name: 'Classic Cuts Barbershop', rating: 4.7, category: 'Barbershop' },
  ];
  
  // Filter businesses by category
  const filteredBusinesses = businesses.filter(
    business => business.category === category
  );
  
  const handleProceedToPayment = () => {
    setLoading(true);
    
    // Create the booking first
    createBooking()
      .then(bookingData => {
        setLoading(false);
        
        // Navigate to payment screen with real booking data
        navigation.navigate('Payment', {
          bookingId: bookingData.id || 'mock-booking-' + Date.now(),
          amount: selectedService.price * 100, // Convert to cents for Paystack
          email: customerInfo.email || 'customer@example.com',
          businessName: selectedBusiness.name,
          serviceName: selectedService.name,
          dateTime: selectedDateTime ? `${selectedDateTime.date} at ${selectedDateTime.time}` : 'Not specified'
        });
      })
      .catch(error => {
        console.error('Error creating booking:', error);
        setLoading(false);
        Alert.alert(
          'Booking Error',
          'There was an error creating your booking. Please try again.'
        );
      });
  };
  
  // Function to create a booking
  const createBooking = async () => {
    try {
      // For development testing, just return a mock booking
      // In production, this would make an actual API call
      return {
        id: 'booking-' + Date.now(),
        businessId: selectedBusiness.id,
        serviceId: selectedService.id,
        customerId: 'mock-customer-id',
        date: selectedDateTime?.date,
        time: selectedDateTime?.time,
        status: 'pending',
        paymentStatus: 'pending'
      };
      
      // Production code would look like this:
      /*
      const response = await fetch('https://boinvit.com/api/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          serviceId: selectedService.id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          date: selectedDateTime.date,
          time: selectedDateTime.time
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Error in createBooking:', error);
      throw error;
    }
  };

  // Step 1: Business Selection
  const renderBusinessSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Business</Text>
      {filteredBusinesses.map(business => (
        <TouchableOpacity
          key={business.id}
          style={[
            styles.card,
            selectedBusiness?.id === business.id && styles.selectedCard
          ]}
          onPress={() => setSelectedBusiness(business)}
        >
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessRating}>⭐ {business.rating}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.button, !selectedBusiness && styles.buttonDisabled]}
        disabled={!selectedBusiness}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Step 2: Service Selection
  const renderServiceSelection = () => {
    // Mock services for the selected business
    const services = [
      { id: 1, name: 'Standard Service', duration: 60, price: 1500 },
      { id: 2, name: 'Premium Service', duration: 90, price: 2500 },
      { id: 3, name: 'Express Service', duration: 30, price: 1000 },
    ];
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select a Service</Text>
        {services.map(service => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.card,
              selectedService?.id === service.id && styles.selectedCard
            ]}
            onPress={() => setSelectedService(service)}
          >
            <View style={styles.serviceFlex}>
              <View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>{service.duration} min</Text>
              </View>
              <Text style={styles.servicePrice}>KSh {service.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={styles.buttonOutlineText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !selectedService && styles.buttonDisabled]}
            disabled={!selectedService}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Step 3: Date/Time Selection
  const renderDateTimeSelection = () => {
    const today = new Date();
    const availableDates = [
      today,
      new Date(today.getTime() + 24 * 60 * 60 * 1000),
      new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
      new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    ];
    
    const availableTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Date & Time</Text>
        
        <Text style={styles.subTitle}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                selectedDateTime?.date === date.toDateString() && styles.selectedCard
              ]}
              onPress={() => setSelectedDateTime({
                ...selectedDateTime,
                date: date.toDateString()
              })}
            >
              <Text style={styles.dateDay}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
              <Text style={styles.dateNumber}>{date.getDate()}</Text>
              <Text style={styles.dateMonth}>{date.toLocaleDateString('en-US', { month: 'short' })}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={styles.subTitle}>Time</Text>
        <View style={styles.timeContainer}>
          {availableTimes.map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeCard,
                selectedDateTime?.time === time && styles.selectedCard
              ]}
              onPress={() => setSelectedDateTime({
                ...selectedDateTime,
                time
              })}
            >
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() => setCurrentStep(2)}
          >
            <Text style={styles.buttonOutlineText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              (!selectedDateTime?.date || !selectedDateTime?.time) && styles.buttonDisabled
            ]}
            disabled={!selectedDateTime?.date || !selectedDateTime?.time}
            onPress={() => setCurrentStep(4)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Step 4: Customer Information
  const renderCustomerInfo = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Review & Confirm</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Business:</Text>
            <Text style={styles.summaryValue}>{selectedBusiness?.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{selectedService?.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{selectedDateTime?.date}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{selectedDateTime?.time}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price:</Text>
            <Text style={styles.summaryValue}>KSh {selectedService?.price}</Text>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() => setCurrentStep(3)}
          >
            <Text style={styles.buttonOutlineText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.buttonPayment}
            onPress={handleProceedToPayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Proceed to Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <View 
                style={[
                  styles.progressStep, 
                  currentStep >= step && styles.activeStep
                ]} 
              />
              {step < 4 && (
                <View 
                  style={[
                    styles.progressLine, 
                    currentStep > step && styles.activeLine
                  ]} 
                />
              )}
            </React.Fragment>
          ))}
        </View>
        
        {currentStep === 1 && renderBusinessSelection()}
        {currentStep === 2 && renderServiceSelection()}
        {currentStep === 3 && renderDateTimeSelection()}
        {currentStep === 4 && renderCustomerInfo()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  activeStep: {
    backgroundColor: '#1a237e', // Royal Blue
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: '#1a237e', // Royal Blue
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  card: {
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
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1a237e', // Royal Blue
  },
  businessName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  businessRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  serviceFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e', // Royal Blue
  },
  dateScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateCard: {
    width: 80,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateDay: {
    fontSize: 14,
    color: '#666',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateMonth: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#1a237e', // Royal Blue
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#1a237e', // Royal Blue
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  buttonOutlineText: {
    color: '#1a237e', // Royal Blue
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonPayment: {
    backgroundColor: '#c62828', // Royal Red
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default BookingScreen;
