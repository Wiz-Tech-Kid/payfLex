// src/components/ui/button.tsx
import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
};

export const Button = ({ title, onPress, style }: ButtonProps) => (
  <Pressable
    onPress={onPress}
    style={[
      {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
      style,
    ]}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{title}</Text>
  </Pressable>
);
