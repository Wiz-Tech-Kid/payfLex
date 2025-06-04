// src/components/ui/card.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

// CardContent Props (example)
type CardContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const CardContent = ({ children, style }: CardContentProps) => (
  <View style={[styles.card, style]}>{children}</View> // Or just {children} if it's meant to be a wrapper
);

export const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
