import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type BookingStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'no-show' 
  | 'rescheduled';

interface StatusIndicatorProps {
  status: BookingStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * A component that visually indicates the status of a booking with color and icons
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  showLabel = true,
}) => {
  // Define status configurations
  const statusConfig = {
    confirmed: {
      color: '#4caf50',
      icon: 'check-circle',
      label: 'Confirmed',
    },
    pending: {
      color: '#ff9800',
      icon: 'pending',
      label: 'Pending',
    },
    completed: {
      color: '#3f51b5',
      icon: 'verified',
      label: 'Completed',
    },
    cancelled: {
      color: '#f44336',
      icon: 'cancel',
      label: 'Cancelled',
    },
    'no-show': {
      color: '#607d8b',
      icon: 'highlight-off',
      label: 'No Show',
    },
    rescheduled: {
      color: '#00bcd4',
      icon: 'event',
      label: 'Rescheduled',
    },
  };

  // Get current status config
  const config = statusConfig[status];

  // Determine size
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      icon: 16,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: 20,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: 24,
      text: styles.textLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        { backgroundColor: `${config.color}20` }, // 20% opacity
      ]}
    >
      <MaterialIcons
        name={config.icon}
        size={currentSize.icon}
        color={config.color}
        style={styles.icon}
      />
      {showLabel && (
        <Text style={[styles.text, currentSize.text, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  containerSmall: {
    height: 24,
    paddingHorizontal: 8,
  },
  containerMedium: {
    height: 32,
    paddingHorizontal: 12,
  },
  containerLarge: {
    height: 40,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
});

export default StatusIndicator;
