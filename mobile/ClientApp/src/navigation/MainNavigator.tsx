import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Navigator
import AuthNavigator from './AuthNavigator';

// App Navigators 
import TabNavigator from './TabNavigator';

// Other Screens
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import RescheduleScreen from '../screens/bookings/RescheduleScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import BusinessDetailsScreen from '../screens/business/BusinessDetailsScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import SplashScreen from '../screens/SplashScreen';

// Create the main stack navigator
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={TabNavigator} />
      
      {/* Screens accessible from tabs but not in the tab bar */}
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen} 
        options={{
          headerShown: true,
          headerTitle: 'Booking Details',
          headerStyle: {
            backgroundColor: '#3f51b5',
          },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen 
        name="Reschedule" 
        component={RescheduleScreen}
        options={{
          headerShown: true,
          headerTitle: 'Reschedule Booking',
          headerStyle: {
            backgroundColor: '#3f51b5',
          },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          headerShown: true,
          headerTitle: 'Complete Payment',
          headerStyle: {
            backgroundColor: '#3f51b5',
          },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BusinessDetails" 
        component={BusinessDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Business Details',
          headerStyle: {
            backgroundColor: '#3f51b5',
          },
          headerTintColor: '#ffffff',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notifications',
          headerStyle: {
            backgroundColor: '#3f51b5',
          },
          headerTintColor: '#ffffff',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
