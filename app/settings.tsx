import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ALL_CARDS } from '../src/data/cards';
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../src/data/categories';
import { useSettings } from '../src/hooks/useSettings';
import { CardChip } from '../src/components/CardChip';
import { MerchantCategory } from '../src/types';

// Cards that support rotating categories
const ROTATING_CARD_IDS = ['chase-freedom-flex', 'discover-it'];

// Mock sync: in production you'd fetch from an API or web scrape
async function fetchRotatingCategories(): Promise<Record<string, string>> {
  // Simulated network delay
  await new Promise((r) => setTimeout(r, 1200));
  // Q2 2025 example values (update these each quarter)
  return {
    'chase-freedom-flex': 'dining',
    'discover-it': 'grocery',
  };
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    toggleCard,
    setCppOverride,
    setRotatingCategory,
    markSynced,
    isSyncStale,
  } = useSettings();

  const [syncing, setSyncing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const rotatingData = await fetchRotatingCategories();
      for (const [cardId, cat] of Object.entries(rotatingData)) {
        setRotatingCategory(cardId, cat);
      }
      markSynced();
      Alert.alert(
        'Synced!',
        'Rotating categories updated:\n• Freedom Flex: ' +
          CATEGORY_LABELS[rotatingData['chase-freedom-flex'] as MerchantCategory] +
          '\n• Discover it: ' +
          CATEGORY_LABELS[rotatingData['discover-it'] as MerchantCategory]
      );
    } catch (e) {
      Alert.alert('Sync Failed', 'Could not fetch rotating categories. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSynced = (): string => {
    if (!settings.lastSynced) return 'Never';
    const d = new Date(settings.lastSynced);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stale = isSyncStale();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- ROTATING CATEGORIES SYNC ---- */}
        <View style={{ marginTop: 20, marginHorizontal: 16 }}>
          <SectionHeader title="Rotating Categories" />

          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 18,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a2e' }}>
                  Auto-Sync Categories
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                  Last synced: {formatLastSynced()}
                </Text>
              </View>
              {stale && (
                <View
                  style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#d97706' }}>
                    STALE
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSync}
              disabled={syncing}
              style={{
                backgroundColor: syncing ? '#c7d2fe' : '#4f46e5',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {syncing ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    Syncing…
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  🔄  Sync Now
                </Text>
              )}
            </TouchableOpacity>

            {/* Manual overrides for rotating cards */}
            {ROTATING_CARD_IDS.map((cardId) => {
              const card = ALL_CARDS.find((c) => c.id === cardId);
              if (!card) return null;
              const currentRotating =
                settings.rotatingCategories[cardId] ?? card.rotatingCategory ?? null;

              return (
                <View
                  key={cardId}
                  style={{
                    marginTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    paddingTop: 14,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                    {card.name} — Current Rotating Category
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {ALL_CATEGORIES.filter((c) => c !== 'other').map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setRotatingCategory(cardId, cat)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            currentRotating === cat ? '#4f46e5' : '#f3f4f6',
                          marginRight: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: currentRotating === cat ? '#ffffff' : '#374151',
                          }}
                        >
                          {CATEGORY_LABELS[cat as MerchantCategory]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </View>

        {/* ---- CARD SELECTOR ---- */}
        <View style={{ marginTop: 28, marginHorizontal: 16 }}>
          <SectionHeader title="My Cards" />

          {ALL_CARDS.map((card) => {
            const owned = settings.ownedCardIds.includes(card.id);
            const isExpanded = expandedCard === card.id;
            const cppValue = settings.cppOverrides[card.id] ?? card.cppValue;

            return (
              <View
                key={card.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  marginBottom: 10,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Card row */}
                <TouchableOpacity
                  onPress={() => setExpandedCard(isExpanded ? null : card.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    minHeight: 72,
                  }}
                >
                  <CardChip card={card} size="md" />

                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text
                      style={{ fontSize: 15, fontWeight: '600', color: '#1a1a2e' }}
                      numberOfLines={1}
                    >
                      {card.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {card.issuer} · {cppValue.toFixed(2)}¢/pt
                    </Text>
                  </View>

                  <Switch
                    value={owned}
                    onValueChange={() => toggleCard(card.id)}
                    trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
                    thumbColor={owned ? '#4f46e5' : '#9ca3af'}
                  />
                </TouchableOpacity>

                {/* Expanded CPP editor */}
                {isExpanded && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingBottom: 16,
                      backgroundColor: '#fafafa',
                      borderTopWidth: 1,
                      borderTopColor: '#f3f4f6',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#6b7280',
                        marginTop: 12,
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      CPP Value (cents per point)
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: '#e0e7ff',
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text style={{ color: '#6b7280', fontSize: 16, marginRight: 4 }}>¢</Text>
                      <TextInput
                        value={String(cppValue)}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          if (!isNaN(num) && num > 0) {
                            setCppOverride(card.id, num);
                          }
                        }}
                        keyboardType="decimal-pad"
                        style={{
                          flex: 1,
                          fontSize: 17,
                          fontWeight: '600',
                          color: '#1a1a2e',
                          paddingVertical: 12,
                        }}
                        selectTextOnFocus
                        maxLength={5}
                      />
                      <TouchableOpacity
                        onPress={() => setCppOverride(card.id, card.cppValue)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ fontSize: 12, color: '#4f46e5', fontWeight: '600' }}>
                          Reset
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                      TPG baseline: {card.cppValue}¢
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Version info */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#d1d5db',
            marginTop: 24,
          }}
        >
          CardMax v1.0.0 · CPP values based on TPG
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
      }}
    >
      {title}
    </Text>
  );
}
