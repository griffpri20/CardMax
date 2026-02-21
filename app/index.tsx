import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Merchant, MerchantCategory } from '../src/types';
import { getNearbyMerchants } from '../src/services/places';
import { MerchantRow } from '../src/components/MerchantRow';
import { useSettings } from '../src/hooks/useSettings';
import { ALL_CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from '../src/data/categories';

type ScreenState = 'idle' | 'requesting' | 'loading' | 'ready' | 'error';

export default function LocationScreen() {
  const router = useRouter();
  const { settings, isSyncStale } = useSettings();

  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNearbyMerchants();
  }, []);

  const fetchNearbyMerchants = useCallback(async () => {
    setScreenState('requesting');
    setErrorMessage('');

    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setScreenState('error');
      setErrorMessage('Location permission is required to find nearby merchants.');
      return;
    }

    setScreenState('loading');
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nearby = await getNearbyMerchants(
        location.coords.latitude,
        location.coords.longitude
      );

      setMerchants(nearby);
      setScreenState('ready');
    } catch (err) {
      setScreenState('error');
      setErrorMessage('Failed to load nearby merchants. Please try again.');
      console.error(err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNearbyMerchants();
    setRefreshing(false);
  }, [fetchNearbyMerchants]);

  const handleMerchantPress = (merchant: Merchant) => {
    router.push({
      pathname: '/results',
      params: {
        merchantName: merchant.name,
        category: merchant.category,
      },
    });
  };

  const handleManualCategory = (category: MerchantCategory) => {
    setShowCategoryPicker(false);
    router.push({
      pathname: '/results',
      params: {
        merchantName: CATEGORY_LABELS[category],
        category,
      },
    });
  };

  const goToSettings = () => {
    router.push('/settings');
  };

  // Stale sync banner
  const showStaleBanner = isSyncStale();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['bottom']}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#1a1a2e',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800' }}>
            CardMax
          </Text>
          <Text style={{ color: '#a5b4fc', fontSize: 13, marginTop: 2 }}>
            Find your best card
          </Text>
        </View>
        <TouchableOpacity
          onPress={goToSettings}
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 20,
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Stale sync banner */}
      {showStaleBanner && (
        <TouchableOpacity
          onPress={goToSettings}
          style={{
            backgroundColor: '#fef3c7',
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
          <Text style={{ flex: 1, fontSize: 13, color: '#92400e' }}>
            Rotating categories may be outdated. Tap to sync in Settings.
          </Text>
          <Text style={{ fontSize: 13, color: '#d97706', fontWeight: '600' }}>
            Sync →
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section title */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginHorizontal: 20,
            marginBottom: 12,
          }}
        >
          Nearby Merchants
        </Text>

        {/* Loading state */}
        {(screenState === 'requesting' || screenState === 'loading') && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={{ color: '#6b7280', marginTop: 16, fontSize: 15 }}>
              {screenState === 'requesting'
                ? 'Requesting location…'
                : 'Finding nearby merchants…'}
            </Text>
          </View>
        )}

        {/* Error state */}
        {screenState === 'error' && (
          <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📍</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1a1a2e',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Location Unavailable
            </Text>
            <Text
              style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}
            >
              {errorMessage}
            </Text>
            <TouchableOpacity
              onPress={fetchNearbyMerchants}
              style={{
                backgroundColor: '#4f46e5',
                borderRadius: 12,
                paddingHorizontal: 28,
                paddingVertical: 14,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Merchant list */}
        {screenState === 'ready' &&
          merchants.map((merchant) => (
            <MerchantRow
              key={merchant.placeId}
              merchant={merchant}
              onPress={handleMerchantPress}
            />
          ))}

        {/* Empty state */}
        {screenState === 'ready' && merchants.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={{ fontSize: 15, color: '#6b7280' }}>
              No merchants found nearby.
            </Text>
          </View>
        )}

        {/* Manual override button */}
        {(screenState === 'ready' || screenState === 'error') && (
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginHorizontal: 20,
                marginBottom: 12,
              }}
            >
              Or choose by category
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                marginHorizontal: 16,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#e0e7ff',
                borderStyle: 'dashed',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#eef2ff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 22 }}>🏷️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#4f46e5' }}>
                  Manual Category
                </Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  Pick a category to compare cards
                </Text>
              </View>
              <Text style={{ fontSize: 20, color: '#c7d2fe' }}>›</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          {/* Modal header */}
          <View
            style={{
              backgroundColor: '#1a1a2e',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700' }}>
              Choose Category
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: '#a5b4fc', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={ALL_CATEGORIES}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingVertical: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleManualCategory(item)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#ffffff',
                  marginHorizontal: 16,
                  marginVertical: 4,
                  borderRadius: 14,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 68,
                }}
              >
                <Text style={{ fontSize: 26, marginRight: 16 }}>
                  {CATEGORY_ICONS[item]}
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '500', color: '#1a1a2e' }}>
                  {CATEGORY_LABELS[item]}
                </Text>
                <Text style={{ fontSize: 20, color: '#c7d2fe', marginLeft: 'auto' }}>
                  ›
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
