import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type BookingStatusType = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';

interface StatusBadgeProps {
  status: BookingStatusType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  style,
  textStyle,
  showIcon = false,
}) => {
  // Get the badge color based on status
  const getBadgeColor = () => {
    switch (status) {
      case 'confirmed':
        return '#4caf50'; // Green
      case 'pending':
        return '#ff9800'; // Orange
      case 'completed':
        return '#2196f3'; // Blue
      case 'cancelled':
        return '#f44336'; // Red
      case 'rescheduled':
        return '#9c27b0'; // Purple
      default:
        return '#9e9e9e'; // Grey for unknown status
    }
  };

  // Get the badge text based on status
  const getBadgeText = () => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rescheduled':
        return 'Rescheduled';
      default:
        return 'Unknown';
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 6 };
      case 'large':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      default: // medium
        return { paddingVertical: 4, paddingHorizontal: 8 };
    }
  };

  // Get text size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return { fontSize: 10 };
      case 'large':
        return { fontSize: 14 };
      default: // medium
        return { fontSize: 12 };
    }
  };

  const badgeColor = getBadgeColor();
  const badgeText = getBadgeText();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${badgeColor}15` }, // 15% opacity of the color
        getSizeStyle(),
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: badgeColor },
          getTextSizeStyle(),
          textStyle,
        ]}
      >
        {badgeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});
