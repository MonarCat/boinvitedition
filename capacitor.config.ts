
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4634e4fd7a844269a977830c05f6ad20',
  appName: 'Boinvit - Business Booking',
  webDir: 'dist',
  server: {
    url: 'https://4634e4fd-7a84-4269-a977-830c05f6ad20.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#C53030', // Royal red color
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#C53030'
    }
  }
};

export default config;
