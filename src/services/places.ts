import Constants from 'expo-constants';
import { Merchant, MerchantCategory } from '../types';
import { PLACES_TYPE_MAP } from '../data/categories';

const API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey as string | undefined;

const NEARBY_SEARCH_URL =
  'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

interface PlacesResult {
  place_id: string;
  name: string;
  types: string[];
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlacesResponse {
  results: PlacesResult[];
  status: string;
  error_message?: string;
}

function inferCategory(types: string[]): MerchantCategory {
  for (const type of types) {
    if (PLACES_TYPE_MAP[type]) {
      return PLACES_TYPE_MAP[type];
    }
  }
  return 'other';
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getNearbyMerchants(
  latitude: number,
  longitude: number,
  radius: number = 500
): Promise<Merchant[]> {
  if (!API_KEY) {
    // Return mock data when no API key is configured
    return getMockMerchants(latitude, longitude);
  }

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: radius.toString(),
    type: 'establishment',
    key: API_KEY,
  });

  const response = await fetch(`${NEARBY_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Places API HTTP error: ${response.status}`);
  }

  const data: PlacesResponse = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message ?? `Places API error: ${data.status}`);
  }

  const merchants: Merchant[] = data.results.slice(0, 5).map((place) => ({
    placeId: place.place_id,
    name: place.name,
    category: inferCategory(place.types),
    address: place.vicinity,
    distance: Math.round(
      haversineDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng)
    ),
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }));

  return merchants;
}

// Mock data for development / when API key is missing
function getMockMerchants(lat: number, lng: number): Merchant[] {
  return [
    {
      placeId: 'mock_1',
      name: 'Whole Foods Market',
      category: 'grocery',
      address: '123 Main St',
      distance: 45,
      lat,
      lng,
    },
    {
      placeId: 'mock_2',
      name: 'Chipotle Mexican Grill',
      category: 'dining',
      address: '456 Oak Ave',
      distance: 120,
      lat,
      lng,
    },
    {
      placeId: 'mock_3',
      name: 'Shell Gas Station',
      category: 'gas',
      address: '789 Elm Blvd',
      distance: 200,
      lat,
      lng,
    },
    {
      placeId: 'mock_4',
      name: 'CVS Pharmacy',
      category: 'drugstore',
      address: '321 Pine Rd',
      distance: 310,
      lat,
      lng,
    },
    {
      placeId: 'mock_5',
      name: 'Marriott Hotel',
      category: 'hotel',
      address: '555 Broadway',
      distance: 480,
      lat,
      lng,
    },
  ];
}
