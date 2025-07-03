import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3f51b5',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#3f51b5',
          elevation: 4,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          headerTitle: "Boinvit Booking",
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScannerScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-scanner" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
