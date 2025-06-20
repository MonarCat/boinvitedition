
import { supabase } from '@/integrations/supabase/client';
import { generateBusinessSlug } from './businessSlug';

export interface BusinessValidationResult {
  isValid: boolean;
  issues: string[];
  business?: any;
  services?: any[];
  slug?: string;
}

export const validateBusinessSetup = async (businessId: string): Promise<BusinessValidationResult> => {
  const issues: string[] = [];
  let business = null;
  let services = null;
  let slug = '';

  try {
    // Check if business exists and is properly configured
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select(`
        id, 
        name, 
        description, 
        address, 
        phone, 
        email, 
        is_active,
        user_id,
        city,
        country,
        currency
      `)
      .eq('id', businessId)
      .single();

    if (businessError) {
      issues.push(`Business not found: ${businessError.message}`);
      return { isValid: false, issues };
    }

    business = businessData;
    slug = generateBusinessSlug(business.name);

    // Check required fields
    if (!business.name?.trim()) {
      issues.push('Business name is missing');
    }
    
    if (!business.description?.trim()) {
      issues.push('Business description is missing');
    }
    
    if (!business.phone?.trim()) {
      issues.push('Business phone number is missing');
    }
    
    if (!business.address?.trim()) {
      issues.push('Business address is missing');
    }

    if (!business.is_active) {
      issues.push('Business is not active');
    }

    if (!business.user_id) {
      issues.push('Business is not associated with a user');
    }

    // Check services
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes, is_active')
      .eq('business_id', businessId);

    if (servicesError) {
      issues.push(`Error fetching services: ${servicesError.message}`);
    } else {
      services = servicesData;
      const activeServices = servicesData?.filter(s => s.is_active) || [];
      
      if (activeServices.length === 0) {
        issues.push('No active services found - clients cannot book anything');
      }

      // Check service completeness
      activeServices.forEach((service, index) => {
        if (!service.name?.trim()) {
          issues.push(`Service ${index + 1}: Name is missing`);
        }
        if (!service.price || service.price <= 0) {
          issues.push(`Service ${index + 1}: Invalid price`);
        }
        if (!service.duration_minutes || service.duration_minutes <= 0) {
          issues.push(`Service ${index + 1}: Invalid duration`);
        }
      });
    }

    // Check business settings
    const { data: settings, error: settingsError } = await supabase
      .from('business_settings')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      issues.push(`Error fetching business settings: ${settingsError.message}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      business,
      services,
      slug
    };

  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, issues };
  }
};

export const getBusinessSetupCompleteness = (validation: BusinessValidationResult): number => {
  if (!validation.business) return 0;
  
  const checks = [
    !!validation.business.name?.trim(),
    !!validation.business.description?.trim(),
    !!validation.business.phone?.trim(),
    !!validation.business.address?.trim(),
    validation.business.is_active,
    !!validation.business.user_id,
    (validation.services?.filter(s => s.is_active) || []).length > 0
  ];
  
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};
