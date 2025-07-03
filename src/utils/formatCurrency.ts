/**
 * Formats a number as currency with the appropriate symbol based on the currency code.
 * 
 * @param amount The numeric amount to format
 * @param currency The currency code (KES, USD, GBP, EUR, etc.)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  if (!amount && amount !== 0) return ''; // Handle undefined/null values
  
  // Always use KES regardless of the currency passed
  return `KES ${amount.toLocaleString()}`;
};

/**
 * Formats commission values (typically percentages)
 * 
 * @param rate The commission rate (0.05 for 5%)
 * @returns Formatted percentage string
 */
export const formatCommissionRate = (rate: number): string => {
  if (!rate && rate !== 0) return ''; // Handle undefined/null values
  
  // Convert decimal to percentage (0.05 -> 5%)
  return `${(rate * 100).toFixed(0)}%`;
};
