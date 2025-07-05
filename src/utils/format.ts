
/**
 * Format a number as currency (KES only)
 * @param value The number to format
 * @returns Formatted currency string in KES
 */
export const formatCurrency = (
  value: number
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'KES 0.00';
  }

  // Always format as KES currency
  return `KES ${value.toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format a percentage value
 * @param value The number to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate platform commission (5% for all transactions)
 * @param amount The transaction amount
 * @returns Commission amount
 */
export const calculateCommission = (amount: number): number => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 0;
  }
  return amount * 0.05; // 5% commission
};

/**
 * Calculate business net amount after commission
 * @param amount The transaction amount
 * @returns Net amount after 5% commission deduction
 */
export const calculateNetAmount = (amount: number): number => {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 0;
  }
  return amount - calculateCommission(amount);
};
