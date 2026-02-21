import React from 'react';
import { View, Text } from 'react-native';
import { CreditCard } from '../types';

interface CardChipProps {
  card: CreditCard;
  size?: 'sm' | 'md' | 'lg';
}

export function CardChip({ card, size = 'md' }: CardChipProps) {
  const dimensions = {
    sm: { width: 36, height: 22, radius: 3 },
    md: { width: 52, height: 32, radius: 5 },
    lg: { width: 72, height: 44, radius: 7 },
  }[size];

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: dimensions.radius,
        backgroundColor: card.color,
        borderWidth: 1,
        borderColor: card.accentColor,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 2,
      }}
    >
      <View
        style={{
          width: dimensions.width * 0.3,
          height: dimensions.height * 0.35,
          borderRadius: 2,
          backgroundColor: card.accentColor,
          opacity: 0.8,
        }}
      />
    </View>
  );
}
