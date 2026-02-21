import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Merchant } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../data/categories';
import { MerchantCategory } from '../types';

interface MerchantRowProps {
  merchant: Merchant;
  onPress: (merchant: Merchant) => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function MerchantRow({ merchant, onPress }: MerchantRowProps) {
  const icon = CATEGORY_ICONS[merchant.category as MerchantCategory] ?? '🏪';
  const label = CATEGORY_LABELS[merchant.category as MerchantCategory] ?? 'Other';

  return (
    <TouchableOpacity
      onPress={() => onPress(merchant)}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 72,
      }}
    >
      {/* Category icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#f0f4ff',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>

      {/* Name + category */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: 3,
          }}
          numberOfLines={1}
        >
          {merchant.name}
        </Text>
        <Text style={{ fontSize: 13, color: '#6b7280' }}>{label}</Text>
      </View>

      {/* Distance */}
      <Text style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>
        {formatDistance(merchant.distance)}
      </Text>

      {/* Arrow */}
      <Text style={{ fontSize: 18, color: '#c7d2fe', marginLeft: 8 }}>›</Text>
    </TouchableOpacity>
  );
}
