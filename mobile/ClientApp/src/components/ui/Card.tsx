import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ViewProps,
} from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  ...props
}) => {
  // Get the variant style
  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlinedCard;
      case 'elevated':
        return styles.elevatedCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  defaultCard: {
    // Basic styling
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  elevatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
};

// Additional component styles
Object.assign(styles, {
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
