
export const validatePayoutForm = (payoutSettings: {
  mpesa_number: string;
  airtel_number: string;
  bank_account_number: string;
  bank_name: string;
  account_holder_name: string;
}) => {
  const { mpesa_number, airtel_number, bank_account_number, bank_name, account_holder_name } = payoutSettings;
  
  // Check if at least one payment method is provided
  const hasMobilePayment = mpesa_number || airtel_number;
  const hasBankPayment = bank_account_number && bank_name && account_holder_name;
  
  if (!hasMobilePayment && !hasBankPayment) {
    return 'Please provide at least one payment method';
  }
  
  // Validate bank details if any bank field is filled
  if ((bank_account_number || bank_name || account_holder_name) && !hasBankPayment) {
    return 'Please complete all bank account details';
  }
  
  return null;
};
