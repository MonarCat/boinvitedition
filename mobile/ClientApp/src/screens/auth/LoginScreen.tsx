import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/ui/Button';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Here you would implement the actual login logic with Supabase or your auth provider
      // For demo purposes, we'll just simulate a successful login after a delay
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to the main app
        navigation.navigate('Main');
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setError('Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to manage your bookings</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#b0bec5"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#b0bec5"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              label="Log In"
              onPress={handleLogin}
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            <Button
              label="Sign in with Google"
              onPress={() => {}}
              variant="outline"
              icon={
                <Image
                  source={require('../../assets/images/google-logo.png')}
                  style={styles.socialIcon}
                />
              }
              fullWidth
              style={styles.socialButton}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#607d8b',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#263238',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3f51b5',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  separatorText: {
    color: '#607d8b',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    marginBottom: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#607d8b',
    fontSize: 16,
  },
  registerLink: {
    color: '#3f51b5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen;
