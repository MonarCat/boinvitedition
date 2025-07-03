import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking,
  Platform,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

const ScannerScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

  // Request camera permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Process the scanned URL
    try {
      // Check if it's a valid URL
      new URL(data);
      
      // Check if this is a Boinvit booking URL
      if (data.includes('/book/') || data.includes('/booking/') || data.includes('/public-booking/')) {
        // Extract the business ID from the URL
        const segments = data.split('/');
        const businessId = segments[segments.length - 1];
        
        if (businessId) {
          // Navigate to the business booking screen
          navigation.navigate('BusinessDetails', { businessId });
          return;
        }
      }
      
      // If it's a valid URL but not recognized as a Boinvit booking URL
      Alert.alert(
        'External Link Detected',
        'This QR code contains an external link. Would you like to open it in your browser?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
          { text: 'Open', onPress: () => Linking.openURL(data).then(() => setScanned(false)) }
        ]
      );
    } catch (e) {
      // Not a valid URL, show the data as text
      Alert.alert(
        'QR Code Content',
        `The scanned QR code contains: ${data}`,
        [
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
    }
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };

  // Handle permission states
  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="no-photography" size={64} color="#e57373" />
        <Text style={styles.permissionText}>Camera access denied</Text>
        <Text style={styles.permissionSubtext}>
          Camera access is required to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Scanner frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              Position a QR code within the frame
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleFlash}
            >
              <Icon 
                name={flashMode === Camera.Constants.FlashMode.torch ? "flash-on" : "flash-off"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            
            {scanned && (
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
    borderColor: 'transparent',
    borderWidth: 2,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  instructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  controlsContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanAgainButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScannerScreen;
