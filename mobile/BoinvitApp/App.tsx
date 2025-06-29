import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a237e', // Royal Blue
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Boinvit' }} 
          />
          <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ title: 'Book Service' }} 
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ title: 'Sign In/Sign Up' }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'My Profile' }} 
          />
          <Stack.Screen 
            name="WebView" 
            component={WebViewScreen} 
            options={({ route }) => ({ title: route.params?.title || 'Boinvit' })} 
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen} 
            options={{ title: 'Complete Payment' }} 
          />
          <Stack.Screen 
            name="PaymentSuccess" 
            component={PaymentSuccessScreen} 
            options={{ title: 'Payment Successful', headerLeft: null }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
