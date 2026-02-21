import { CreditCard } from '../types';

export const ALL_CARDS: CreditCard[] = [
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    color: '#1a1a1a',
    accentColor: '#c9a84c',
    network: 'Visa',
    annualFee: 550,
    baseEarnRate: 1,
    cppValue: 2.05, // TPG: Ultimate Rewards ~2.05¢
    rotatingCategory: null,
    bonusCategories: [
      { category: 'travel', earnRate: 3 },
      { category: 'hotel', earnRate: 10 },    // through Chase Travel
      { category: 'flights', earnRate: 5 },   // through Chase Travel
      { category: 'dining', earnRate: 3 },
    ],
  },
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    issuer: 'American Express',
    color: '#b8860b',
    accentColor: '#ffd700',
    network: 'Amex',
    annualFee: 325,
    baseEarnRate: 1,
    cppValue: 2.0, // TPG: MR ~2.0¢
    rotatingCategory: null,
    bonusCategories: [
      { category: 'dining', earnRate: 4 },
      { category: 'grocery', earnRate: 4 },   // US supermarkets, up to $25k/yr
      { category: 'flights', earnRate: 3 },   // booked directly with airlines
    ],
  },
  {
    id: 'amex-platinum',
    name: 'Amex Platinum',
    issuer: 'American Express',
    color: '#8a9ba8',
    accentColor: '#c0c0c0',
    network: 'Amex',
    annualFee: 695,
    baseEarnRate: 1,
    cppValue: 2.0,
    rotatingCategory: null,
    bonusCategories: [
      { category: 'flights', earnRate: 5 },   // booked directly or through Amex Travel
      { category: 'hotel', earnRate: 5 },     // through Amex Travel (prepaid)
      { category: 'transit', earnRate: 1 },
    ],
  },
  {
    id: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    color: '#1a3a6b',
    accentColor: '#4a90d9',
    network: 'Mastercard',
    annualFee: 0,
    baseEarnRate: 1,
    cppValue: 2.05,
    rotatingCategory: 'grocery', // updated via sync — current Q1 2025 example
    bonusCategories: [
      { category: 'dining', earnRate: 3 },
      { category: 'drugstore', earnRate: 3 },
      { category: 'travel', earnRate: 5 }, // via Chase Travel
    ],
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    color: '#1e3a5f',
    accentColor: '#6ab0f5',
    network: 'Visa',
    annualFee: 0,
    baseEarnRate: 1.5,
    cppValue: 2.05,
    rotatingCategory: null,
    bonusCategories: [
      { category: 'dining', earnRate: 3 },
      { category: 'drugstore', earnRate: 3 },
      { category: 'travel', earnRate: 5 }, // via Chase Travel
    ],
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    color: '#d4145a',
    accentColor: '#ff6b9d',
    network: 'Visa',
    annualFee: 395,
    baseEarnRate: 2,
    cppValue: 1.85, // TPG: Capital One miles ~1.85¢
    rotatingCategory: null,
    bonusCategories: [
      { category: 'travel', earnRate: 10 },   // hotels & rental cars via C1 Travel
      { category: 'flights', earnRate: 5 },   // via Capital One Travel
      { category: 'hotel', earnRate: 10 },
    ],
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    color: '#003087',
    accentColor: '#5b8dd9',
    network: 'Mastercard',
    annualFee: 0,
    baseEarnRate: 2, // 1% on purchase + 1% on payment
    cppValue: 1.0,  // flat cashback, 1¢ per point
    rotatingCategory: null,
    bonusCategories: [],
  },
  {
    id: 'discover-it',
    name: 'Discover it',
    issuer: 'Discover',
    color: '#f76f20',
    accentColor: '#ffa500',
    network: 'Discover',
    annualFee: 0,
    baseEarnRate: 1,
    cppValue: 1.0,  // cash back
    rotatingCategory: 'grocery', // Q1 2025 example — updated via sync
    bonusCategories: [
      { category: 'dining', earnRate: 1 },
    ],
  },
];

export const getCardById = (id: string): CreditCard | undefined =>
  ALL_CARDS.find((c) => c.id === id);

export const DEFAULT_OWNED_CARD_IDS = ALL_CARDS.map((c) => c.id);
