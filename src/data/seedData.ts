import { Store, Product } from '../types';

// Clean state: No pre-filled or placeholder example products or stores.
// Vendors register and add their own concrete pieces from scratch!
export const INITIAL_STORES: Store[] = [];
export const INITIAL_PRODUCTS: Product[] = [];

export const CURRENCY_RATES = {
  SAR: { rate: 1.0, symbol: 'SAR', symbolAr: 'ر.س', label: 'Saudi Riyal' },
  AED: { rate: 0.98, symbol: 'AED', symbolAr: 'د.إ', label: 'UAE Dirham' },
  EGP: { rate: 13.4, symbol: 'EGP', symbolAr: 'ج.م', label: 'Egyptian Pound' },
};

export function convertPrice(basePriceSAR: number, targetCurrency: keyof typeof CURRENCY_RATES): {
  amount: number;
  formatted: string;
} {
  const info = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.SAR;
  const converted = Math.round(basePriceSAR * info.rate);
  return {
    amount: converted,
    formatted: `${converted.toLocaleString()} ${info.symbol}`,
  };
}
