import React, { createContext, useState, useContext, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define our theme colors
export const lightTheme = {
  // Primary colors
  primary: '#3f51b5',      // Primary Blue
  primaryLight: '#757de8',
  primaryDark: '#002984',
  
  // Accent colors
  accent: '#00bcd4',       // Accent Teal
  accentLight: '#62efff',
  accentDark: '#008ba3',
  
  // Status colors
  success: '#4caf50',      // Success Green
  warning: '#ff9800',      // Warning Orange
  error: '#f44336',        // Error Red
  info: '#2196f3',         // Info Blue
  
  // Neutral colors
  background: '#f5f7fa',   // Background Light
  card: '#ffffff',         // Card White
  text: '#263238',         // Text Dark
  textSecondary: '#607d8b', // Text Medium
  textMuted: '#b0bec5',    // Text Light
  border: '#e0e0e0',       // Border Light
  
  // Status bar
  statusBar: 'dark-content',
};

export const darkTheme = {
  // Primary colors
  primary: '#5c6bc0',      // Primary Blue (lighter for dark mode)
  primaryLight: '#8e99f3',
  primaryDark: '#26418f',
  
  // Accent colors
  accent: '#26c6da',       // Accent Teal (adjusted for dark mode)
  accentLight: '#6ff9ff',
  accentDark: '#0095a8',
  
  // Status colors
  success: '#66bb6a',      // Success Green (lighter for dark mode)
  warning: '#ffa726',      // Warning Orange (lighter for dark mode)
  error: '#ef5350',        // Error Red (lighter for dark mode)
  info: '#42a5f5',         // Info Blue (lighter for dark mode)
  
  // Neutral colors
  background: '#121212',   // Dark Background
  card: '#1e1e1e',         // Dark Card
  text: '#ffffff',         // Light Text
  textSecondary: '#b0bec5', // Light Text Secondary
  textMuted: '#78909c',    // Light Text Muted
  border: '#333333',       // Dark Border
  
  // Status bar
  statusBar: 'light-content',
};

// Create the theme context
type ThemeType = 'light' | 'dark' | 'system';
interface ThemeContextProps {
  theme: typeof lightTheme | typeof darkTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: lightTheme,
  themeType: 'system',
  setThemeType: () => {},
  isDark: false,
});

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [theme, setTheme] = useState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  
  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Update theme when preference changes
  useEffect(() => {
    const updateTheme = async () => {
      let newIsDark: boolean;
      
      if (themeType === 'system') {
        newIsDark = systemColorScheme === 'dark';
      } else {
        newIsDark = themeType === 'dark';
      }
      
      setTheme(newIsDark ? darkTheme : lightTheme);
      setIsDark(newIsDark);
      
      // Save theme preference
      try {
        await AsyncStorage.setItem('@theme_preference', themeType);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    };
    
    updateTheme();
  }, [themeType, systemColorScheme]);
  
  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, isDark }}>
      <StatusBar 
        barStyle={theme.statusBar} 
        backgroundColor={isDark ? '#000000' : '#f5f7fa'} 
      />
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Typography styles based on theme
export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
};
