// Currency Formatting Utilities

/**
 * Currency symbols mapping
 */
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency.toUpperCase()] || currency;
};

/**
 * Format amount with currency symbol
 * Examples:
 * - formatCurrency(1234.56, 'USD') → "$1,234.56"
 * - formatCurrency(1000, 'EUR') → "€1,000.00"
 * - formatCurrency(50, 'INR') → "₹50.00"
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  options?: {
    showSymbol?: boolean;
    decimals?: number;
    compact?: boolean;
  }
): string => {
  const {
    showSymbol = true,
    decimals = 2,
    compact = false,
  } = options || {};

  const symbol = getCurrencySymbol(currency);
  amount = Number(amount);

  // Compact format for large numbers (e.g., "1.2K", "3.5M")
  if (compact && amount >= 1000) {
    const units = ['', 'K', 'M', 'B'];
    let unitIndex = 0;
    let compactAmount = amount;

    while (compactAmount >= 1000 && unitIndex < units.length - 1) {
      compactAmount /= 1000;
      unitIndex++;
    }

    const formatted = compactAmount.toFixed(1).replace(/\.0$/, '');
    return showSymbol ? `${symbol}${formatted}${units[unitIndex]}` : `${formatted}${units[unitIndex]}`;
  }

  // Standard format with thousand separators
  const parts = amount.toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];

  const formatted = decimals > 0 ? `${integerPart}.${decimalPart}` : integerPart;

  return showSymbol ? `${symbol}${formatted}` : formatted;
};

/**
 * Format amount for input (no symbol, basic formatting)
 * Example: 1234.56 → "1,234.56"
 */
export const formatAmountInput = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return formatCurrency(numAmount, 'USD', { showSymbol: false });
};

/**
 * Parse currency input string to number
 * Examples:
 * - parseCurrencyInput("$1,234.56") → 1234.56
 * - parseCurrencyInput("1234.56") → 1234.56
 * - parseCurrencyInput("invalid") → 0
 */
export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols, commas, and whitespace
  const cleaned = input.replace(/[$€£¥₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format amount for display in lists (shorter format)
 * Examples:
 * - formatAmountShort(1234.56, 'USD') → "$1,234.56"
 * - formatAmountShort(1234567, 'USD') → "$1.23M"
 */
export const formatAmountShort = (amount: number, currency: string = 'USD'): string => {
  if (amount >= 10000) {
    return formatCurrency(amount, currency, { compact: true });
  }
  return formatCurrency(amount, currency);
};

/**
 * Format amount with sign (+ or -)
 * Example: formatAmountWithSign(-50, 'USD') → "-$50.00"
 */
export const formatAmountWithSign = (amount: number, currency: string = 'USD'): string => {
  const sign = amount >= 0 ? '+' : '';
  const absFormatted = formatCurrency(Math.abs(amount), currency);
  return amount >= 0 ? `${sign}${absFormatted}` : `-${absFormatted}`;
};

/**
 * Round to 2 decimal places (for money)
 */
export const roundAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};
