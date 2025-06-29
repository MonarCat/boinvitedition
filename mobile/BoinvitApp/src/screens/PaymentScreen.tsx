import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [verifying, setVerifying] = useState(false);
  
  const { bookingId, amount, email, businessName, serviceName } = route.params;
  
  // Create payment URL with necessary parameters using the mobile payment gateway we created
  // Use HTTPS for production security
  const isDevelopment = true; // Set to false for production builds
  
  const baseUrl = isDevelopment 
    ? 'http://localhost:5173' 
    : 'https://boinvit.com';
    
  const paymentUrl = `${baseUrl}/mobile/payment-gateway.html?booking=${bookingId}&amount=${amount}&email=${encodeURIComponent(email)}&businessName=${encodeURIComponent(businessName)}&serviceName=${encodeURIComponent(serviceName)}`;
  
  // The JavaScript to be injected into the WebView
  const injectedJavaScript = `
    // Function to send messages to React Native
    const sendToReactNative = (data) => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    };
    
    // Listen for payment status changes
    window.addEventListener('message', function(event) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        sendToReactNative(data);
      } catch (e) {
        // Not JSON data or already parsed, ignore
      }
    });
    
    // Inform the app that the page is ready
    setTimeout(() => {
      sendToReactNative({ type: 'PAGE_LOADED' });
    }, 500);
    
    true; // Note: this is required for injectedJavaScript
  `;
  
  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      if (data.status === 'success' || data.status === 'completed') {
        // Show verifying payment status
        setPaymentStatus('verifying');
        setVerifying(true);
        
        // Verify payment with our server
        verifyPayment(data.reference, bookingId)
          .then((verified) => {
            if (verified) {
              setPaymentStatus('success');
              
              // Wait a moment to show success message before navigating
              setTimeout(() => {
                navigation.replace('PaymentSuccess', { 
                  bookingId, 
                  reference: data.reference,
                  businessName,
                  serviceName
                });
              }, 1500);
            } else {
              setPaymentStatus('failed');
              Alert.alert(
                'Payment Error', 
                'We couldn\'t verify your payment. Please contact support.'
              );
              
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            }
          })
          .catch((error) => {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            
            setTimeout(() => {
              navigation.goBack();
            }, 1500);
          })
          .finally(() => {
            setVerifying(false);
          });
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        
        // Wait a moment to show failure message
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else if (data.status === 'cancelled' || data.status === 'closed') {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };
  
  // Function to verify payment with our server
  const verifyPayment = async (reference, bookingId) => {
    try {
      const isDevelopment = true; // Set to false for production builds
      
      const baseUrl = isDevelopment 
        ? 'http://localhost:5173' 
        : 'https://boinvit.com';
        
      const response = await fetch(`${baseUrl}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentReference: reference,
          bookingId: bookingId
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Show loading or payment status indicators */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      )}
      
      {paymentStatus === 'verifying' && (
        <View style={styles.statusOverlay}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Verifying payment...</Text>
        </View>
      )}
      
      {paymentStatus === 'success' && (
        <View style={styles.statusOverlay}>
          <Text style={styles.successText}>Payment Successful!</Text>
          <Text style={styles.statusText}>Redirecting to confirmation...</Text>
        </View>
      )}
      
      {paymentStatus === 'failed' && (
        <View style={styles.statusOverlay}>
          <Text style={styles.failedText}>Payment Failed</Text>
          <Text style={styles.statusText}>Please try again</Text>
        </View>
      )}
      
      {/* WebView for payment processing */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={injectedJavaScript}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#1a237e',
    fontSize: 16,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 10,
  },
  failedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PaymentScreen;
