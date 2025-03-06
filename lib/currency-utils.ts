// ISO 4217 currency codes
export const VALID_CURRENCIES = {
  XOF: {
    name: "West African CFA franc",
    flag: "/flags/xof.png"
  },
  USD: {
    name: "US Dollar",
    flag: "/flags/usd.png"
  },
  EUR: {
    name: "Euro",
    flag: "/flags/eur.png"
  },
  GBP: {
    name: "British Pound",
    flag: "/flags/gbp.png"
  },
  JPY: {
    name: "Japanese Yen",
    flag: "/flags/jpy.png"
  },
  MAD: {
    name: "Moroccan Dirham",
    flag: "/flags/mad.png"
  },
  CNY: {
    name: "Chinese Yuan",
    flag: "/flags/cny.png"
  },
  NGN: {
    name: "Nigerian Naira",
    flag: "/flags/ngn.png"
  },
  GHS: {
    name: "Ghanaian Cedi",
    flag: "/flags/ghs.png"
  },
  MRU: {
    name: "Mauritanian Ouguiya",
    flag: "/flags/mru.png"
  },
  AED: {
    name: "UAE Dirham",
    flag: "/flags/aed.png"
  },
  GMD: {
    name: "Gambian Dalasi",
    flag: "/flags/gmd.png"
  },
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

export function getCurrencyName(code: CurrencyCode): string {
  return VALID_CURRENCIES[code].name;
}

export function getCurrencyFlag(code: CurrencyCode): string {
  return VALID_CURRENCIES[code].flag;
} 