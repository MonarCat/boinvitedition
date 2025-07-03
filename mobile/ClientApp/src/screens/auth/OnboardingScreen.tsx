import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

// Onboarding data with steps
const onboardingData = [
  {
    id: '1',
    title: 'Welcome to Boinvit',
    description: 'Your personal booking assistant that makes managing appointments easy and stress-free.',
    image: require('../../assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Manage Your Bookings',
    description: 'View upcoming appointments, reschedule with ease, and never miss an appointment again.',
    image: require('../../assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Easy Check-In',
    description: 'Use the QR scanner to quickly check in for your appointments when you arrive.',
    image: require('../../assets/images/onboarding-3.png'),
  },
  {
    id: '4',
    title: 'Secure Payments',
    description: 'Pay for services directly through the app with our secure payment system.',
    image: require('../../assets/images/onboarding-4.png'),
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // Function to handle skipping onboarding
  const handleSkip = () => {
    navigation.navigate('Login');
  };

  // Function to handle next slide or finish onboarding
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  // Function to handle viewable item change
  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  // Pagination dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render each onboarding slide
  const renderOnboardingItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={slidesRef}
      />

      {renderPagination()}

      <View style={styles.bottomContainer}>
        <Button
          label={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          style={styles.button}
          fullWidth
        />
        
        {currentIndex === onboardingData.length - 1 && (
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 40,
    paddingTop: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f51b5',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#607d8b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3f51b5',
  },
  inactiveDot: {
    backgroundColor: '#e0e0e0',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    marginBottom: 10,
  },
  signInButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#757575',
  },
  signInTextBold: {
    fontWeight: 'bold',
    color: '#3f51b5',
  },
});

export default OnboardingScreen;
