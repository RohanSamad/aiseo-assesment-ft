import type { PriceTier } from '../types/venue';

export const PRICE_TIERS: Record<PriceTier, { price: number; label: string }> = {
  1: { price: 150, label: 'VIP' },
  2: { price: 100, label: 'Premium' },
  3: { price: 75, label: 'Standard' },
  4: { price: 50, label: 'Economy' },
};

export function getPrice(tier: PriceTier): number {
  return PRICE_TIERS[tier].price;
}

export function getPriceLabel(tier: PriceTier): string {
  return PRICE_TIERS[tier].label;
}
