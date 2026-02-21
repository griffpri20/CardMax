import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MerchantCategory } from '../src/types';
import { getBestCard, formatEffectiveValue, formatEarnRate } from '../src/engine/getBestCard';
import { CardRankRow } from '../src/components/CardRankRow';
import { CardChip } from '../src/components/CardChip';
import { useSettings } from '../src/hooks/useSettings';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../src/data/categories';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ merchantName: string; category: string }>();
  const { settings } = useSettings();

  const merchantName = params.merchantName ?? 'Unknown Merchant';
  const category = (params.category ?? 'other') as MerchantCategory;

  const rankings = useMemo(
    () =>
      getBestCard(
        category,
        settings.ownedCardIds,
        settings.cppOverrides,
        settings.rotatingCategories
      ),
    [category, settings.ownedCardIds, settings.cppOverrides, settings.rotatingCategories]
  );

  const winner = rankings[0];
  const rest = rankings.slice(1);

  const hasChase = settings.ownedCardIds.some((id) => id.startsWith('chase'));
  const hasAmex = settings.ownedCardIds.some((id) => id.startsWith('amex'));
  const showOffersReminder = hasChase || hasAmex;

  const categoryIcon = CATEGORY_ICONS[category] ?? '🏪';
  const categoryLabel = CATEGORY_LABELS[category] ?? 'Other';

  if (rankings.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>💳</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a2e', textAlign: 'center' }}>
            No cards selected
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Go to Settings to select which cards you own.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={{
              backgroundColor: '#4f46e5',
              borderRadius: 12,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Merchant header */}
        <View
          style={{
            backgroundColor: '#1a1a2e',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>{categoryIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: '#ffffff', fontSize: 20, fontWeight: '700' }}
                numberOfLines={1}
              >
                {merchantName}
              </Text>
              <Text style={{ color: '#a5b4fc', fontSize: 13, marginTop: 2 }}>
                {categoryLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Winner card */}
        {winner && (
          <View style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 12,
              }}
            >
              Best Card to Use
            </Text>

            <View
              style={{
                borderRadius: 20,
                backgroundColor: winner.card.color,
                padding: 24,
                shadowColor: winner.card.color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Card accent stripe */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  backgroundColor: winner.card.accentColor,
                  opacity: 0.15,
                }}
              />

              {/* Trophy */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 22, marginRight: 8 }}>🏆</Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' }}>
                  Best Card
                </Text>
              </View>

              <CardChip card={winner.card} size="lg" />

              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 22,
                  fontWeight: '800',
                  marginTop: 16,
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {winner.card.name}
              </Text>

              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
                {winner.card.issuer}
              </Text>

              {/* Value display */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  marginTop: 20,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 4 }}>
                    Effective Value
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '800' }}>
                    {formatEffectiveValue(winner.effectiveValue)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 4 }}>
                    Earn Rate
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>
                    {formatEarnRate(winner.card, winner.earnRate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Offers reminder */}
        {showOffersReminder && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              backgroundColor: '#fffbeb',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>💡</Text>
            <Text style={{ flex: 1, fontSize: 13, color: '#78350f', lineHeight: 18 }}>
              Don't forget to check{hasChase ? ' Chase Offers' : ''}{hasChase && hasAmex ? ' &' : ''}{hasAmex ? ' Amex Offers' : ''} for extra savings on this merchant!
            </Text>
          </View>
        )}

        {/* Remaining cards */}
        {rest.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginHorizontal: 20,
                marginBottom: 10,
              }}
            >
              Other Cards
            </Text>
            {rest.map((ranking, index) => (
              <CardRankRow
                key={ranking.card.id}
                ranking={ranking}
                rank={index + 2}
              />
            ))}
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginHorizontal: 16,
            marginTop: 28,
            backgroundColor: '#e0e7ff',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#4f46e5', fontWeight: '700', fontSize: 16 }}>
            ← Back to Merchants
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
