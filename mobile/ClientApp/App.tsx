import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Navigation
import MainNavigator from './src/navigation/MainNavigator';

// Theme Provider
import { ThemeProvider } from './src/theme/ThemeProvider';


/**
 * Main App Component
 * Wraps the app with necessary providers and contains the main navigation structure
 */
const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#3f51b5" 
        />
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
