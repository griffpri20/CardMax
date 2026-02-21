import { CreditCard, CardRanking, MerchantCategory } from '../types';
import { ALL_CARDS } from '../data/cards';

/**
 * Calculates the effective earn rate for a card at a given merchant category.
 * Returns earn rate in points-per-dollar.
 */
export function getEarnRate(
  card: CreditCard,
  category: MerchantCategory,
  rotatingCategoryOverride?: string | null
): number {
  // Check rotating category first (Freedom Flex / Discover it get 5% on rotating)
  const rotating = rotatingCategoryOverride !== undefined
    ? rotatingCategoryOverride
    : card.rotatingCategory;

  if (rotating && rotating === category) {
    return 5; // Both Freedom Flex and Discover it earn 5x/5% on rotating categories
  }

  // Check bonus categories
  const bonus = card.bonusCategories.find(
    (b) => b.category === category
  );
  if (bonus) {
    return bonus.earnRate;
  }

  return card.baseEarnRate;
}

/**
 * Pure function: given a merchant category and a list of card IDs the user owns,
 * returns all cards sorted by effectiveValue (highest first).
 *
 * effectiveValue = earnRate × cppValue (in cents per dollar)
 *
 * @param merchantCategory - The inferred category of the merchant
 * @param ownedCardIds - IDs of cards the user owns (from settings)
 * @param cppOverrides - User-defined CPP values that override TPG defaults
 * @param rotatingOverrides - User-synced rotating categories per card
 */
export function getBestCard(
  merchantCategory: MerchantCategory,
  ownedCardIds: string[],
  cppOverrides: Record<string, number> = {},
  rotatingOverrides: Record<string, string | null> = {}
): CardRanking[] {
  const ownedCards = ALL_CARDS.filter((c) => ownedCardIds.includes(c.id));

  const rankings: CardRanking[] = ownedCards.map((card) => {
    const cpp = cppOverrides[card.id] ?? card.cppValue;
    const earnRate = getEarnRate(card, merchantCategory, rotatingOverrides[card.id]);
    const effectiveValue = earnRate * cpp;

    return {
      card,
      earnRate,
      effectiveValue,
      isWinner: false,
    };
  });

  // Sort descending by effectiveValue, then by earnRate as tiebreaker
  rankings.sort((a, b) => {
    if (b.effectiveValue !== a.effectiveValue) {
      return b.effectiveValue - a.effectiveValue;
    }
    return b.earnRate - a.earnRate;
  });

  // Mark the winner
  if (rankings.length > 0) {
    rankings[0].isWinner = true;
  }

  return rankings;
}

/**
 * Formats effectiveValue as a display string: "8.0¢/dollar"
 */
export function formatEffectiveValue(effectiveValue: number): string {
  return `${effectiveValue.toFixed(1)}¢/dollar`;
}

/**
 * Formats earn rate as "3x points" or "3% cash back" depending on cpp
 */
export function formatEarnRate(card: CreditCard, earnRate: number): string {
  const isCashBack = card.cppValue === 1.0;
  if (isCashBack) {
    return `${earnRate}% cash back`;
  }
  return `${earnRate}x points`;
}
