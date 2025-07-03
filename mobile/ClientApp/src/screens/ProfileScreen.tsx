import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: () => {
            // Handle logout logic
            navigation.navigate('Auth');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderMenuItem = (icon, title, subtitle, onPress, rightElement = null) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <MaterialIcons name={icon} size={24} color="#3f51b5" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        <MaterialIcons name="chevron-right" size={24} color="#757575" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: 'https://randomuser.me/api/portraits/women/44.jpg',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <MaterialIcons name="edit" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Jessica Thompson</Text>
          <Text style={styles.profileEmail}>jessica.thompson@example.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {renderMenuItem(
            'person',
            'Personal Information',
            'Update your personal details',
            () => {}
          )}
          {renderMenuItem(
            'notifications',
            'Notifications',
            'Manage your notification preferences',
            () => {},
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: '#a8b4fc' }}
              thumbColor={notificationsEnabled ? '#3f51b5' : '#f5f7fa'}
            />
          )}
          {renderMenuItem(
            'payment',
            'Payment Methods',
            'Manage your payment options',
            () => {}
          )}
          {renderMenuItem(
            'language',
            'Language',
            'English (US)',
            () => {}
          )}
          {renderMenuItem(
            'dark-mode',
            'Dark Mode',
            'Change app appearance',
            () => {},
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#e0e0e0', true: '#a8b4fc' }}
              thumbColor={darkModeEnabled ? '#3f51b5' : '#f5f7fa'}
            />
          )}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem(
            'help',
            'Help Center',
            'Get help with your bookings',
            () => {}
          )}
          {renderMenuItem(
            'feedback',
            'Give Feedback',
            'Share your thoughts with us',
            () => {}
          )}
          {renderMenuItem(
            'policy',
            'Privacy Policy',
            'Learn about our privacy practices',
            () => {}
          )}
          {renderMenuItem(
            'info',
            'About',
            'App version 1.0.0',
            () => {}
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            label="Log Out"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3f51b5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#607d8b',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editProfileText: {
    fontSize: 16,
    color: '#3f51b5',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#607d8b',
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f3ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#263238',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#607d8b',
  },
  logoutContainer: {
    padding: 16,
    marginTop: 24,
  },
});

export default ProfileScreen;
