export interface BonusCategory {
  category: string;
  earnRate: number; // points per dollar
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  color: string;       // hex color for card UI
  accentColor: string; // secondary color
  bonusCategories: BonusCategory[];
  baseEarnRate: number;      // points per dollar on everything else
  cppValue: number;          // cents per point (TPG baseline)
  rotatingCategory: string | null; // current rotating category if applicable
  network: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  annualFee: number;
}

export interface CardRanking {
  card: CreditCard;
  earnRate: number;
  effectiveValue: number; // cents per dollar (earnRate × cppValue)
  isWinner: boolean;
}

export interface Merchant {
  placeId: string;
  name: string;
  category: string;
  address: string;
  distance: number; // meters
  lat: number;
  lng: number;
}

export type MerchantCategory =
  | 'dining'
  | 'grocery'
  | 'travel'
  | 'gas'
  | 'drugstore'
  | 'streaming'
  | 'transit'
  | 'hotel'
  | 'flights'
  | 'entertainment'
  | 'online_shopping'
  | 'wholesale'
  | 'other';

export interface UserSettings {
  ownedCardIds: string[];
  cppOverrides: Record<string, number>;
  rotatingCategories: Record<string, string | null>;
  lastSynced: string | null;
}
