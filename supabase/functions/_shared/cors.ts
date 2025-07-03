
import { supabase } from './supabase.ts';

// Get allowed origins from database configuration
const getAllowedOrigins = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('config_value')
      .eq('config_key', 'cors_origins')
      .single();
    
    if (error || !data) {
      // Fallback to secure defaults
      return [
        'https://boinvit.com',
        'https://app.boinvit.com',
        'http://localhost:3000',
        'http://localhost:5173'
      ];
    }
    
    return data.config_value as string[];
  } catch (error) {
    console.error('Failed to get CORS origins:', error);
    // Fallback to secure defaults
    return [
      'https://boinvit.com',
      'https://app.boinvit.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
  }
};

export const createSecureCorsHeaders = async (origin?: string): Promise<Record<string, string>> => {
  const allowedOrigins = await getAllowedOrigins();
  
  // Check if origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
};

// Legacy export for backward compatibility - but now secure
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://boinvit.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true'
};
