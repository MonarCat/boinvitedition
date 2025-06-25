
export const validatePaymentSetup = (formData: {
  mpesa_number: string;
  bank_name: string;
  bank_account_number: string;
  account_holder_name: string;
  paystack_subaccount_code: string;
}) => {
  const hasValidPayment = formData.mpesa_number || 
    (formData.bank_name && formData.bank_account_number && formData.account_holder_name) ||
    formData.paystack_subaccount_code;

  if (!hasValidPayment) {
    return 'Please provide at least one payment method';
  }

  // Validate bank details if partially filled
  const bankFields = [formData.bank_name, formData.bank_account_number, formData.account_holder_name];
  const filledBankFields = bankFields.filter(field => field && field.trim());
  
  if (filledBankFields.length > 0 && filledBankFields.length < 3) {
    return 'Please complete all bank account details';
  }

  return null;
};
