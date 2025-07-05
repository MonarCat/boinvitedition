
/**
 * Formats a number as currency in Kenyan Shillings (KES) only.
 * This ensures consistent currency display across the entire application.
 * 
 * @param amount The numeric amount to format
 * @param currency The currency code (ignored, always uses KES for consistency)
 * @returns Formatted currency string in KES
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  if (!amount && amount !== 0) return 'KES 0'; // Handle undefined/null values
  
  // Always format as KES regardless of input currency for consistency
  const formattedAmount = Math.abs(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `KES ${formattedAmount}`;
};

/**
 * Formats commission values (typically percentages)
 * 
 * @param rate The commission rate (0.05 for 5%)
 * @returns Formatted percentage string
 */
export const formatCommissionRate = (rate: number): string => {
  if (!rate && rate !== 0) return '0%'; // Handle undefined/null values
  
  // Convert decimal to percentage (0.05 -> 5%)
  return `${(rate * 100).toFixed(0)}%`;
};

/**
 * Parse currency string back to number (removes KES prefix and commas)
 * 
 * @param currencyString String like "KES 1,500"
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Remove KES prefix and commas, then parse
  const cleanedString = currencyString.replace(/KES\s?|,/g, '').trim();
  const parsed = parseFloat(cleanedString);
  
  return isNaN(parsed) ? 0 : parsed;
};
