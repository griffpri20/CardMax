import React from 'react';
import { View, Text } from 'react-native';
import { CardRanking } from '../types';
import { CardChip } from './CardChip';
import { formatEffectiveValue, formatEarnRate } from '../engine/getBestCard';

interface CardRankRowProps {
  ranking: CardRanking;
  rank: number;
}

export function CardRankRow({ ranking, rank }: CardRankRowProps) {
  const { card, earnRate, effectiveValue } = ranking;

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Rank badge */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: '#f3f4f6',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280' }}>
          {rank}
        </Text>
      </View>

      <CardChip card={card} size="sm" />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 15, fontWeight: '600', color: '#1a1a2e' }}
          numberOfLines={1}
        >
          {card.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {formatEarnRate(card, earnRate)}
        </Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: '700', color: '#4f46e5' }}>
        {formatEffectiveValue(effectiveValue)}
      </Text>
    </View>
  );
}
