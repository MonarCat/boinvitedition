interface CurrencyFormat {
  symbol: string;
  code: string;
  position: 'prefix' | 'suffix';
}

export const CURRENCY_FORMATS: Record<string, CurrencyFormat> = {
  KES: { symbol: 'KSh', code: 'KES', position: 'prefix' },
  USD: { symbol: '$', code: 'USD', position: 'prefix' },
  EUR: { symbol: '€', code: 'EUR', position: 'suffix' },
  GBP: { symbol: '£', code: 'GBP', position: 'prefix' },
  TZS: { symbol: 'TSh', code: 'TZS', position: 'prefix' },
  UGX: { symbol: 'USh', code: 'UGX', position: 'prefix' },
  RWF: { symbol: 'RF', code: 'RWF', position: 'prefix' },
  BIF: { symbol: 'FBu', code: 'BIF', position: 'prefix' },
  ETB: { symbol: 'Br', code: 'ETB', position: 'prefix' },
  NGN: { symbol: '₦', code: 'NGN', position: 'prefix' },
  ZAR: { symbol: 'R', code: 'ZAR', position: 'prefix' },
};

export const formatCurrency = (amount: number, currency: string): string => {
  const format = CURRENCY_FORMATS[currency] || CURRENCY_FORMATS.KES;
  const formattedAmount = amount.toLocaleString();
  
  return format.position === 'prefix' 
    ? `${format.symbol} ${formattedAmount}`
    : `${formattedAmount} ${format.symbol}`;
};
