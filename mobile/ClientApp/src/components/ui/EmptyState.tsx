import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: EmptyStateAction;
  style?: ViewStyle;
  imageSource?: any; // Optional image instead of icon
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  style,
  imageSource,
}) => {
  return (
    <View style={[styles.container, style]}>
      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      ) : (
        <Icon name={icon} size={64} color="#b0bec5" style={styles.icon} />
      )}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant={action.variant || 'primary'}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
  },
  icon: {
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#607d8b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    minWidth: 140,
  },
});
