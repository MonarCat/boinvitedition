/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: 'KES')
 * @param locale The locale to use for formatting (default: 'en-KE')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = 'KES',
  locale: string = 'en-KE'
): string => {
  // For simple formatting without Intl (which might not be fully supported in all browsers)
  if (currency === 'KES') {
    return `KES ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Use Intl.NumberFormat for more complex formatting if available
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
};

/**
 * Format a percentage value
 * @param value The number to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
