
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QRCodeValidatorProps {
  businessId: string;
  onValidationResult: (isValid: boolean) => void;
  isValidating: boolean;
  setIsValidating: (validating: boolean) => void;
}

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const QRCodeValidator: React.FC<QRCodeValidatorProps> = ({
  businessId,
  onValidationResult,
  isValidating,
  setIsValidating
}) => {
  
  const validateBusiness = async () => {
    console.log('QR Validator: Starting validation for business:', businessId);
    
    if (!businessId) {
      console.log('QR Validator: No business ID provided');
      onValidationResult(false);
      return;
    }

    // Validate UUID format first
    if (!isValidUUID(businessId)) {
      console.log('QR Validator: Invalid UUID format');
      onValidationResult(false);
      toast.error('Invalid business ID format');
      return;
    }

    setIsValidating(true);
    
    try {
      // Check if business exists and is active
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, name, is_active')
        .eq('id', businessId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('QR Validator: Database error:', error);
        onValidationResult(false);
        toast.error('Failed to validate business');
        return;
      }

      if (!business) {
        console.log('QR Validator: Business not found or inactive');
        onValidationResult(false);
        toast.error('Business not found or inactive');
        return;
      }

      console.log('QR Validator: Business validated successfully:', business.name);
      onValidationResult(true);
      
    } catch (error) {
      console.error('QR Validator: Validation error:', error);
      onValidationResult(false);
      toast.error('Business validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      validateBusiness();
    }
  }, [businessId]);

  // This component doesn't render anything visible
  return null;
};
