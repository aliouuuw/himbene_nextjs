// ISO 4217 currency codes
export const VALID_CURRENCIES = {
  XOF: "West African CFA franc",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  // Add more as needed
} as const;

export type CurrencyCode = keyof typeof VALID_CURRENCIES;

export function isValidCurrencyCode(code: string): code is CurrencyCode {
  return code in VALID_CURRENCIES;
}

export function formatCurrency(amount: number, currency: string, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function convertCurrency(amount: number, rate: number) {
  return Number((amount * rate).toFixed(2));
} 